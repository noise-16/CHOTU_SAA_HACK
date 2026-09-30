const express = require('express');
const prisma = require('../prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { evaluatePatientTriage } = require('../services/mlTriageService');
const { broadcastQueueUpdate, notifyPatient } = require('../services/socketService');

const router = express.Router();

/**
 * GET /api/patients/queue
 * Clinical Staff: View all patients in queue sorted by Acuity Score descending (highest urgency first)
 */
router.get('/queue', authenticateToken, requireRole(['DOCTOR', 'NURSE', 'ADMIN']), async (req, res) => {
  try {
    const { doctorId, room, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['WAITING', 'IN_CONSULTATION'] };
    }

    if (doctorId) where.assignedDoctorId = doctorId;
    if (room) where.room = room;

    const patients = await prisma.patient.findMany({
      where,
      include: {
        assignedDoctor: {
          select: { id: true, name: true, room: true }
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { acuityScore: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json(patients);
  } catch (err) {
    console.error('Error fetching queue:', err);
    res.status(500).json({ error: 'Failed to fetch queue data.' });
  }
});

/**
 * GET /api/patients/ticket/:ticketNumber
 * Patient Mobile App: Read-only access to specific personal ticket
 */
router.get('/ticket/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { ticketNumber },
      include: {
        assignedDoctor: {
          select: { name: true, room: true }
        },
        consultationSummary: true,
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Ticket not found. Please verify your ticket number.' });
    }

    // Calculate queue position among waiting patients
    const aheadCount = await prisma.patient.count({
      where: {
        status: 'WAITING',
        acuityScore: { gt: patient.acuityScore }
      }
    });

    // Sanitized patient view - NEVER expose internal clinical raw math or staff notes
    const sanitized = {
      id: patient.id,
      ticketNumber: patient.ticketNumber,
      name: patient.name,
      status: patient.status,
      assignedDoctor: patient.assignedDoctor?.name || 'Assigned on Call',
      room: patient.room || patient.assignedDoctor?.room || 'Waiting Lounge',
      queuePosition: aheadCount + 1,
      estimatedWaitMinutes: Math.max(5, (aheadCount + 1) * 12),
      consultationSummary: patient.consultationSummary,
      notifications: patient.notifications
    };

    res.json(sanitized);
  } catch (err) {
    console.error('Error fetching ticket:', err);
    res.status(500).json({ error: 'Failed to load ticket details.' });
  }
});

/**
 * GET /api/patients/:id
 * Clinical Staff: View full details of a specific patient
 */
router.get('/:id', authenticateToken, requireRole(['DOCTOR', 'NURSE', 'ADMIN']), async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        assignedDoctor: {
          select: { id: true, name: true, room: true }
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        },
        consultationSummary: true
      }
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient.' });
  }
});

/**
 * POST /api/patients
 * Nurses/Staff: Register a new patient and calculate initial ML triage score
 */
