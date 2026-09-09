/**
 * ClearQueue Smart Scheduling Engine
 * 
 * Hierarchy of Ordering:
 * 1. Primary: Clinical severity / urgency (Strictly non-negotiable — efficiency never overrides urgency).
 * 2. Secondary: Overdue escalation timer status (§14), waiting time fairness (prevents starvation), doctor availability, estimated duration.
 */

export const OPD_DOCTORS = [
  { id: 'dr-sharma', name: 'Dr. Sharma', room: 'Room 1', role: 'Lead OPD Physician', maxDailyMinutes: 240 },
  { id: 'dr-patel', name: 'Dr. Patel', room: 'Room 2', role: 'General Physician', maxDailyMinutes: 240 },
  { id: 'dr-khan', name: 'Dr. Khan', room: 'Room 3', role: 'Acute Care Physician', maxDailyMinutes: 240 }
];

export const TOTAL_OPD_SESSION_MINUTES = 240; // 4-hour clinic session (9:00 AM - 1:00 PM)

/**
 * Prioritizes and schedules all active patients.
 * @param {Array} patients List of scored patient cases
 * @param {Date} [currentTime] Reference time for schedule generation
 * @returns {Object} { scheduledQueue, nextPatient, roomStatusList, utilisation, timelineSlots }
 */
export function generateOPDSchedule(patients, currentTime = new Date()) {
  const activePatients = patients.filter(p => p.status !== 'seen');
  const seenPatients = patients.filter(p => p.status === 'seen');

  // Severity tier weights for strict ranking
  const bandHierarchy = {
    critical: 6,
    needs_assessment: 5, // Needs assessment bubbled near top for nurse capture
    high: 4,
    moderate: 3,
    routine: 2,
    stable: 1
  };

  // Sort queue: Primary = Clinical Severity, Secondary = Escalation Timer & Waiting Time Fairness
  const scheduledQueue = [...activePatients].sort((a, b) => {
    const tierA = bandHierarchy[a.band.id] || 1;
    const tierB = bandHierarchy[b.band.id] || 1;

    if (tierA !== tierB) {
      return tierB - tierA; // Clinical urgency is strictly dominant
    }

    // Within same tier: Overdue patients escalate to the top of this tier (§14)
    const overdueA = a.waitStatus?.isOverdue ? 1 : 0;
    const overdueB = b.waitStatus?.isOverdue ? 1 : 0;
    if (overdueA !== overdueB) {
      return overdueB - overdueA;
    }

    // Secondary fairness: blend score and waiting minutes
    const waitA = Number(a.wait_time_minutes) || 0;
    const waitB = Number(b.wait_time_minutes) || 0;
    const rankMetricA = a.score + (waitA * 0.5);
    const rankMetricB = b.score + (waitB * 0.5);

    return rankMetricB - rankMetricA;
  });

  // Assign estimated durations, queue positions, and calculate estimated start times
  let cumulativeMinutes = 0;

  const enrichedQueue = scheduledQueue.map((patient, index) => {
    let estDuration = Number(patient.estimated_duration) || 15;
    if (!patient.estimated_duration) {
      if (patient.band.id === 'critical') estDuration = 25;
      else if (patient.band.id === 'high') estDuration = 20;
      else if (patient.band.id === 'needs_assessment') estDuration = 15;
      else if (patient.band.id === 'moderate') estDuration = 15;
      else estDuration = 10;
    }

    // Ensure assignedDoctor exists; default to Dr. Sharma if unassigned
    const assignedDoctor = patient.assignedDoctor || 'Dr. Sharma';
    const doctorObj = OPD_DOCTORS.find(d => d.name === assignedDoctor) || OPD_DOCTORS[0];
    const assignedRoom = doctorObj.room;

    // Calculate estimated start time
    const patientSlotDate = new Date(currentTime.getTime() + cumulativeMinutes * 60000);
    const estimatedStartTime = formatTime(patientSlotDate);

    cumulativeMinutes += estDuration;

    return {
      ...patient,
      queuePosition: index + 1,
      assignedDoctor,
      assignedRoom,
      estimated_duration: estDuration,
      estimatedStartTime,
      estimatedMinutesAway: cumulativeMinutes - estDuration
    };
  });

  // Identify global next patient
  const nextPatient = enrichedQueue.length > 0 ? enrichedQueue[0] : null;

  // Compute room statuses
  const roomStatusList = OPD_DOCTORS.map((doc) => {
    const patientInRoom = enrichedQueue.find(p => p.assignedDoctor === doc.name);
    let status = 'available';
    let currentPatientInfo = null;

    if (patientInRoom) {
      if (patientInRoom.queuePosition === 1 || patientInRoom.status === 'in_progress') {
        status = 'in_consultation';
        currentPatientInfo = `${patientInRoom.id} (${patientInRoom.name})`;
      } else {
        status = 'waiting';
        currentPatientInfo = `${patientInRoom.id} (Est. ${patientInRoom.estimatedStartTime})`;
      }
    }

    return {
      name: doc.room,
      doctor: doc.name,
      doctorRole: doc.role,
      status,
      currentPatientInfo
    };
  });

  // Calculate Global Utilisation metrics
  let patientFacingMinutes = 0;
  seenPatients.forEach(p => { patientFacingMinutes += Number(p.estimated_duration) || 15; });
  enrichedQueue.forEach(p => { patientFacingMinutes += Number(p.estimated_duration) || 15; });

  const cappedFacingTime = Math.min(patientFacingMinutes, TOTAL_OPD_SESSION_MINUTES * OPD_DOCTORS.length);
  const totalAvailableTime = TOTAL_OPD_SESSION_MINUTES * OPD_DOCTORS.length;
  const utilisationPercentage = Math.min(100, Math.round((cappedFacingTime / totalAvailableTime) * 100));
  const idleGapMinutes = Math.max(0, totalAvailableTime - patientFacingMinutes);

  const utilisation = {
    patientFacingMinutes,
    availableOPDMinutes: totalAvailableTime,
    utilisationPercentage,
    idleGapMinutes,
    patientsSeenCount: seenPatients.length,
    activeWaitingCount: activePatients.length
  };

  // Generate Daily Schedule Timeline slots
  const timelineSlots = [];
  seenPatients.slice(0, 3).forEach((sp, idx) => {
    timelineSlots.push({
      slotType: 'completed',
      timeLabel: `09:${15 + idx * 20} AM`,
      patientId: sp.id,
      patientName: sp.name,
      reason: sp.chief_complaint,
      band: sp.band,
      doctor: sp.assignedDoctor || 'Dr. Sharma',
      room: sp.assignedRoom || 'Room 1',
      badge: 'Completed'
    });
  });

  enrichedQueue.forEach((ep) => {
    timelineSlots.push({
      slotType: ep.queuePosition === 1 ? 'current' : 'upcoming',
      timeLabel: ep.estimatedStartTime,
      patientId: ep.id,
      patientName: ep.name,
      reason: ep.chief_complaint,
      band: ep.band,
      doctor: ep.assignedDoctor,
      room: ep.assignedRoom,
      duration: ep.estimated_duration,
      badge: ep.queuePosition === 1 ? 'Next Patient' : `Pos #${ep.queuePosition}`
    });
  });

  return {
    scheduledQueue: enrichedQueue,
    nextPatient,
    roomStatusList,
    utilisation,
    timelineSlots
  };
}

