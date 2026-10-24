/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ESILevel = 1 | 2 | 3 | 4 | 5;

export type BedStatus = 'occupied' | 'free' | 'cleaning' | 'reserved' | 'unknown';

export type DiversionStatus = 'green' | 'amber' | 'red';

export type UserRole = 'charge_nurse' | 'doctor' | 'administrator' | 'supply_pharmacy';

export type ScenarioType = 'normal' | 'collision' | 'heatstroke' | 'duststorm';

export interface Vitals {
  hr: number; // bpm
  sbp: number; // mmHg
  dbp: number; // mmHg
  spo2: number; // %
  temp: number; // °C
  rr: number; // breaths/min
  gcs?: number; // Glasgow Coma Scale (3-15)
}

export interface VitalHistoryPoint {
  time: string;
  hr: number;
  sbp: number;
  dbp: number;
  spo2: number;
  temp: number;
  rr: number;
}

export interface MedicationOrder {
  id: string;
  drugName: string;
  dose: string;
  route: string; // IV, Oral, Nebulised, SC
  orderedBy: string;
  orderedAt: string;
  status: 'ordered' | 'requested' | 'preparing' | 'on_the_way' | 'delivered' | 'administered';
  etaSeconds?: number;
}

export interface SupplyRequest {
  id: string;
  type: 'supply' | 'medication';
  bedId: string;
  item: string;
  quantity: number;
  urgency: 'normal' | 'urgent' | 'stat';
  status: 'requested' | 'preparing' | 'on_the_way' | 'delivered';
  requestedAt: string;
  etaSeconds: number; // countdown
  assignedRunner?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number (pseudonymised UAE format)
  name?: string;
  pseudonym: string; // e.g. "Patient 104"
  age: number;
  gender: 'M' | 'F';
  esi: ESILevel;
  esiReason: string;
  bedId?: string; // e.g. 'BAY-04', 'RESUS-02', 'WAITING'
  zone: string;
  chiefComplaint: string;
  triageNotes: string;
  assignedDoctor: string;
  assignedNurse: string;
  arrivalTime: string;
  waitTimeMinutes: number;
  vitals: Vitals;
  vitalHistory: VitalHistoryPoint[];
  medications: MedicationOrder[];
  allergies: string[];
  arrivalMethod: 'Ambulance' | 'Walk-in' | 'Helicopter' | 'Police Transfer';
  disposition: 'triage' | 'treatment' | 'admitted_waiting_bed' | 'admitted_icu' | 'discharged' | 'or_transfer';
  admitWaitTime?: string; // e.g. "2h 15m"
  admitTargetWard?: string; // e.g. "ICU Bed 4", "Surgical Ward"
  timeline: {
    time: string;
    event: string;
    clinician: string;
    type: 'triage' | 'doctor' | 'order' | 'result' | 'move' | 'status';
  }[];
}

export interface Bed {
  id: string;
  zone: 'resus' | 'acute' | 'subacute' | 'fasttrack' | 'imaging' | 'waiting';
  label: string;
  status: BedStatus;
  currentPatientId?: string;
  cleaningProgressMinutes?: number;
  sensorSilent?: boolean; // sensor didn't report
  lastSensorPing: string;
  specialty?: string;
}

export interface IncomingAmbulance {
  id: string;
  callSign: string; // e.g. "AMB-204"
  agency: 'National Ambulance' | 'Dubai DCAS' | 'Private Medical';
  etaSeconds: number; // countdown
  esi: ESILevel;
  patientAge: number;
  patientGender: 'M' | 'F';
  chiefComplaint: string;
  vitals: Partial<Vitals>;
  assignedBay?: string;
  rerouted?: boolean;
  rerouteDestination?: string;
}

export interface OperatingTheatre {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'in_use' | 'cleaning' | 'reserved_emergency';
  currentProcedure?: string;
  assignedSurgeon?: string;
  assignedAnaesthetist?: string;
  estimatedFinishMinutes?: number;
  nextAvailableMinutes: number;
}

export interface BookOTPayload {
  otId: string;
  patientId: string;
  patientName?: string;
  procedureName: string;
  urgency: 'stat' | 'urgent' | 'scheduled';
  durationMinutes: number;
  surgeon: string;
  anaesthetist: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  nameAr: string;
  iconName: string;
  total: number;
  free: number;
  inUse: number;
  cleaning: number;
  maintenance: number;
  items: {
    id: string;
    serial: string;
    zone: string;
    status: 'free' | 'in_use' | 'cleaning' | 'maintenance';
    batteryPercent?: number;
    assignedBed?: string;
  }[];
}

export interface SystemAlert {
  id: string;
  tier: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  persistent?: boolean;
  category: 'diversion' | 'ambulance' | 'bed' | 'supply' | 'clinical';
  dismissed?: boolean;
}

export interface SanadSuggestion {
  id: string;
  title: string;
  reason: string;
  category: 'supply' | 'bed_turnover' | 'kit_prep' | 'staffing';
  actionPayload: {
    type: 'order_supply' | 'assign_bed' | 'send_resus_kit' | 'request_divert_lift';
    targetId: string;
    details?: any;
  };
  approved?: boolean;
  dismissed?: boolean;
  timestamp: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userRole: string;
  userName: string;
  action: string;
  patientId?: string;
  resourceType: string;
  ipAddress: string;
  lawComplianceTag: string; // "UAE Fed Law No. 2/2019"
}

export interface SupplyInventoryItem {
  id: string;
  name: string;
  nameAr: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  surgeUsageRatePerHour: number;
}