router.post('/', authenticateToken, requireRole(['NURSE', 'DOCTOR', 'ADMIN']), async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      chiefComplaint,
      reportedSymptoms = [],
      symptomSeverity = 'mild',
      onset = 'gradual',
      symptomsWorsening = false,
      duration,
      vitals = {},
      assignedDoctorId,
      room,
      forceConfirm = false
    } = req.body;

    if (!name || !age || !chiefComplaint) {
      return res.status(400).json({ error: 'Name, age, and chief complaint are required.' });
    }

    // Run ML Acuity & Anomaly Evaluation
    const triageEval = evaluatePatientTriage({
      symptomSeverity,
      onset,
      symptomsWorsening,
      vitals,
      reportedSymptoms,
      age: parseInt(age, 10)
    });

    // If anomaly flagged and staff has not explicitly acknowledged it
    if (triageEval.hasAnomaly && !forceConfirm) {
      return res.status(200).json({
        anomalyDetected: true,
        anomalyFlag: triageEval.anomalyFlag,
        anomalySuggested: triageEval.anomalySuggested,
        preliminaryScore: triageEval.acuityScore,
        preliminaryBand: triageEval.priorityBand,
        message: 'Clinical anomaly flagged. Please review and confirm or adjust values.'
      });
    }

    // Generate unique ticket number (e.g., CW-108)
    const count = await prisma.patient.count();
    const ticketNumber = `CW-${101 + count}`;

    const newPatient = await prisma.patient.create({
      data: {
        ticketNumber,
        name,
        age: parseInt(age, 10),
        gender,
        phone,
        chiefComplaint,
        reportedSymptoms: JSON.stringify(reportedSymptoms),
        symptomSeverity,
        onset,
        symptomsWorsening,
        duration,
        heartRate: vitals.heartRate ? parseInt(vitals.heartRate, 10) : null,
        systolicBp: vitals.systolicBp ? parseInt(vitals.systolicBp, 10) : null,
        diastolicBp: vitals.diastolicBp ? parseInt(vitals.diastolicBp, 10) : null,
        spo2: vitals.spo2 ? parseInt(vitals.spo2, 10) : null,
        temperatureC: vitals.temperatureC ? parseFloat(vitals.temperatureC) : null,
        painScore: vitals.painScore ? parseInt(vitals.painScore, 10) : 0,
        acuityScore: triageEval.acuityScore,
        priorityBand: triageEval.priorityBand,
        triageReasoning: triageEval.triageReasoning,
        anomalyFlag: triageEval.anomalyFlag,
        anomalySuggested: triageEval.anomalySuggested,
        assignedDoctorId: assignedDoctorId || null,
        room: room || null,
        auditLogs: {
          create: {
            changedBy: req.user.name,
            role: req.user.role,
            action: 'PATIENT_INTAKE',
            justification: 'Initial OPD triage evaluation recorded at reception.'
          }
        }
      },
      include: {
        assignedDoctor: { select: { name: true, room: true } }
      }
    });

    broadcastQueueUpdate({ action: 'PATIENT_REGISTERED', patientId: newPatient.id });

    res.status(201).json(newPatient);
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: 'Failed to register patient.' });
  }
});

/**
 * PATCH /api/patients/:id/vitals
 * Nurses: Update patient vitals with mandatory justification and real-time Socket.io broadcast
 */
router.patch('/:id/vitals', authenticateToken, requireRole(['NURSE', 'DOCTOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vitals = {},
      symptomSeverity,
      symptomsWorsening,
      justification,
      forceConfirm = false
    } = req.body;

    if (!justification || justification.trim().length < 10) {
      return res.status(400).json({
        error: 'Mandatory clinical rationale required (minimum 10 non-space characters).'
      });
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    // Merged vitals
    const mergedVitals = {
      heartRate: vitals.heartRate !== undefined ? parseInt(vitals.heartRate, 10) : patient.heartRate,
      systolicBp: vitals.systolicBp !== undefined ? parseInt(vitals.systolicBp, 10) : patient.systolicBp,
      diastolicBp: vitals.diastolicBp !== undefined ? parseInt(vitals.diastolicBp, 10) : patient.diastolicBp,
      spo2: vitals.spo2 !== undefined ? parseInt(vitals.spo2, 10) : patient.spo2,
      temperatureC: vitals.temperatureC !== undefined ? parseFloat(vitals.temperatureC) : patient.temperatureC,
      painScore: vitals.painScore !== undefined ? parseInt(vitals.painScore, 10) : patient.painScore
    };

    const updatedSeverity = symptomSeverity || patient.symptomSeverity;
    const updatedWorsening = symptomsWorsening !== undefined ? symptomsWorsening : patient.symptomsWorsening;

    // Check ML Anomaly Detection
    const triageEval = evaluatePatientTriage({
      symptomSeverity: updatedSeverity,
      onset: patient.onset,
      symptomsWorsening: updatedWorsening,
      vitals: mergedVitals,
      reportedSymptoms: patient.reportedSymptoms,
      age: patient.age,
      waitTimeMinutes: patient.waitTimeMinutes
    });

    if (triageEval.hasAnomaly && !forceConfirm) {
      return res.status(200).json({
        anomalyDetected: true,
        anomalyFlag: triageEval.anomalyFlag,
        anomalySuggested: triageEval.anomalySuggested,
        message: 'Typo/anomaly detected in updated values. Please confirm.'
      });
    }

    // Build diff description for audit trail
    const changes = [];
    if (vitals.heartRate !== undefined && vitals.heartRate !== patient.heartRate) {
      changes.push(`HR: ${patient.heartRate || '--'} -> ${vitals.heartRate} bpm`);
    }
    if (vitals.systolicBp !== undefined && vitals.systolicBp !== patient.systolicBp) {
      changes.push(`BP: ${patient.systolicBp || '--'} -> ${vitals.systolicBp} mmHg`);
    }
    if (vitals.spo2 !== undefined && vitals.spo2 !== patient.spo2) {
      changes.push(`SpO2: ${patient.spo2 || '--'}% -> ${vitals.spo2}%`);
    }
    if (symptomSeverity && symptomSeverity !== patient.symptomSeverity) {
      changes.push(`Severity: ${patient.symptomSeverity} -> ${symptomSeverity}`);
    }

    const fieldSummary = changes.join(', ') || 'Vitals update';

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...mergedVitals,
        symptomSeverity: updatedSeverity,
        symptomsWorsening: updatedWorsening,
        acuityScore: triageEval.acuityScore,
        priorityBand: triageEval.priorityBand,
        triageReasoning: triageEval.triageReasoning,
        anomalyFlag: triageEval.anomalyFlag,
        anomalySuggested: triageEval.anomalySuggested,
        auditLogs: {
          create: {
            changedBy: req.user.name,
            role: req.user.role,
            action: 'NURSE_VITALS_EDIT',
            fieldChanged: fieldSummary,
            oldValue: `Score: ${patient.acuityScore} (${patient.priorityBand})`,
            newValue: `Score: ${triageEval.acuityScore} (${triageEval.priorityBand})`,
            justification: justification.trim()
          }
        }
      },
      include: {
        assignedDoctor: { select: { id: true, name: true, room: true } },
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 5 }
      }
    });

    // Real-time broadcast
    broadcastQueueUpdate({
      action: 'VITALS_UPDATED',
      patientId: updatedPatient.id,
      acuityScore: updatedPatient.acuityScore,
      priorityBand: updatedPatient.priorityBand
    });

    res.json(updatedPatient);
  } catch (err) {
    console.error('Error updating vitals:', err);
    res.status(500).json({ error: 'Failed to update vitals.' });
  }
});

