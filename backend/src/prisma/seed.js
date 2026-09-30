const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { evaluateTriage } = require('../services/triageEngine');

async function main() {
  console.log('Seeding CareWell Hospital clinical database with requested accounts...');

  // Passwords
  const docPass = await bcrypt.hash('doc123', 10);
  const nursePass = await bcrypt.hash('nurse123', 10);
  const patientPass = await bcrypt.hash('patient123', 10);
  const legacyPass = await bcrypt.hash('password123', 10);

  // 1. Primary requested seed accounts
  const primaryDoctor = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: { password: docPass, role: 'DOCTOR', room: 'Room 1' },
    create: {
      email: 'doctor@hospital.com',
      password: docPass,
      name: 'Dr. Sarah Jenkins',
      role: 'DOCTOR',
      room: 'Room 1',
      phone: '+1 555-0192'
    }
  });

  const primaryNurse = await prisma.user.upsert({
    where: { email: 'nurse@hospital.com' },
    update: { password: nursePass, role: 'NURSE' },
    create: {
      email: 'nurse@hospital.com',
      password: nursePass,
      name: 'Nurse Priya',
      role: 'NURSE',
      phone: '+1 555-0193'
    }
  });

  await prisma.user.upsert({
    where: { email: 'patient@hospital.com' },
    update: { password: patientPass, role: 'PATIENT' },
    create: {
      email: 'patient@hospital.com',
      password: patientPass,
      name: 'John Doe (Patient)',
      role: 'PATIENT',
      phone: '+1 555-0194'
    }
  });

  // Additional doctor specialists
  const drPatel = await prisma.user.upsert({
    where: { email: 'patel@carewell.org' },
    update: {},
    create: {
      email: 'patel@carewell.org',
      password: legacyPass,
      name: 'Dr. Patel',
      role: 'DOCTOR',
      room: 'Room 2',
      phone: '+1 555-0195'
    }
  });

  const drKhan = await prisma.user.upsert({
    where: { email: 'khan@carewell.org' },
    update: {},
    create: {
      email: 'khan@carewell.org',
      password: legacyPass,
      name: 'Dr. Khan',
      role: 'DOCTOR',
      room: 'Room 3',
      phone: '+1 555-0196'
    }
  });

  console.log('User Accounts Configured:');
  console.log(' - Doctor:  doctor@hospital.com / doc123 (Room 1)');
  console.log(' - Nurse:   nurse@hospital.com  / nurse123 (Central Triage)');
  console.log(' - Patient: patient@hospital.com / patient123');

  // 2. Initial OPD Patient Cases
  const initialCases = [
    {
      ticketNumber: 'CW-101',
      name: 'A. Sharma',
      age: 61,
      gender: 'Male',
      phone: '+1 555-0101',
      chiefComplaint: 'Acute substernal chest pressure radiating to left arm, cold diaphoresis',
      reportedSymptoms: ['chest_pain', 'sweating', 'difficulty_breathing'],
      symptomSeverity: 'severe',
      onset: 'sudden',
      symptomsWorsening: true,
      duration: '45 mins',
      vitals: { heartRate: 124, systolicBp: 88, spo2: 89, temperatureC: 37.1, painScore: 9 },
      assignedDoctorId: primaryDoctor.id,
      room: 'Room 1',
      waitTimeMinutes: 8
    },
    {
      ticketNumber: 'CW-102',
      name: 'T. Rao',
      age: 34,
      gender: 'Female',
      phone: '+1 555-0102',
      chiefComplaint: 'Mild throat soreness and low-grade fever (Demonstrator Case for Live Nurse Edit)',
      reportedSymptoms: ['sore_throat', 'fever'],
      symptomSeverity: 'mild',
      onset: 'gradual',
      symptomsWorsening: false,
      duration: '2 days',
      vitals: { heartRate: 82, systolicBp: 120, spo2: 98, temperatureC: 37.8, painScore: 2 },
      assignedDoctorId: primaryDoctor.id,
      room: 'Room 1',
      waitTimeMinutes: 12
    },
    {
      ticketNumber: 'CW-103',
      name: 'S. Gupta',
      age: 72,
      gender: 'Female',
      phone: '+1 555-0103',
      chiefComplaint: 'Sudden dizzy spells and near-syncope with exertion',
      reportedSymptoms: ['dizziness', 'weakness'],
      symptomSeverity: 'moderate',
      onset: 'sudden',
      symptomsWorsening: true,
      duration: '3 hours',
      vitals: { heartRate: 52, systolicBp: 96, spo2: 94, temperatureC: 36.8, painScore: 3 },
      assignedDoctorId: drPatel.id,
      room: 'Room 2',
      waitTimeMinutes: 15
    },
    {
      ticketNumber: 'CW-104',
      name: 'R. Verma',
      age: 45,
      gender: 'Male',
      phone: '+1 555-0104',
      chiefComplaint: 'Colicky right upper quadrant abdominal pain post-meal',
      reportedSymptoms: ['abdominal_pain', 'nausea'],
      symptomSeverity: 'moderate',
      onset: 'gradual',
      symptomsWorsening: false,
      duration: '6 hours',
      vitals: { heartRate: 88, systolicBp: 138, spo2: 97, temperatureC: 38.2, painScore: 6 },
      assignedDoctorId: drPatel.id,
      room: 'Room 2',
      waitTimeMinutes: 20
    },
    {
      ticketNumber: 'CW-105',
      name: 'M. Khan',
      age: 28,
      gender: 'Male',
      phone: '+1 555-0105',
      chiefComplaint: 'Unilateral throbbing headache with photophobia',
      reportedSymptoms: ['headache', 'sensitivity_to_light'],
      symptomSeverity: 'mild',
      onset: 'gradual',
      symptomsWorsening: false,
      duration: '1 day',
      vitals: { heartRate: 74, systolicBp: 118, spo2: 99, temperatureC: 37.0, painScore: 5 },
      assignedDoctorId: drKhan.id,
      room: 'Room 3',
      waitTimeMinutes: 25
    }
  ];

  for (const c of initialCases) {
    const triage = evaluateTriage({
      symptomSeverity: c.symptomSeverity,
      onset: c.onset,
      symptomsWorsening: c.symptomsWorsening,
      vitals: c.vitals,
      reportedSymptoms: c.reportedSymptoms,
      chiefComplaint: c.chiefComplaint,
      age: c.age,
      waitTimeMinutes: c.waitTimeMinutes
    });

    await prisma.patient.upsert({
      where: { ticketNumber: c.ticketNumber },
      update: {
        assignedDoctorId: c.assignedDoctorId,
        room: c.room,
        acuityScore: triage.acuityScore,
        priorityBand: triage.priorityBand,
        triageReasoning: triage.rationale
      },
      create: {
        ticketNumber: c.ticketNumber,
        name: c.name,
        age: c.age,
        gender: c.gender,
        phone: c.phone,
        chiefComplaint: c.chiefComplaint,
        reportedSymptoms: JSON.stringify(c.reportedSymptoms),
        symptomSeverity: c.symptomSeverity,
        onset: c.onset,
        symptomsWorsening: c.symptomsWorsening,
        duration: c.duration,
        heartRate: c.vitals.heartRate,
        systolicBp: c.vitals.systolicBp,
        spo2: c.vitals.spo2,
        temperatureC: c.vitals.temperatureC,
        painScore: c.vitals.painScore,
        acuityScore: triage.acuityScore,
        priorityBand: triage.priorityBand,
        triageReasoning: triage.rationale,
        anomalyFlag: triage.anomalyFlag,
        assignedDoctorId: c.assignedDoctorId,
        room: c.room,
        waitTimeMinutes: c.waitTimeMinutes,
        auditLogs: {
          create: {
            changedBy: 'Nurse Priya',
            role: 'NURSE',
            action: 'PATIENT_INTAKE',
            justification: 'Initial OPD intake and intelligent triage evaluation recorded.'
          }
        }
      }
    });

    console.log(`Synced patient ${c.ticketNumber} (${c.name}) - ESI Level: ${triage.priorityScore} (${triage.level}) [${triage.acuityScore}/100]`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
