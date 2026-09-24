/**
 * Mock Rooms Configuration for CareWell Hospital OPD & Triage
 * Manages consultation rooms, acute intervention bays, and observation units.
 */

export const INITIAL_ROOMS = [
  {
    id: 'room-1',
    number: 'Room 1',
    name: 'Lead OPD Consultation Suite',
    category: 'consultation',
    inCharge: 'Dr. Sharma',
    roleTitle: 'Lead OPD Physician',
    status: 'occupied', // 'available' | 'occupied' | 'turnover'
    currentOccupantId: 'P-1001', // A. Sharma (Critical chest pain)
    sessionStartTime: '09:15 AM',
    elapsedMinutes: 18,
    equipment: ['ECG Monitor', 'Oxygen Port', 'Defibrillator Ready', 'Pulse Oximeter'],
    roomTypeLabel: 'Consultation Suite'
  },
  {
    id: 'room-2',
    number: 'Room 2',
    name: 'Primary Care & Family Medicine',
    category: 'consultation',
    inCharge: 'Dr. Patel',
    roleTitle: 'General Physician',
    status: 'occupied',
    currentOccupantId: 'P-1006', // J. Patel (Abdominal Guarding)
    sessionStartTime: '09:25 AM',
    elapsedMinutes: 8,
    equipment: ['Ultrasound Portable', 'Stethoscope Telemetry', 'Glucometer'],
    roomTypeLabel: 'Primary Care'
  },
  {
    id: 'room-3',
    number: 'Room 3',
    name: 'Acute Intervention & Rapid Triage',
    category: 'acute',
    inCharge: 'Dr. Khan',
    roleTitle: 'Acute Care Physician',
    status: 'occupied',
    currentOccupantId: 'P-1004', // S. Khan (Acute Dyspnea)
    sessionStartTime: '09:10 AM',
    elapsedMinutes: 23,
    equipment: ['High-Flow O2', 'Crash Cart', 'Multipara Monitor', 'Suction Unit'],
    roomTypeLabel: 'Acute Intervention'
  },
  {
    id: 'room-4',
    number: 'Bay 4A',
    name: 'Observation & Stabilization Bay A',
    category: 'observation',
    inCharge: 'Nurse Priya',
    roleTitle: 'Senior Triage Nurse',
    status: 'available',
    currentOccupantId: null,
    sessionStartTime: null,
    elapsedMinutes: 0,
    equipment: ['IV Infusion Pump', 'Cardiac Telemetry', 'Adjustable Stretcher'],
    roomTypeLabel: 'Observation Bay'
  },
  {
    id: 'room-5',
    number: 'Bay 4B',
    name: 'Observation & Stabilization Bay B',
    category: 'observation',
    inCharge: 'Nurse Priya',
    roleTitle: 'Senior Triage Nurse',
    status: 'available',
    currentOccupantId: null,
    sessionStartTime: null,
    elapsedMinutes: 0,
    equipment: ['IV Stand', 'Nebulizer Port', 'Automated BP Monitor'],
    roomTypeLabel: 'Observation Bay'
  },
  {
    id: 'room-6',
    number: 'Room 5',
    name: 'Minor Procedure & Surgical Dressing',
    category: 'procedure',
    inCharge: 'Dr. Patel',
    roleTitle: 'Attending Clinician',
    status: 'available',
    currentOccupantId: null,
    sessionStartTime: null,
    elapsedMinutes: 0,
    equipment: ['Suture Kit', 'Sterilization Bay', 'Cautery Machine', 'Surgical Light'],
    roomTypeLabel: 'Minor Procedure'
  },
  {
    id: 'room-7',
    number: 'Room 6',
    name: 'Priority Rehydration & Therapy Lounge',
    category: 'observation',
    inCharge: 'Nurse Priya',
    roleTitle: 'Triage Nurse',
    status: 'available',
    currentOccupantId: null,
    sessionStartTime: null,
    elapsedMinutes: 0,
    equipment: ['Comfort Recliners', 'Pediatric Monitor', 'Warming Blanket'],
    roomTypeLabel: 'Therapy Lounge'
  }
];