/**
 * POST /api/patients/:id/consultation (Doctor "Mark Seen")
 * Doctors: Record clinical diagnosis, prescriptions, follow-up, and discharge patient
 */
router.post('/:id/consultation', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      prescriptions,
      followUpTimeframe,
      referrals,
      notes
    } = req.body;

    if (!diagnosis || !followUpTimeframe) {
      return res.status(400).json({
        error: 'Diagnosis and Follow-up timeframe are mandatory to complete consultation.'
      });
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    // Format prescriptions to string
    const presText = typeof prescriptions === 'object' ? JSON.stringify(prescriptions) : String(prescriptions || '');

    // Execute transaction: create summary, update patient status, create notification, log audit
    const result = await prisma.$transaction(async (tx) => {
      const summary = await tx.consultationSummary.create({
        data: {
          patientId: id,
          doctorId: req.user.id,
          diagnosis,
          prescriptions: presText,
          followUpTimeframe,
          referrals: referrals || null,
          notes: notes || null
        }
      });

      const updated = await tx.patient.update({
        where: { id },
        data: {
          status: 'DISCHARGED'
        }
      });

      const notif = await tx.notification.create({
        data: {
          patientId: id,
          title: 'Consultation Complete — Advice Ready',
          message: `Dr. ${req.user.name} has concluded your consultation. Diagnosis: ${diagnosis}. Follow-up: ${followUpTimeframe}.`,
          type: 'DISCHARGE'
        }
      });

      await tx.auditLog.create({
        data: {
          patientId: id,
          changedBy: req.user.name,
          role: 'DOCTOR',
          action: 'MARK_SEEN_DISCHARGE',
          justification: `Consultation finalized. Diagnosis: ${diagnosis}.`
        }
      });

      return { summary, updated, notif };
    });

    // Real-time notification straight to the patient mobile app
    notifyPatient(id, 'patient:discharged', {
      patientId: id,
      title: 'Appointment Finalized',
      diagnosis,
      prescriptions: presText,
      followUpTimeframe,
      doctorName: req.user.name
    });

    broadcastQueueUpdate({ action: 'PATIENT_DISCHARGED', patientId: id });

    res.json({
      message: 'Consultation recorded and patient discharged successfully.',
      ...result
    });
  } catch (err) {
    console.error('Error completing consultation:', err);
    res.status(500).json({ error: 'Failed to record consultation summary.' });
  }
});

module.exports = router;
