/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Patient,
  Bed,
  IncomingAmbulance,
  OperatingTheatre,
  EquipmentCategory,
  SystemAlert,
  SanadSuggestion,
  SupplyRequest,
  MedicationOrder,
  AuditRecord,
  SupplyInventoryItem,
  UserRole,
  ScenarioType,
  DiversionStatus,
  BookOTPayload,
  ESILevel
} from '../types';

interface SimulationContextProps {
  // Global States
  role: UserRole;
  setRole: (role: UserRole) => void;
  scenario: ScenarioType;
  setScenario: (sc: ScenarioType) => void;
  scenarioTimelineSec: number;
  setScenarioTimelineSec: (sec: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  resetSimulation: () => void;
  diversionStatus: DiversionStatus;
  
  // Data Collections
  patients: Patient[];
  beds: Bed[];
  ambulances: IncomingAmbulance[];
  operatingTheatres: OperatingTheatre[];
  equipment: EquipmentCategory[];
  alerts: SystemAlert[];
  suggestions: SanadSuggestion[];
  supplyRequests: SupplyRequest[];
  inventory: SupplyInventoryItem[];
  auditLogs: AuditRecord[];

  // Selected entities for drawers / drill-downs
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedBedId: string | null;
  setSelectedBedId: (id: string | null) => void;
  selectedKpiKey: string | null;
  setSelectedKpiKey: (kpi: string | null) => void;
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  esiFilter: ESILevel | 'all';
  setEsiFilter: (filter: ESILevel | 'all') => void;

  // Book OT Feature
  isBookOTOpen: boolean;
  setIsBookOTOpen: (open: boolean) => void;
  preselectedOTId: string | null;
  setPreselectedOTId: (id: string | null) => void;
  bookOperatingTheatre: (payload: BookOTPayload) => void;

  // Actions
  createSupplyRequest: (bedId: string, item: string, quantity: number, urgency: 'normal' | 'urgent' | 'stat') => void;
  requestMedicationDelivery: (bedId: string, medOrderId: string) => void;
  updateRequestStatus: (requestId: string, nextStatus: SupplyRequest['status']) => void;
  approveSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  dismissAlert: (alertId: string) => void;
  assignBedToPatient: (patientId: string, bedId: string) => void;
  assignBayToAmbulance: (ambulanceId: string, bayId: string) => void;
  logAuditAccess: (action: string, patientId?: string, resourceType?: string) => void;
}

const SimulationContext = createContext<SimulationContextProps | null>(null);

// Initial baseline mock data
const initialBeds: Bed[] = [
  // Resus Bays (R1-R4)
  { id: 'RESUS-01', zone: 'resus', label: 'Resus 1', status: 'occupied', currentPatientId: 'PT-101', lastSensorPing: 'Just now', specialty: 'Polytrauma / Level 1' },
  { id: 'RESUS-02', zone: 'resus', label: 'Resus 2', status: 'reserved', lastSensorPing: 'Just now', specialty: 'Cardiac Arrest / STEMI' },
  { id: 'RESUS-03', zone: 'resus', label: 'Resus 3', status: 'free', lastSensorPing: 'Just now', specialty: 'Airway / Stroke' },
  { id: 'RESUS-04', zone: 'resus', label: 'Resus 4', status: 'cleaning', cleaningProgressMinutes: 4, lastSensorPing: 'Just now', specialty: 'Pediatric Resus' },
  // Acute Bays (1-8)
  { id: 'BAY-01', zone: 'acute', label: 'Bed 1', status: 'occupied', currentPatientId: 'PT-102', lastSensorPing: 'Just now' },
  { id: 'BAY-02', zone: 'acute', label: 'Bed 2', status: 'occupied', currentPatientId: 'PT-103', lastSensorPing: 'Just now' },
  { id: 'BAY-03', zone: 'acute', label: 'Bed 3', status: 'free', lastSensorPing: 'Just now' },
  { id: 'BAY-04', zone: 'acute', label: 'Bed 4', status: 'occupied', currentPatientId: 'PT-104', lastSensorPing: 'Just now' },
  { id: 'BAY-05', zone: 'acute', label: 'Bed 5', status: 'cleaning', cleaningProgressMinutes: 2, lastSensorPing: 'Just now' },
  { id: 'BAY-06', zone: 'acute', label: 'Bed 6', status: 'occupied', currentPatientId: 'PT-105', lastSensorPing: 'Just now' },
  { id: 'BAY-07', zone: 'acute', label: 'Bed 7', status: 'occupied', currentPatientId: 'PT-106', lastSensorPing: 'Just now' },
  { id: 'BAY-08', zone: 'acute', label: 'Bed 8', status: 'unknown', sensorSilent: true, lastSensorPing: '34 min ago (Silent)' },
  // Sub-Acute Bays (9-14)
  { id: 'BAY-09', zone: 'subacute', label: 'Bed 9', status: 'occupied', currentPatientId: 'PT-107', lastSensorPing: 'Just now' },
  { id: 'BAY-10', zone: 'subacute', label: 'Bed 10', status: 'free', lastSensorPing: 'Just now' },
  { id: 'BAY-11', zone: 'subacute', label: 'Bed 11', status: 'occupied', currentPatientId: 'PT-108', lastSensorPing: 'Just now' },
  { id: 'BAY-12', zone: 'subacute', label: 'Bed 12', status: 'free', lastSensorPing: 'Just now' },
  { id: 'BAY-13', zone: 'subacute', label: 'Bed 13', status: 'occupied', currentPatientId: 'PT-109', lastSensorPing: 'Just now' },
  { id: 'BAY-14', zone: 'subacute', label: 'Bed 14', status: 'free', lastSensorPing: 'Just now' },
  // Fast Track Clinic (FT1-FT4)
  { id: 'FT-01', zone: 'fasttrack', label: 'FT-1', status: 'occupied', currentPatientId: 'PT-110', lastSensorPing: 'Just now' },
  { id: 'FT-02', zone: 'fasttrack', label: 'FT-2', status: 'occupied', currentPatientId: 'PT-111', lastSensorPing: 'Just now' },
  { id: 'FT-03', zone: 'fasttrack', label: 'FT-3', status: 'free', lastSensorPing: 'Just now' },
  { id: 'FT-04', zone: 'fasttrack', label: 'FT-4', status: 'free', lastSensorPing: 'Just now' },
];

const initialPatients: Patient[] = [
  {
    id: 'PT-101',
    mrn: 'UAE-4091-82',
    pseudonym: 'Patient #101',
    name: 'M. Al-Ketbi (Pseudonymised)',
    age: 52,
    gender: 'M',
    esi: 1,
    esiReason: 'Anterior STEMI, ongoing diaphoresis, hypotensive',
    bedId: 'RESUS-01',
    zone: 'resus',
    chiefComplaint: 'Crushing retrosternal chest pain radiating to left arm',
    triageNotes: 'Door-to-ECG completed in 4 mins. ST elevations in V1-V4. Heparin and dual antiplatelet given. Cath lab activated.',
    assignedDoctor: 'Dr. Tariq Al-Hashimi (Consultant)',
    assignedNurse: 'Fatima RN (Charge)',
    arrivalTime: '02:42',
    waitTimeMinutes: 4,
    vitals: { hr: 114, sbp: 88, dbp: 54, spo2: 94, temp: 36.9, rr: 24, gcs: 14 },
    vitalHistory: [
      { time: '02:42', hr: 118, sbp: 85, dbp: 52, spo2: 93, temp: 36.9, rr: 26 },
      { time: '02:50', hr: 116, sbp: 86, dbp: 53, spo2: 94, temp: 36.9, rr: 25 },
      { time: '03:00', hr: 114, sbp: 88, dbp: 54, spo2: 94, temp: 36.9, rr: 24 },
    ],
    medications: [
      { id: 'MED-1', drugName: 'Aspirin 300mg PO Chewable', dose: '300mg', route: 'Oral', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '02:44', status: 'administered' },
      { id: 'MED-2', drugName: 'Ticagrelor 180mg PO loading', dose: '180mg', route: 'Oral', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '02:45', status: 'administered' },
      { id: 'MED-3', drugName: 'Heparin 5,000 units IV Bolus', dose: '5000 IU', route: 'IV', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '02:46', status: 'on_the_way', etaSeconds: 90 },
      { id: 'MED-4', drugName: 'Norepinephrine infusion (titrate)', dose: '4mcg/min', route: 'IV Infusion', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '02:55', status: 'ordered' },
    ],
    allergies: ['Penicillin (Anaphylaxis)'],
    arrivalMethod: 'Ambulance',
    disposition: 'or_transfer',
    admitWaitTime: '18m',
    admitTargetWard: 'Cath Lab / CCU Bed 2',
    timeline: [
      { time: '02:42', event: 'Arrival via National Ambulance AMB-102', clinician: 'Paramedic Al-Nuaimi', type: 'triage' },
      { time: '02:44', event: 'Immediate Code STEMI called to Resus 1', clinician: 'Fatima RN', type: 'triage' },
      { time: '02:46', event: 'Seen by Consultant Dr. Tariq Al-Hashimi', clinician: 'Dr. Tariq Al-Hashimi', type: 'doctor' },
      { time: '02:50', event: 'Cardiology on-call contacted, Cath Lab primed', clinician: 'Dr. Sara Al-Nuaimi', type: 'status' },
    ]
  },
  {
    id: 'PT-104',
    mrn: 'UAE-3882-19',
    pseudonym: 'Patient #104',
    name: 'S. Al-Suwaidi (Pseudonymised)',
    age: 68,
    gender: 'F',
    esi: 2,
    esiReason: 'Acute Urosepsis with altered mental status, MAP < 65',
    bedId: 'BAY-04',
    zone: 'acute',
    chiefComplaint: 'High grade fever (39.4°C), rigors, confusion and severe flank tenderness',
    triageNotes: 'Lactate 3.8 mmol/L. Sepsis resuscitation bundle initiated. Blood cultures drawn x2.',
    assignedDoctor: 'Dr. Sara Al-Nuaimi',
    assignedNurse: 'Rashid RN',
    arrivalTime: '01:15',
    waitTimeMinutes: 28,
    vitals: { hr: 122, sbp: 82, dbp: 48, spo2: 96, temp: 39.4, rr: 28, gcs: 13 },
    vitalHistory: [
      { time: '01:15', hr: 130, sbp: 78, dbp: 44, spo2: 95, temp: 39.6, rr: 30 },
      { time: '01:45', hr: 126, sbp: 80, dbp: 46, spo2: 96, temp: 39.5, rr: 28 },
      { time: '02:30', hr: 122, sbp: 82, dbp: 48, spo2: 96, temp: 39.4, rr: 28 },
    ],
    medications: [
      { id: 'MED-5', drugName: 'Ceftriaxone 2g IV PB', dose: '2g in 100mL NS', route: 'IV', orderedBy: 'Dr. Sara Al-Nuaimi', orderedAt: '01:25', status: 'administered' },
      { id: 'MED-6', drugName: 'Normal Saline 0.9% 1000mL Bolus', dose: '1000 mL', route: 'IV', orderedBy: 'Dr. Sara Al-Nuaimi', orderedAt: '01:22', status: 'delivered' },
      { id: 'MED-7', drugName: 'Paracetamol 1g IV Infusion', dose: '1g', route: 'IV', orderedBy: 'Dr. Sara Al-Nuaimi', orderedAt: '01:30', status: 'administered' },
    ],
    allergies: ['Sulfa drugs'],
    arrivalMethod: 'Walk-in',
    disposition: 'admitted_waiting_bed',
    admitWaitTime: '2h 10m',
    admitTargetWard: 'ICU Bed 5 (Bed shortage)',
    timeline: [
      { time: '01:15', event: 'Triage Category ESI 2 assigned', clinician: 'Triage Nurse Mariam', type: 'triage' },
      { time: '01:20', event: 'Moved to Acute Bed 4', clinician: 'Rashid RN', type: 'move' },
      { time: '01:24', event: 'Sepsis alert triggered, blood cultures drawn', clinician: 'Dr. Sara Al-Nuaimi', type: 'order' },
      { time: '02:00', event: 'ICU Admission requested - awaiting bed turnover', clinician: 'Hospital Bed Manager', type: 'status' },
    ]
  },
  {
    id: 'PT-102',
    mrn: 'UAE-9901-44',
    pseudonym: 'Patient #102',
    name: 'K. Sharma (Pseudonymised)',
    age: 34,
    gender: 'M',
    esi: 3,
    esiReason: 'Suspected acute appendicitis, moderate pain (7/10)',
    bedId: 'BAY-01',
    zone: 'acute',
    chiefComplaint: 'Right lower quadrant abdominal pain, anorexia, nausea',
    triageNotes: 'McBurney point tenderness positive. Ultrasound pending.',
    assignedDoctor: 'Dr. Rajiv Nair',
    assignedNurse: 'Grace RN',
    arrivalTime: '02:05',
    waitTimeMinutes: 45,
    vitals: { hr: 88, sbp: 128, dbp: 78, spo2: 99, temp: 37.8, rr: 18, gcs: 15 },
    vitalHistory: [
      { time: '02:05', hr: 92, sbp: 130, dbp: 80, spo2: 99, temp: 37.7, rr: 18 },
      { time: '02:40', hr: 88, sbp: 128, dbp: 78, spo2: 99, temp: 37.8, rr: 18 },
    ],
    medications: [
      { id: 'MED-8', drugName: 'Morphine 5mg IV PRN pain', dose: '5mg', route: 'IV', orderedBy: 'Dr. Rajiv Nair', orderedAt: '02:15', status: 'administered' },
      { id: 'MED-9', drugName: 'Ondansetron 4mg IV push', dose: '4mg', route: 'IV', orderedBy: 'Dr. Rajiv Nair', orderedAt: '02:15', status: 'administered' },
    ],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'treatment',
    timeline: [
      { time: '02:05', event: 'Registered and triaged', clinician: 'Triage Nurse Mariam', type: 'triage' },
      { time: '02:18', event: 'Bedside evaluation by Dr. Rajiv Nair', clinician: 'Dr. Rajiv Nair', type: 'doctor' },
      { time: '02:30', event: 'Abdominal ultrasound ordered', clinician: 'Radiology', type: 'order' },
    ]
  },
  {
    id: 'PT-103',
    mrn: 'UAE-2910-55',
    pseudonym: 'Patient #103',
    name: 'A. Mansoori (Pseudonymised)',
    age: 72,
    gender: 'M',
    esi: 2,
    esiReason: 'Acute exacerbation of COPD with severe respiratory distress',
    bedId: 'BAY-02',
    zone: 'acute',
    chiefComplaint: 'Severe breathlessness, wheezing, productive cough',
    triageNotes: 'SpO2 84% on room air, increased work of breathing. BiPAP initiated.',
    assignedDoctor: 'Dr. Tariq Al-Hashimi',
    assignedNurse: 'Fatima RN',
    arrivalTime: '01:50',
    waitTimeMinutes: 22,
    vitals: { hr: 108, sbp: 146, dbp: 92, spo2: 91, temp: 37.4, rr: 26, gcs: 14 },
    vitalHistory: [
      { time: '01:50', hr: 118, sbp: 154, dbp: 96, spo2: 84, temp: 37.4, rr: 32 },
      { time: '02:10', hr: 112, sbp: 148, dbp: 94, spo2: 89, temp: 37.4, rr: 28 },
      { time: '02:45', hr: 108, sbp: 146, dbp: 92, spo2: 91, temp: 37.4, rr: 26 },
    ],
    medications: [
      { id: 'MED-10', drugName: 'Salbutamol + Ipratropium nebulised', dose: '5mg / 0.5mg', route: 'Nebulised', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '01:55', status: 'administered' },
      { id: 'MED-11', drugName: 'Hydrocortisone 100mg IV', dose: '100mg', route: 'IV', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '01:58', status: 'administered' },
    ],
    allergies: ['Aspirin (Bronchospasm)'],
    arrivalMethod: 'Ambulance',
    disposition: 'treatment',
    timeline: [
      { time: '01:50', event: 'Arrived on 10L NRB mask', clinician: 'Paramedic Al-Nuaimi', type: 'triage' },
      { time: '01:55', event: 'Placed on non-invasive ventilation (BiPAP)', clinician: 'Respiratory Therapist Bilal', type: 'order' },
    ]
  },
  {
    id: 'PT-105',
    mrn: 'UAE-8192-33',
    pseudonym: 'Patient #105',
    name: 'Z. Al-Hassan (Pseudonymised)',
    age: 29,
    gender: 'F',
    esi: 3,
    esiReason: 'Closed fracture right tibia/fibula after fall, neurovascularly intact',
    bedId: 'BAY-06',
    zone: 'acute',
    chiefComplaint: 'Deformity and severe pain right lower extremity',
    triageNotes: 'Distal pulses 2+ palpable. Sensation intact. Splint applied.',
    assignedDoctor: 'Dr. Sara Al-Nuaimi',
    assignedNurse: 'Rashid RN',
    arrivalTime: '02:20',
    waitTimeMinutes: 32,
    vitals: { hr: 94, sbp: 122, dbp: 74, spo2: 99, temp: 36.8, rr: 16, gcs: 15 },
    vitalHistory: [
      { time: '02:20', hr: 98, sbp: 126, dbp: 76, spo2: 99, temp: 36.8, rr: 18 },
      { time: '02:50', hr: 94, sbp: 122, dbp: 74, spo2: 99, temp: 36.8, rr: 16 },
    ],
    medications: [
      { id: 'MED-12', drugName: 'Fentanyl 50mcg IV PRN', dose: '50mcg', route: 'IV', orderedBy: 'Dr. Sara Al-Nuaimi', orderedAt: '02:25', status: 'administered' },
    ],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'treatment',
    timeline: [
      { time: '02:20', event: 'Arrived via wheelchair', clinician: 'Triage Nurse Mariam', type: 'triage' },
      { time: '02:35', event: 'X-Ray right leg completed', clinician: 'Imaging Tech', type: 'result' },
    ]
  },
  {
    id: 'PT-106',
    mrn: 'UAE-5502-11',
    pseudonym: 'Patient #106',
    name: 'O. Balushi (Pseudonymised)',
    age: 44,
    gender: 'M',
    esi: 2,
    esiReason: 'Upper gastrointestinal bleed with melena and orthostatic dizziness',
    bedId: 'BAY-07',
    zone: 'acute',
    chiefComplaint: 'Large volume hematemesis x 2, melena stools x 3 days',
    triageNotes: 'Hemoglobin 7.1 g/dL. Type and screen sent. Two 16G IV lines in situ.',
    assignedDoctor: 'Dr. Rajiv Nair',
    assignedNurse: 'Grace RN',
    arrivalTime: '01:40',
    waitTimeMinutes: 40,
    vitals: { hr: 110, sbp: 96, dbp: 62, spo2: 97, temp: 37.1, rr: 20, gcs: 15 },
    vitalHistory: [
      { time: '01:40', hr: 118, sbp: 92, dbp: 58, spo2: 96, temp: 37.1, rr: 22 },
      { time: '02:15', hr: 114, sbp: 94, dbp: 60, spo2: 97, temp: 37.1, rr: 20 },
      { time: '02:50', hr: 110, sbp: 96, dbp: 62, spo2: 97, temp: 37.1, rr: 20 },
    ],
    medications: [
      { id: 'MED-13', drugName: 'Pantoprazole 80mg IV bolus', dose: '80mg', route: 'IV', orderedBy: 'Dr. Rajiv Nair', orderedAt: '01:48', status: 'administered' },
      { id: 'MED-14', drugName: 'Packed Red Blood Cells (PRBC) 2 units', dose: '2 units', route: 'IV Transfusion', orderedBy: 'Dr. Rajiv Nair', orderedAt: '02:00', status: 'on_the_way', etaSeconds: 120 },
    ],
    allergies: [],
    arrivalMethod: 'Ambulance',
    disposition: 'admitted_waiting_bed',
    admitWaitTime: '1h 35m',
    admitTargetWard: 'Gastroenterology / High Dependency Bed 3',
    timeline: [
      { time: '01:40', event: 'Arrived from primary clinic', clinician: 'Paramedic Al-Nuaimi', type: 'triage' },
      { time: '02:00', event: 'Urgent PRBC crossmatch confirmed with Blood Bank', clinician: 'Grace RN', type: 'order' },
    ]
  },
  {
    id: 'PT-107',
    mrn: 'UAE-1188-72',
    pseudonym: 'Patient #107',
    name: 'L. Chen (Pseudonymised)',
    age: 41,
    gender: 'F',
    esi: 3,
    esiReason: 'Renal colic with microhematuria, severe flank spasm',
    bedId: 'BAY-09',
    zone: 'subacute',
    chiefComplaint: 'Left flank pain radiating to groin, vomiting',
    triageNotes: 'Pain 9/10 initially. Responding to ketorolac.',
    assignedDoctor: 'Dr. Sara Al-Nuaimi',
    assignedNurse: 'Rashid RN',
    arrivalTime: '02:10',
    waitTimeMinutes: 20,
    vitals: { hr: 84, sbp: 132, dbp: 82, spo2: 99, temp: 36.7, rr: 16, gcs: 15 },
    vitalHistory: [{ time: '02:10', hr: 90, sbp: 138, dbp: 86, spo2: 99, temp: 36.7, rr: 18 }],
    medications: [
      { id: 'MED-15', drugName: 'Ketorolac 30mg IV', dose: '30mg', route: 'IV', orderedBy: 'Dr. Sara Al-Nuaimi', orderedAt: '02:15', status: 'administered' }
    ],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'treatment',
    timeline: [{ time: '02:10', event: 'Triaged and placed in Sub-acute Bed 9', clinician: 'Triage Nurse', type: 'triage' }]
  },
  {
    id: 'PT-108',
    mrn: 'UAE-6612-90',
    pseudonym: 'Patient #108',
    name: 'H. Al-Falasi (Pseudonymised)',
    age: 19,
    gender: 'M',
    esi: 4,
    esiReason: 'Right wrist sprain after football match',
    bedId: 'BAY-11',
    zone: 'subacute',
    chiefComplaint: 'Pain on wrist flexion, minimal swelling',
    triageNotes: 'X-Ray negative for fracture.',
    assignedDoctor: 'Dr. Rajiv Nair',
    assignedNurse: 'Grace RN',
    arrivalTime: '02:30',
    waitTimeMinutes: 35,
    vitals: { hr: 72, sbp: 118, dbp: 74, spo2: 100, temp: 36.6, rr: 14, gcs: 15 },
    vitalHistory: [{ time: '02:30', hr: 72, sbp: 118, dbp: 74, spo2: 100, temp: 36.6, rr: 14 }],
    medications: [],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'discharged',
    timeline: [{ time: '02:30', event: 'Triage complete', clinician: 'Triage Nurse', type: 'triage' }]
  },
  {
    id: 'PT-109',
    mrn: 'UAE-4431-02',
    pseudonym: 'Patient #109',
    name: 'N. Al-Dhaheri (Pseudonymised)',
    age: 58,
    gender: 'F',
    esi: 2,
    esiReason: 'New onset atrial fibrillation with rapid ventricular response (HR 148)',
    bedId: 'BAY-13',
    zone: 'subacute',
    chiefComplaint: 'Palpitations, lightheadedness, mild chest tightness',
    triageNotes: 'Rate control started. Continuous cardiac telemetry on.',
    assignedDoctor: 'Dr. Tariq Al-Hashimi',
    assignedNurse: 'Fatima RN',
    arrivalTime: '01:30',
    waitTimeMinutes: 50,
    vitals: { hr: 138, sbp: 116, dbp: 76, spo2: 98, temp: 36.9, rr: 20, gcs: 15 },
    vitalHistory: [{ time: '01:30', hr: 148, sbp: 118, dbp: 78, spo2: 97, temp: 36.9, rr: 22 }],
    medications: [
      { id: 'MED-16', drugName: 'Metoprolol 5mg IV slow bolus', dose: '5mg', route: 'IV', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '01:45', status: 'administered' },
      { id: 'MED-17', drugName: 'Amiodarone 150mg in 100mL D5W', dose: '150mg', route: 'IV Infusion', orderedBy: 'Dr. Tariq Al-Hashimi', orderedAt: '02:10', status: 'requested' },
    ],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'treatment',
    timeline: [{ time: '01:30', event: 'Triage Category ESI 2', clinician: 'Triage Nurse', type: 'triage' }]
  },
  {
    id: 'PT-110',
    mrn: 'UAE-7729-12',
    pseudonym: 'Patient #110',
    name: 'Y. Mahmoud (Pseudonymised)',
    age: 26,
    gender: 'M',
    esi: 4,
    esiReason: 'Superficial forearm laceration (4cm), tetanus up to date',
    bedId: 'FT-01',
    zone: 'fasttrack',
    chiefComplaint: 'Kitchen glass cut, bleeding controlled',
    triageNotes: 'Suturing completed. Discharge instructions provided.',
    assignedDoctor: 'Dr. Rajiv Nair',
    assignedNurse: 'Grace RN',
    arrivalTime: '02:25',
    waitTimeMinutes: 25,
    vitals: { hr: 74, sbp: 120, dbp: 78, spo2: 99, temp: 36.6, rr: 14, gcs: 15 },
    vitalHistory: [],
    medications: [],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'discharged',
    timeline: [{ time: '02:25', event: 'Assigned to Fast Track 1', clinician: 'Triage Nurse', type: 'move' }]
  },
  {
    id: 'PT-111',
    mrn: 'UAE-9104-58',
    pseudonym: 'Patient #111',
    name: 'E. Al-Zaabi (Pseudonymised)',
    age: 7,
    gender: 'M',
    esi: 4,
    esiReason: 'Mild acute otitis media, ear pain 4/10',
    bedId: 'FT-02',
    zone: 'fasttrack',
    chiefComplaint: 'Earache and low grade fever (37.9°C)',
    triageNotes: 'Tympanic membrane erythema. Oral amoxicillin prescribed.',
    assignedDoctor: 'Dr. Sara Al-Nuaimi',
    assignedNurse: 'Rashid RN',
    arrivalTime: '02:35',
    waitTimeMinutes: 18,
    vitals: { hr: 96, sbp: 104, dbp: 64, spo2: 100, temp: 37.9, rr: 20, gcs: 15 },
    vitalHistory: [],
    medications: [],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'discharged',
    timeline: []
  },
  // Waiting room patients
  {
    id: 'PT-112',
    mrn: 'UAE-3329-84',
    pseudonym: 'Patient #112',
    name: 'A. Rahman (Pseudonymised)',
    age: 39,
    gender: 'M',
    esi: 3,
    esiReason: 'Moderate asthma attack, peak flow 60% of baseline',
    zone: 'waiting',
    chiefComplaint: 'Shortness of breath, wheeze for 2 hours',
    triageNotes: 'Triaged. Awaiting bed in Acute Bay.',
    assignedDoctor: 'Pending assignment',
    assignedNurse: 'Triage Nurse Mariam',
    arrivalTime: '02:40',
    waitTimeMinutes: 18,
    vitals: { hr: 98, sbp: 126, dbp: 80, spo2: 94, temp: 36.8, rr: 22, gcs: 15 },
    vitalHistory: [],
    medications: [],
    allergies: [],
    arrivalMethod: 'Walk-in',
    disposition: 'triage',
    timeline: [{ time: '02:40', event: 'Triaged in Waiting Area', clinician: 'Triage Nurse Mariam', type: 'triage' }]
  },
  {
    id: 'PT-113',
    mrn: 'UAE-6644-22',
    pseudonym: 'Patient #113',
    name: 'F. Al-Marzouqi (Pseudonymised)',
    age: 51,
    gender: 'F',
    esi: 3,
    esiReason: 'Severe migraine with photophobia and nausea',
    zone: 'waiting',
    chiefComplaint: 'Unilateral throbbing headache 8/10, visual aura',
    triageNotes: 'Triaged to waiting room quiet corner.',
    assignedDoctor: 'Pending assignment',
    assignedNurse: 'Triage Nurse Mariam',
    arrivalTime: '02:38',
    waitTimeMinutes: 20,
    vitals: { hr: 80, sbp: 134, dbp: 84, spo2: 99, temp: 36.7, rr: 16, gcs: 15 },
    vitalHistory: [],
    medications: [],
    allergies: ['NSAIDs (Gastritis)'],
    arrivalMethod: 'Walk-in',
    disposition: 'triage',
    timeline: [{ time: '02:38', event: 'Registered and triaged', clinician: 'Triage Nurse Mariam', type: 'triage' }]
  }
];

const initialAmbulances: IncomingAmbulance[] = [
  {
    id: 'AMB-1',
    callSign: 'AMB-204',
    agency: 'National Ambulance',
    etaSeconds: 180, // 3 min
    esi: 1,
    patientAge: 48,
    patientGender: 'M',
    chiefComplaint: 'Severe motor vehicular trauma, GCS 9, flail chest',
    vitals: { hr: 132, sbp: 80, dbp: 46, spo2: 89, rr: 30, gcs: 9 },
    assignedBay: 'RESUS-02',
  },
  {
    id: 'AMB-2',
    callSign: 'AMB-118',
    agency: 'Dubai DCAS',
    etaSeconds: 440, // ~7 min
    esi: 2,
    patientAge: 62,
    patientGender: 'F',
    chiefComplaint: 'Acute focal neurological deficit (FAST positive, left hemiplegia)',
    vitals: { hr: 90, sbp: 188, dbp: 104, spo2: 98, rr: 18, gcs: 14 },
    assignedBay: 'RESUS-03',
  },
  {
    id: 'AMB-3',
    callSign: 'AMB-309',
    agency: 'National Ambulance',
    etaSeconds: 820, // ~13 min
    esi: 3,
    patientAge: 35,
    patientGender: 'M',
    chiefComplaint: 'Blunt abdominal trauma after workplace fall from ladder (3m)',
    vitals: { hr: 98, sbp: 122, dbp: 76, spo2: 99, rr: 18, gcs: 15 },
    assignedBay: 'BAY-03',
  }
];

const initialOperatingTheatres: OperatingTheatre[] = [
  {
    id: 'OT-1',
    name: 'OT 1 (Trauma & Damage Control)',
    specialty: 'Trauma & General Surgery',
    status: 'in_use',
    currentProcedure: 'Exploratory Laparotomy & Splenic Packing',
    assignedSurgeon: 'Dr. Hamad Al-Remeithi (Consultant Trauma)',
    assignedAnaesthetist: 'Dr. Paulson Mathew',
    estimatedFinishMinutes: 35,
    nextAvailableMinutes: 50,
  },
  {
    id: 'OT-2',
    name: 'OT 2 (Orthopaedic & Neuro)',
    specialty: 'Orthopaedic & Polytrauma',
    status: 'cleaning',
    currentProcedure: 'Post Open Tibia Fixation',
    assignedSurgeon: 'Dr. Sultan Al-Nuaimi',
    assignedAnaesthetist: 'Dr. Mona Salem',
    estimatedFinishMinutes: 12,
    nextAvailableMinutes: 12,
  },
  {
    id: 'OT-3',
    name: 'OT 3 (Vascular & General)',
    specialty: 'Emergency General Surgery',
    status: 'available',
    assignedSurgeon: 'Dr. Layla Mansoor (On standby)',
    assignedAnaesthetist: 'Dr. Amina Qureshi',
    nextAvailableMinutes: 0,
  },
  {
    id: 'OT-4',
    name: 'OT 4 (Emergency Dedicated)',
    specialty: 'Dedicated Hyper-Acute Emergency',
    status: 'reserved_emergency',
    assignedSurgeon: 'Rapid Response Surgical Team B',
    assignedAnaesthetist: 'Dr. Tariq Zaid',
    nextAvailableMinutes: 5,
  }
];

const initialEquipment: EquipmentCategory[] = [
  {
    id: 'EQ-VENT',
    name: 'Mechanical Ventilators',
    nameAr: 'أجهزة التنفس الاصطناعي',
    iconName: 'Wind',
    total: 12,
    free: 4,
    inUse: 6,
    cleaning: 1,
    maintenance: 1,
    items: [
      { id: 'V-01', serial: 'HAM-C6-9901', zone: 'Resus 1', status: 'in_use', batteryPercent: 98, assignedBed: 'RESUS-01' },
      { id: 'V-02', serial: 'HAM-C6-9902', zone: 'Resus 2', status: 'free', batteryPercent: 100, assignedBed: 'RESUS-02' },
      { id: 'V-03', serial: 'HAM-C6-9903', zone: 'Acute Bay 2', status: 'in_use', batteryPercent: 92, assignedBed: 'BAY-02' },
      { id: 'V-04', serial: 'HAM-C6-9904', zone: 'Clean Supply Hub', status: 'free', batteryPercent: 100 },
      { id: 'V-05', serial: 'HAM-C6-9905', zone: 'Sterilisation Room', status: 'cleaning', batteryPercent: 65 },
      { id: 'V-06', serial: 'HAM-C6-9906', zone: 'Biomedical Workshop', status: 'maintenance', batteryPercent: 12 },
    ]
  },
  {
    id: 'EQ-DEFIB',
    name: 'Crash Cart Defibrillators',
    nameAr: 'أجهزة الصدمات الكهربائية',
    iconName: 'Zap',
    total: 8,
    free: 5,
    inUse: 2,
    cleaning: 1,
    maintenance: 0,
    items: [
      { id: 'D-01', serial: 'ZOLL-X-4101', zone: 'Resus 1', status: 'in_use', batteryPercent: 99, assignedBed: 'RESUS-01' },
      { id: 'D-02', serial: 'ZOLL-X-4102', zone: 'Resus 3', status: 'free', batteryPercent: 100 },
      { id: 'D-03', serial: 'ZOLL-X-4103', zone: 'Acute Central Desk', status: 'free', batteryPercent: 100 },
      { id: 'D-04', serial: 'ZOLL-X-4104', zone: 'Subacute Desk', status: 'free', batteryPercent: 100 },
      { id: 'D-05', serial: 'ZOLL-X-4105', zone: 'Triage Bay', status: 'free', batteryPercent: 98 },
    ]
  },
  {
    id: 'EQ-MON',
    name: 'Multiparameter Monitors',
    nameAr: 'شاشات مراقبة العلامات الحيوية',
    iconName: 'Activity',
    total: 26,
    free: 8,
    inUse: 15,
    cleaning: 2,
    maintenance: 1,
    items: [
      { id: 'M-01', serial: 'PHIL-MX750-1', zone: 'Resus 1', status: 'in_use', batteryPercent: 100 },
      { id: 'M-02', serial: 'PHIL-MX750-2', zone: 'Resus 2', status: 'free', batteryPercent: 100 },
      { id: 'M-03', serial: 'PHIL-MX750-3', zone: 'Resus 3', status: 'free', batteryPercent: 100 },
      { id: 'M-04', serial: 'PHIL-MX750-4', zone: 'Acute Bay 4', status: 'in_use', batteryPercent: 95 },
    ]
  },
  {
    id: 'EQ-PUMP',
    name: 'IV Infusion Pumps',
    nameAr: 'مضخات المحاليل الوريدية',
    iconName: 'Droplet',
    total: 34,
    free: 11,
    inUse: 19,
    cleaning: 3,
    maintenance: 1,
    items: [
      { id: 'P-01', serial: 'BBRAUN-SPACE-1', zone: 'Resus 1', status: 'in_use', batteryPercent: 100 },
      { id: 'P-02', serial: 'BBRAUN-SPACE-2', zone: 'Acute Bay 4', status: 'in_use', batteryPercent: 90 },
      { id: 'P-03', serial: 'BBRAUN-SPACE-3', zone: 'Equipment Alcove', status: 'free', batteryPercent: 100 },
    ]
  },
  {
    id: 'EQ-POCUS',
    name: 'Point-of-Care Ultrasound (POCUS)',
    nameAr: 'أجهزة السونار المتنقلة',
    iconName: 'Scan',
    total: 6,
    free: 3,
    inUse: 2,
    cleaning: 1,
    maintenance: 0,
    items: [
      { id: 'US-01', serial: 'GE-VSCAN-01', zone: 'Resus Hub', status: 'in_use', batteryPercent: 88 },
      { id: 'US-02', serial: 'GE-VSCAN-02', zone: 'Acute Core', status: 'free', batteryPercent: 100 },
      { id: 'US-03', serial: 'GE-VSCAN-03', zone: 'Triage Holding', status: 'free', batteryPercent: 95 },
    ]
  },
  {
    id: 'EQ-WHEEL',
    name: 'Transport Wheelchairs',
    nameAr: 'كراسي النقل المتحركة',
    iconName: 'Circle',
    total: 16,
    free: 7,
    inUse: 8,
    cleaning: 1,
    maintenance: 0,
    items: [
      { id: 'W-01', serial: 'WC-01', zone: 'Ambulance Airlock', status: 'free' },
      { id: 'W-02', serial: 'WC-02', zone: 'Waiting Entry', status: 'free' },
    ]
  }
];

const initialInventory: SupplyInventoryItem[] = [
  { id: 'INV-O2', name: 'Oxygen Cylinders (Type E & D)', nameAr: 'أسطوانات الأكسجين الطبي', currentStock: 28, minThreshold: 10, unit: 'cylinders', surgeUsageRatePerHour: 4.2 },
  { id: 'INV-SAL', name: 'Normal Saline 0.9% 1000mL', nameAr: 'محلول ملحي وريدي 0.9%', currentStock: 140, minThreshold: 35, unit: 'bags', surgeUsageRatePerHour: 18.0 },
  { id: 'INV-BLD-O', name: 'Emergency Blood: O-Negative (PRBC)', nameAr: 'أكياس دم طارئة: O سالب', currentStock: 8, minThreshold: 4, unit: 'units', surgeUsageRatePerHour: 2.1 },
  { id: 'INV-BLD-A', name: 'Emergency Blood: A-Positive (PRBC)', nameAr: 'أكياس دم طارئة: A موجب', currentStock: 14, minThreshold: 6, unit: 'units', surgeUsageRatePerHour: 1.5 },
  { id: 'INV-EPI', name: 'Epinephrine 1mg/1mL Ampoules', nameAr: 'أمبولات إبينفرين 1ملغم', currentStock: 45, minThreshold: 15, unit: 'ampoules', surgeUsageRatePerHour: 3.0 },
  { id: 'INV-TRAUMA', name: 'Damage Control Trauma Packs', nameAr: 'حقائب علاج الإصابات البليغة', currentStock: 12, minThreshold: 5, unit: 'packs', surgeUsageRatePerHour: 1.8 },
];

const initialSupplyRequests: SupplyRequest[] = [
  {
    id: 'REQ-101',
    type: 'supply',
    bedId: 'RESUS-01',
    item: 'Arterial Line Kit & Transducer',
    quantity: 1,
    urgency: 'stat',
    status: 'on_the_way',
    requestedAt: '02:48',
    etaSeconds: 45,
    assignedRunner: 'Runner Ahmed'
  },
  {
    id: 'REQ-102',
    type: 'medication',
    bedId: 'RESUS-01',
    item: 'Heparin 5,000 units IV',
    quantity: 1,
    urgency: 'stat',
    status: 'on_the_way',
    requestedAt: '02:46',
    etaSeconds: 90,
    assignedRunner: 'Pneumatic Station A2'
  },
  {
    id: 'REQ-103',
    type: 'medication',
    bedId: 'BAY-07',
    item: 'Packed Red Blood Cells (PRBC) 2 units',
    quantity: 2,
    urgency: 'urgent',
    status: 'preparing',
    requestedAt: '02:00',
    etaSeconds: 120,
    assignedRunner: 'Blood Bank Courier'
  },
  {
    id: 'REQ-104',
    type: 'supply',
    bedId: 'BAY-04',
    item: 'IV Start Pack & 20G Cannula x3',
    quantity: 3,
    urgency: 'normal',
    status: 'delivered',
    requestedAt: '01:25',
    etaSeconds: 0,
    assignedRunner: 'Supply Room Team'
  }
];

const initialAlerts: SystemAlert[] = [
  {
    id: 'ALT-1',
    tier: 'warning',
    title: 'Ambulance Incoming in 3 min',
    message: 'National Ambulance AMB-204 en route with polytrauma. Bay RESUS-02 primed.',
    timestamp: '03:10',
    category: 'ambulance',
  },
  {
    id: 'ALT-2',
    tier: 'info',
    title: 'ICU Bed Freed in Main Hospital',
    message: 'Surgical ICU Bed 6 cleaned and vacated. Bed manager evaluating Patient #104.',
    timestamp: '03:08',
    category: 'bed',
  }
];

const initialSuggestions: SanadSuggestion[] = [
  {
    id: 'SUG-1',
    title: 'Pre-allocate Resus Bay Kit',
    reason: 'Bed RESUS-02 reserved for incoming trauma AMB-204 (ETA 3m). Suggest kit: airway set, 2x IV pressure bag, monitor leads.',
    category: 'kit_prep',
    actionPayload: {
      type: 'send_resus_kit',
      targetId: 'RESUS-02',
      details: { kitName: 'Rapid Trauma & Airway Resus Pack', bedId: 'RESUS-02' }
    },
    timestamp: '03:10'
  },
  {
    id: 'SUG-2',
    title: 'Bed 5 cleaning nearly complete',
    reason: 'Bed 5 cleaning complete in ~2 min: recommend auto-assigning to ESI-3 patient (Patient #112, waiting 18 min).',
    category: 'bed_turnover',
    actionPayload: {
      type: 'assign_bed',
      targetId: 'BAY-05',
      details: { patientId: 'PT-112', bedId: 'BAY-05' }
    },
    timestamp: '03:09'
  }
];

const initialAuditLogs: AuditRecord[] = [
  {
    id: 'AUD-901',
    timestamp: '03:08:14',
    userRole: 'Charge Nurse',
    userName: 'Fatima RN (License #RN-DXB-4412)',
    action: 'Viewed Patient Clinical Record & Telemetry',
    patientId: 'PT-101 (M. Al-Ketbi)',
    resourceType: 'FHIR Observation & Encounter',
    ipAddress: '10.240.12.84 (Hospital Workstation)',
    lawComplianceTag: 'UAE Fed Law No. 2/2019 Art. 13'
  },
  {
    id: 'AUD-902',
    timestamp: '03:05:40',
    userRole: 'Attending Physician',
    userName: 'Dr. Tariq Al-Hashimi (License #MD-AUH-9921)',
    action: 'Ordered IV Heparin & Activated Cath Lab',
    patientId: 'PT-101 (M. Al-Ketbi)',
    resourceType: 'FHIR MedicationRequest',
    ipAddress: '10.240.12.82 (Physician Mobile Terminal)',
    lawComplianceTag: 'UAE Fed Law No. 2/2019 Art. 13'
  },
  {
    id: 'AUD-903',
    timestamp: '02:59:12',
    userRole: 'Triage Nurse',
    userName: 'Mariam RN',
    action: 'Assigned ESI Level 3 with vital sign entry',
    patientId: 'PT-112 (A. Rahman)',
    resourceType: 'FHIR Encounter (Triage)',
    ipAddress: '10.240.12.10 (Triage Desk 1)',
    lawComplianceTag: 'UAE Fed Law No. 2/2019 Art. 13'
  }
];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('charge_nurse');
  const [scenario, setScenarioState] = useState<ScenarioType>('normal');
  const [scenarioTimelineSec, setScenarioTimelineSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Core state objects
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [ambulances, setAmbulances] = useState<IncomingAmbulance[]>(initialAmbulances);
  const [operatingTheatres, setOperatingTheatres] = useState<OperatingTheatre[]>(initialOperatingTheatres);
  const [equipment, setEquipment] = useState<EquipmentCategory[]>(initialEquipment);
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);
  const [suggestions, setSuggestions] = useState<SanadSuggestion[]>(initialSuggestions);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(initialSupplyRequests);
  const [inventory, setInventory] = useState<SupplyInventoryItem[]>(initialInventory);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(initialAuditLogs);

