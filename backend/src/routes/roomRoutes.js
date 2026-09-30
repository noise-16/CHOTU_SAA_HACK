const express = require('express');
const prisma = require('../prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { broadcastQueueUpdate } = require('../services/socketService');

const router = express.Router();

/**
 * GET /api/rooms
 * Clinical Staff Only: View all OPD consultation rooms and doctor assignments
 */
router.get('/', authenticateToken, requireRole(['DOCTOR', 'NURSE', 'ADMIN']), async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        room: true,
        assignedPatients: {
          where: { status: { in: ['WAITING', 'IN_CONSULTATION'] } },
          select: {
            id: true,
            ticketNumber: true,
            name: true,
            acuityScore: true,
            priorityBand: true,
            status: true,
            waitTimeMinutes: true
          },
          orderBy: { acuityScore: 'desc' }
        }
      }
    });

    const rooms = doctors.map(doc => {
      const activePatient = doc.assignedPatients.find(p => p.status === 'IN_CONSULTATION');
      const waitingPatients = doc.assignedPatients.filter(p => p.status === 'WAITING');

      return {
        doctor: doc.name,
        doctorId: doc.id,
        room: doc.room || 'General OPD',
        status: activePatient ? 'OCCUPIED' : (waitingPatients.length > 0 ? 'CALLING_NEXT' : 'AVAILABLE'),
        currentPatient: activePatient || null,
        waitingCount: waitingPatients.length,
        nextPatient: waitingPatients[0] || null
      };
    });

    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms status.' });
  }
});

/**
 * POST /api/rooms/reassign
 * Nurses/Staff: Reassign a patient to another doctor / room with audit log
 */
router.post('/reassign', authenticateToken, requireRole(['NURSE', 'ADMIN']), async (req, res) => {
  try {
    const { patientId, targetDoctorId, justification } = req.body;

    if (!justification || justification.trim().length < 10) {
      return res.status(400).json({
        error: 'Mandatory transfer justification required (minimum 10 non-space characters).'
      });
    }

    const targetDoctor = await prisma.user.findUnique({ where: { id: targetDoctorId } });
    if (!targetDoctor) return res.status(404).json({ error: 'Target doctor not found.' });

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { assignedDoctor: true }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const prevDoctorName = patient.assignedDoctor?.name || 'Unassigned';

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: {
        assignedDoctorId: targetDoctor.id,
        room: targetDoctor.room,
        auditLogs: {
          create: {
            changedBy: req.user.name,
            role: req.user.role,
            action: 'DOCTOR_REASSIGNMENT',
            fieldChanged: 'Assigned Doctor & Room',
            oldValue: `${prevDoctorName} (${patient.room || 'None'})`,
            newValue: `${targetDoctor.name} (${targetDoctor.room || 'None'})`,
            justification: justification.trim()
          }
        }
      },
      include: {
        assignedDoctor: { select: { id: true, name: true, room: true } }
      }
    });

    broadcastQueueUpdate({
      action: 'DOCTOR_REASSIGNED',
      patientId,
      targetDoctor: targetDoctor.name,
      room: targetDoctor.room
    });

    res.json({ message: 'Patient reassigned successfully.', patient: updated });
  } catch (err) {
    console.error('Reassignment error:', err);
    res.status(500).json({ error: 'Failed to reassign patient.' });
  }
});

module.exports = router;