/**
 * Filters the global schedule for a specific doctor (§11)
 * Displays ONLY:
 * - Next patient assigned to that doctor
 * - Queue of only that doctor's patients
 * - That doctor's consultation schedule
 * - That doctor's utilisation statistics
 */
export function getDoctorSchedule(globalSchedule, doctorName) {
  const doctorQueue = globalSchedule.scheduledQueue.filter(p => p.assignedDoctor === doctorName);
  
  // Re-index queue positions for this doctor specifically
  const enrichedDoctorQueue = doctorQueue.map((p, idx) => ({
    ...p,
    doctorQueuePosition: idx + 1
  }));

  const nextPatient = enrichedDoctorQueue.length > 0 ? enrichedDoctorQueue[0] : null;

  // Filter timeline slots for this doctor
  const doctorTimeline = globalSchedule.timelineSlots.filter(s => s.doctor === doctorName);

  // Compute this doctor's utilisation
  let patientFacingMinutes = 0;
  enrichedDoctorQueue.forEach(p => { patientFacingMinutes += Number(p.estimated_duration) || 15; });

  const sessionMinutes = TOTAL_OPD_SESSION_MINUTES;
  const cappedFacingTime = Math.min(patientFacingMinutes, sessionMinutes);
  const utilisationPercentage = Math.min(100, Math.round((cappedFacingTime / sessionMinutes) * 100));
  const idleGapMinutes = Math.max(0, sessionMinutes - patientFacingMinutes);

  const doctorUtilisation = {
    patientFacingMinutes,
    availableOPDMinutes: sessionMinutes,
    utilisationPercentage,
    idleGapMinutes,
    patientsSeenCount: globalSchedule.timelineSlots.filter(s => s.slotType === 'completed' && s.doctor === doctorName).length,
    activeWaitingCount: enrichedDoctorQueue.length
  };

  const doctorRoomObj = OPD_DOCTORS.find(d => d.name === doctorName) || OPD_DOCTORS[0];

  return {
    doctorName,
    doctorRoom: doctorRoomObj.room,
    doctorRole: doctorRoomObj.role,
    scheduledQueue: enrichedDoctorQueue,
    nextPatient,
    timelineSlots: doctorTimeline,
    utilisation: doctorUtilisation
  };
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
}