  // Selected modals / views
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [esiFilter, setEsiFilter] = useState<ESILevel | 'all'>('all');

  // Book OT state
  const [isBookOTOpen, setIsBookOTOpen] = useState<boolean>(false);
  const [preselectedOTId, setPreselectedOTId] = useState<string | null>(null);

  // Compute diversion status dynamically based on free ER beds and active scenario
  const freeERBeds = useMemo(() => {
    return beds.filter(b => b.status === 'free').length;
  }, [beds]);

  const diversionStatus: DiversionStatus = useMemo(() => {
    if (scenario === 'collision') {
      if (scenarioTimelineSec > 40 || freeERBeds <= 1) return 'red';
      return 'amber';
    }
    if (scenario === 'heatstroke' || scenario === 'duststorm') {
      return freeERBeds <= 2 ? 'amber' : 'green';
    }
    if (freeERBeds <= 1) return 'red';
    if (freeERBeds <= 3) return 'amber';
    return 'green';
  }, [scenario, scenarioTimelineSec, freeERBeds]);

  // Log audit helper
  const logAuditAccess = useCallback((action: string, patientId?: string, resourceType: string = 'FHIR Resource') => {
    const roleNames: Record<UserRole, string> = {
      charge_nurse: 'Fatima RN (Charge)',
      doctor: 'Dr. Tariq Al-Hashimi (Physician)',
      administrator: 'S. Al-Ameri (Health Informatics Director)',
      supply_pharmacy: 'A. Zaki (Clinical Pharmacist)'
    };
    const newLog: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      userRole: role,
      userName: roleNames[role] || 'Authorized User',
      action,
      patientId,
      resourceType,
      ipAddress: '10.240.12.' + Math.floor(20 + Math.random() * 80),
      lawComplianceTag: 'UAE Fed Law No. 2/2019'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, [role]);

  // Switch scenario logic with full data transformation
  const setScenario = useCallback((newScenario: ScenarioType) => {
    setScenarioState(newScenario);
    setScenarioTimelineSec(0);

    if (newScenario === 'normal') {
      setBeds(initialBeds);
      setPatients(initialPatients);
      setAmbulances(initialAmbulances);
      setOperatingTheatres(initialOperatingTheatres);
      setInventory(initialInventory);
      setAlerts([
        {
          id: `ALT-NORMAL-${Date.now()}`,
          tier: 'info',
          title: 'Normal Flow Restored',
          message: 'ER throughput nominal. 8 treatment bays available. Diversion Level Green.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'bed'
        }
      ]);
      setSuggestions(initialSuggestions);
    } else if (newScenario === 'collision') {
      // 6 ambulances incoming within 20 mins, high trauma, resus bays fill, OTs fill
      const collisionAmbulances: IncomingAmbulance[] = [
        {
          id: 'AMB-COL-1',
          callSign: 'AMB-401',
          agency: 'National Ambulance',
          etaSeconds: 60,
          esi: 1,
          patientAge: 32,
          patientGender: 'M',
          chiefComplaint: 'E311 High-Speed Rollover: Unresponsive, severe head trauma, pupil asymmetry',
          vitals: { hr: 138, sbp: 74, dbp: 40, spo2: 86, rr: 34, gcs: 6 },
          assignedBay: 'RESUS-02'
        },
        {
          id: 'AMB-COL-2',
          callSign: 'AMB-402',
          agency: 'National Ambulance',
          etaSeconds: 150,
          esi: 1,
          patientAge: 27,
          patientGender: 'F',
          chiefComplaint: 'E311 Collision: Open pelvic fracture, massive hemorrhagic shock',
          vitals: { hr: 144, sbp: 68, dbp: 36, spo2: 91, rr: 28, gcs: 10 },
          assignedBay: 'RESUS-03'
        },
        {
          id: 'AMB-COL-3',
          callSign: 'AMB-403',
          agency: 'Dubai DCAS',
          etaSeconds: 240,
          esi: 2,
          patientAge: 45,
          patientGender: 'M',
          chiefComplaint: 'E311 Collision: Tension pneumothorax, needle decompression performed',
          vitals: { hr: 124, sbp: 90, dbp: 54, spo2: 88, rr: 32, gcs: 13 },
          assignedBay: 'RESUS-04'
        },
        {
          id: 'AMB-COL-4',
          callSign: 'AMB-404',
          agency: 'National Ambulance',
          etaSeconds: 360,
          esi: 2,
          patientAge: 51,
          patientGender: 'F',
          chiefComplaint: 'E311 Collision: Multiple rib fractures, bilateral wrist fractures',
          vitals: { hr: 108, sbp: 110, dbp: 68, spo2: 95, rr: 24, gcs: 15 },
          assignedBay: 'BAY-03'
        },
        {
          id: 'AMB-COL-5',
          callSign: 'AMB-405',
          agency: 'Dubai DCAS',
          etaSeconds: 520,
          esi: 2,
          patientAge: 19,
          patientGender: 'M',
          chiefComplaint: 'E311 Collision: Deep neck laceration with arterial spurting (tourniquet held)',
          vitals: { hr: 130, sbp: 82, dbp: 50, spo2: 94, rr: 26, gcs: 14 },
          assignedBay: 'BAY-10'
        },
        {
          id: 'AMB-COL-6',
          callSign: 'AMB-406',
          agency: 'National Ambulance',
          etaSeconds: 680,
          esi: 3,
          patientAge: 38,
          patientGender: 'M',
          chiefComplaint: 'E311 Collision: Blunt chest contusion from airbag deployment',
          vitals: { hr: 96, sbp: 130, dbp: 82, spo2: 98, rr: 20, gcs: 15 },
          rerouted: true,
          rerouteDestination: 'Al Rahba Trauma Hospital'
        }
      ];

      setAmbulances(collisionAmbulances);

      // Beds shift to heavily occupied
      setBeds(prev => prev.map(b => {
        if (b.id === 'RESUS-02') return { ...b, status: 'reserved' };
        if (b.id === 'RESUS-03') return { ...b, status: 'reserved' };
        if (b.id === 'RESUS-04') return { ...b, status: 'free' };
        if (b.id === 'BAY-12') return { ...b, status: 'occupied' };
        return b;
      }));

      // Inventory drops
      setInventory(prev => prev.map(item => {
        if (item.id === 'INV-BLD-O') return { ...item, currentStock: 3 }; // Below min!
        if (item.id === 'INV-BLD-A') return { ...item, currentStock: 5 };
        if (item.id === 'INV-TRAUMA') return { ...item, currentStock: 2 };
        if (item.id === 'INV-O2') return { ...item, currentStock: 14 };
        return item;
      }));

      // Operating Theatres fill up
      setOperatingTheatres(prev => prev.map(ot => {
        if (ot.id === 'OT-3') {
          return {
            ...ot,
            status: 'in_use',
            currentProcedure: 'Emergency Vascular Grafting & Embolisation',
            assignedSurgeon: 'Dr. Layla Mansoor',
            estimatedFinishMinutes: 75,
            nextAvailableMinutes: 85
          };
        }
        if (ot.id === 'OT-4') {
          return {
            ...ot,
            status: 'reserved_emergency',
            nextAvailableMinutes: 10
          };
        }
        return ot;
      }));

      // Alerts
      setAlerts([
        {
          id: 'ALT-DIV-RED',
          tier: 'critical',
          title: 'CODE MASS CASUALTY: E311 Highway Pileup',
          message: '6 incoming polytrauma ambulances. Resuscitation bays saturated. Diversion Level RED triggered.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          persistent: true,
          category: 'diversion'
        },
        {
          id: 'ALT-BLD-LOW',
          tier: 'warning',
          title: 'Emergency Blood Bank Alert',
          message: 'O-Negative PRBC stock dropped to 3 units (min threshold: 4). Requesting urgent transport from Abu Dhabi Blood Bank.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'supply'
        }
      ]);

      // Suggestions
      setSuggestions([
        {
          id: 'SUG-COL-1',
          title: 'Activate Emergency Blood Bank STAT Delivery',
          reason: 'O-Negative reserves at 3 units. 2 critical trauma arrivals imminent with hemorrhagic shock.',
          category: 'supply',
          actionPayload: {
            type: 'order_supply',
            targetId: 'INV-BLD-O',
            details: { itemName: 'Emergency O-Negative PRBC (6 units)', urgency: 'stat' }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'SUG-COL-2',
          title: 'Priming Resus Bay 2 & 3 Trauma Kits',
          reason: 'Beds R2 & R3 assigned to incoming ESI-1 trauma patients. Pre-position damage control trays.',
          category: 'kit_prep',
          actionPayload: {
            type: 'send_resus_kit',
            targetId: 'RESUS-02',
            details: { kitName: 'Pelvic Binder & Rapid Infuser Kit' }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (newScenario === 'heatstroke') {
      // Heat-stroke surge
      setAlerts([
        {
          id: 'ALT-HEAT-1',
          tier: 'warning',
          title: 'Extreme Heat Advisory: 49°C Ambient',
          message: 'Surge in outdoor worker heat exhaustion & hyperthermia. 9 cases admitted in 90 min.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'clinical'
        }
      ]);
      setInventory(prev => prev.map(item => {
        if (item.id === 'INV-SAL') return { ...item, currentStock: 24 }; // Below 35 threshold!
        return item;
      }));
      setSuggestions([
        {
          id: 'SUG-HEAT-1',
          title: 'Dispatch Cooling Ice Packs & Evaporative Mist Units',
          reason: 'Core temperatures > 40.5°C in Acute Bays 1, 4, 7. Cooling supply alcove depletion predicted in 25 min.',
          category: 'supply',
          actionPayload: {
            type: 'order_supply',
            targetId: 'INV-SAL',
            details: { itemName: 'Chilled IV Saline & Evaporation Sheets' }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (newScenario === 'duststorm') {
      // Dust-storm surge
      setAlerts([
        {
          id: 'ALT-DUST-1',
          tier: 'warning',
          title: 'Severe Dust Storm (Shamal) Influx',
          message: 'Asthma & COPD exacerbations up by 240%. High demand for bronchodilator nebulisers and supplemental O2.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'clinical'
        }
      ]);
      setInventory(prev => prev.map(item => {
        if (item.id === 'INV-O2') return { ...item, currentStock: 7 }; // Below min!
        return item;
      }));
      setSuggestions([
        {
          id: 'SUG-DUST-1',
          title: 'Order Medical Oxygen Cylinders',
          reason: 'Stock will deplete in ~50 min at current surge rate (14 patients on high-flow O2).',
          category: 'supply',
          actionPayload: {
            type: 'order_supply',
            targetId: 'INV-O2',
            details: { itemName: 'Type E Medical Oxygen Cylinders (20 units)' }
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    setScenario('normal');
  }, [setScenario]);

  // Main simulation tick: runs every 2 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setScenarioTimelineSec(prev => prev + 2);

      // 1. Tick ambulances: decrease ETA by 2 seconds
      setAmbulances(prevAmbs => {
        return prevAmbs.map(amb => {
          if (amb.etaSeconds > 0) {
            const nextEta = Math.max(0, amb.etaSeconds - 2);
            return { ...amb, etaSeconds: nextEta };
          }
          return amb;
        });
      });

      // 2. Tick supply requests: advance countdown
      setSupplyRequests(prevReqs => {
        return prevReqs.map(req => {
          if (req.status === 'delivered') return req;

          const nextEta = Math.max(0, req.etaSeconds - 2);
          if (nextEta === 0) {
            if (req.status === 'requested') return { ...req, status: 'preparing', etaSeconds: 60 };
            if (req.status === 'preparing') return { ...req, status: 'on_the_way', etaSeconds: 40 };
            if (req.status === 'on_the_way') return { ...req, status: 'delivered', etaSeconds: 0 };
          }
          return { ...req, etaSeconds: nextEta };
        });
      });

      // 3. Subtle realistic vitals fluctuation for admitted acute patients
      setPatients(prevPts => {
        return prevPts.map(pt => {
          if (pt.disposition === 'discharged') return pt;
          // small +/- 1 drift
          const hrDelta = (Math.random() > 0.6 ? 1 : Math.random() < 0.4 ? -1 : 0);
          const nextHr = Math.min(160, Math.max(50, pt.vitals.hr + hrDelta));
          const nextVitals = { ...pt.vitals, hr: nextHr };
          return { ...pt, vitals: nextVitals };
        });
      });

      // 4. Tick bed cleaning timers
      setBeds(prevBeds => {
        return prevBeds.map(bed => {
          if (bed.status === 'cleaning' && bed.cleaningProgressMinutes) {
            // randomly progress
            if (Math.random() > 0.8) {
              const nextMins = Math.max(0, bed.cleaningProgressMinutes - 1);
              if (nextMins === 0) {
                return { ...bed, status: 'free', cleaningProgressMinutes: undefined };
              }
              return { ...bed, cleaningProgressMinutes: nextMins };
            }
          }
          return bed;
        });
      });

      // 5. Operating Theatre finish countdown
      setOperatingTheatres(prevOts => {
        return prevOts.map(ot => {
          if (ot.status === 'in_use' && ot.estimatedFinishMinutes && ot.estimatedFinishMinutes > 0) {
            if (Math.random() > 0.85) {
              const nextFin = Math.max(0, ot.estimatedFinishMinutes - 1);
              return { ...ot, estimatedFinishMinutes: nextFin, nextAvailableMinutes: nextFin + 15 };
            }
          }
          return ot;
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Request actions
  const createSupplyRequest = useCallback((bedId: string, item: string, quantity: number, urgency: 'normal' | 'urgent' | 'stat') => {
    const eta = urgency === 'stat' ? 45 : urgency === 'urgent' ? 120 : 240;
    const newReq: SupplyRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      type: 'supply',
      bedId,
      item,
      quantity,
      urgency,
      status: 'requested',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      etaSeconds: eta,
      assignedRunner: 'Pneumatic Tube / Hub Runner'
    };

    setSupplyRequests(prev => [newReq, ...prev]);

    // Add alert
    const newAlert: SystemAlert = {
      id: `ALT-REQ-${Date.now()}`,
      tier: urgency === 'stat' ? 'critical' : 'info',
      title: `${urgency.toUpperCase()} Supply Request: ${item}`,
      message: `Dispatched to ${bedId} (Qty: ${quantity}). ETA: ${Math.round(eta / 60)} min.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'supply'
    };
    setAlerts(prev => [newAlert, ...prev]);

    logAuditAccess(`Created ${urgency} supply request for ${item} at ${bedId}`, undefined, 'FHIR SupplyRequest');
  }, [logAuditAccess]);

  const requestMedicationDelivery = useCallback((bedId: string, medOrderId: string) => {
    const targetPatient = patients.find(p => p.bedId === bedId);
    if (!targetPatient) return;
    const med = targetPatient.medications.find(m => m.id === medOrderId);
    if (!med) return;

    const newReq: SupplyRequest = {
      id: `REQ-MED-${Date.now().toString().slice(-4)}`,
      type: 'medication',
      bedId,
      item: `${med.drugName} (${med.dose})`,
      quantity: 1,
      urgency: 'urgent',
      status: 'requested',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      etaSeconds: 90,
      assignedRunner: 'Pharmacy Robot Station 3'
    };

    setSupplyRequests(prev => [newReq, ...prev]);

    // Update medication order status to requested
    setPatients(prevPts => prevPts.map(pt => {
      if (pt.id !== targetPatient.id) return pt;
      return {
        ...pt,
        medications: pt.medications.map(m => m.id === medOrderId ? { ...m, status: 'requested', etaSeconds: 90 } : m)
      };
    }));

    logAuditAccess(`Triggered pharmacy delivery for ${med.drugName} to ${bedId}`, targetPatient.id, 'FHIR MedicationDispense');
  }, [patients, logAuditAccess]);

  const updateRequestStatus = useCallback((requestId: string, nextStatus: SupplyRequest['status']) => {
    setSupplyRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: nextStatus, etaSeconds: nextStatus === 'delivered' ? 0 : r.etaSeconds };
      }
      return r;
    }));
  }, []);

  const approveSuggestion = useCallback((suggestionId: string) => {
    const sug = suggestions.find(s => s.id === suggestionId);
    if (!sug) return;

    if (sug.actionPayload.type === 'send_resus_kit') {
      createSupplyRequest(sug.actionPayload.targetId, sug.actionPayload.details.kitName, 1, 'stat');
    } else if (sug.actionPayload.type === 'order_supply') {
      // replenish inventory
      const targetId = sug.actionPayload.targetId;
      setInventory(prev => prev.map(inv => inv.id === targetId ? { ...inv, currentStock: inv.currentStock + 15 } : inv));
      createSupplyRequest('CENTRAL-SUPPLY', sug.actionPayload.details.itemName || 'Emergency Restock', 1, 'urgent');
    } else if (sug.actionPayload.type === 'assign_bed') {
      const { patientId, bedId } = sug.actionPayload.details;
      assignBedToPatient(patientId, bedId);
    }

    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    logAuditAccess(`Approved Sanad recommendation: ${sug.title}`, undefined, 'AI Clinical Recommendation');
  }, [suggestions, createSupplyRequest, logAuditAccess]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const assignBedToPatient = useCallback((patientId: string, bedId: string) => {
    setBeds(prevBeds => prevBeds.map(b => {
      if (b.id === bedId) return { ...b, status: 'occupied', currentPatientId: patientId };
      if (b.currentPatientId === patientId) return { ...b, status: 'free', currentPatientId: undefined };
      return b;
    }));

    setPatients(prevPts => prevPts.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          bedId,
          zone: bedId.startsWith('RESUS') ? 'resus' : bedId.startsWith('FT') ? 'fasttrack' : 'acute',
          timeline: [
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              event: `Assigned to Bed ${bedId}`,
              clinician: 'Bed Coordinator',
              type: 'move'
            },
            ...p.timeline
          ]
        };
      }
      return p;
    }));

    logAuditAccess(`Assigned bed ${bedId} to patient ${patientId}`, patientId, 'FHIR Location Move');
  }, [logAuditAccess]);

  const assignBayToAmbulance = useCallback((ambulanceId: string, bayId: string) => {
    setAmbulances(prev => prev.map(a => a.id === ambulanceId ? { ...a, assignedBay: bayId } : a));
    // Reserve bed
    setBeds(prev => prev.map(b => b.id === bayId ? { ...b, status: 'reserved' } : b));
    logAuditAccess(`Pre-allocated ${bayId} for incoming ambulance ${ambulanceId}`, undefined, 'Pre-Hospital Triage');
  }, [logAuditAccess]);

  const bookOperatingTheatre = useCallback((payload: BookOTPayload) => {
    setOperatingTheatres(prev => prev.map(ot => {
      if (ot.id === payload.otId) {
        return {
          ...ot,
          status: 'in_use',
          currentProcedure: payload.procedureName,
          assignedSurgeon: payload.surgeon,
          assignedAnaesthetist: payload.anaesthetist,
          estimatedFinishMinutes: payload.durationMinutes,
          nextAvailableMinutes: payload.durationMinutes + 15,
        };
      }
      return ot;
    }));

    if (payload.patientId) {
      setPatients(prevPts => prevPts.map(pt => {
        if (pt.id === payload.patientId) {
          return {
            ...pt,
            disposition: 'or_transfer',
            timeline: [
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event: `Booked for surgery in ${payload.otId}: ${payload.procedureName}`,
                clinician: payload.surgeon,
                type: 'status'
              },
              ...pt.timeline
            ]
          };
        }
        return pt;
      }));
    }

    setAlerts(prev => [
      {
        id: `ALT-OT-${Date.now()}`,
        tier: payload.urgency === 'stat' ? 'critical' : 'info',
        title: `Operating Theatre ${payload.otId} Reserved`,
        message: `${payload.procedureName} booked by ${payload.surgeon}. Duration: ~${payload.durationMinutes} min.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'clinical'
      },
      ...prev
    ]);

    logAuditAccess(`Booked Operating Theatre ${payload.otId} for ${payload.procedureName}`, payload.patientId, 'OperatingTheatre Booking');
    setIsBookOTOpen(false);
  }, [logAuditAccess]);

  return (
    <SimulationContext.Provider
      value={{
        role,
        setRole,
        scenario,
        setScenario,
        scenarioTimelineSec,
        setScenarioTimelineSec,
        isPaused,
        setIsPaused,
        resetSimulation,
        diversionStatus,
        patients,
        beds,
        ambulances,
        operatingTheatres,
        equipment,
        alerts,
        suggestions,
        supplyRequests,
        inventory,
        auditLogs,
        selectedPatientId,
        setSelectedPatientId,
        selectedBedId,
        setSelectedBedId,
        selectedKpiKey,
        setSelectedKpiKey,
        selectedEquipmentId,
        setSelectedEquipmentId,
        esiFilter,
        setEsiFilter,
        isBookOTOpen,
        setIsBookOTOpen,
        preselectedOTId,
        setPreselectedOTId,
        bookOperatingTheatre,
        createSupplyRequest,
        requestMedicationDelivery,
        updateRequestStatus,
        approveSuggestion,
        dismissSuggestion,
        dismissAlert,
        assignBedToPatient,
        assignBayToAmbulance,
        logAuditAccess
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
