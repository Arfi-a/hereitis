/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { Patient, ESILevel } from '../types';
import {
  X,
  User,
  Heart,
  Clock,
  Pill,
  MapPin,
  Code2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Stethoscope,
  Share2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const PatientReportDrawer: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedPatientId, setSelectedPatientId, patients, logAuditAccess } = useSimulation();

  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'timeline' | 'orders' | 'disposition' | 'fhir'>('overview');

  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) return null;

  const handleClose = () => {
    setSelectedPatientId(null);
  };

  // Generate valid FHIR R4 JSON representation
  const generateFhirJson = (p: Patient) => {
    return {
      resourceType: "Bundle",
      id: `sanad-bundle-${p.id}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
      },
      type: "collection",
      entry: [
        {
          fullUrl: `urn:uuid:${p.id}-patient`,
          resource: {
            resourceType: "Patient",
            id: p.id,
            identifier: [
              {
                system: "https://mohap.gov.ae/malaffi/mrn",
                value: p.mrn,
                type: {
                  coding: [
                    { system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR", display: "Medical Record Number" }
                  ]
                }
              }
            ],
            name: [{ text: p.name || p.pseudonym }],
            gender: p.gender === 'M' ? "male" : "female",
            birthDate: `19${90 - p.age}-04-12`,
            managingOrganization: { display: "Sheikh Khalifa Emergency Hospital" }
          }
        },
        {
          fullUrl: `urn:uuid:${p.id}-encounter`,
          resource: {
            resourceType: "Encounter",
            id: `ENC-${p.id}`,
            status: "in-progress",
            class: {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
              code: "EMER",
              display: "Emergency Encounter"
            },
            priority: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: p.esi === 1 ? "44054006" : p.esi === 2 ? "44055007" : "44056008",
                  display: `Emergency Severity Index level ${p.esi}`
                }
              ]
            },
            reasonCode: [
              {
                text: p.chiefComplaint
              }
            ],
            location: [
              {
                location: { display: p.bedId || "Waiting Room" },
                status: "active"
              }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:${p.id}-obs-hr`,
          resource: {
            resourceType: "Observation",
            id: `OBS-HR-${p.id}`,
            status: "final",
            category: [
              {
                coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }]
              }
            ],
            code: {
              coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }]
            },
            valueQuantity: {
              value: p.vitals.hr,
              unit: "beats/minute",
              system: "http://unitsofmeasure.org",
              code: "/min"
            }
          }
        },
        {
          fullUrl: `urn:uuid:${p.id}-obs-bp`,
          resource: {
            resourceType: "Observation",
            id: `OBS-BP-${p.id}`,
            status: "final",
            code: {
              coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel with all children" }]
            },
            component: [
              {
                code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] },
                valueQuantity: { value: p.vitals.sbp, unit: "mmHg" }
              },
              {
                code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] },
                valueQuantity: { value: p.vitals.dbp, unit: "mmHg" }
              }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:${p.id}-obs-spo2`,
          resource: {
            resourceType: "Observation",
            id: `OBS-SPO2-${p.id}`,
            status: "final",
            code: {
              coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation in Arterial blood" }]
            },
            valueQuantity: { value: p.vitals.spo2, unit: "%" }
          }
        }
      ]
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
              {patient.bedId ? patient.bedId.split('-')[0] : 'ER'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {patient.pseudonym}
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  MRN: {patient.mrn}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300">
                  ESI {patient.esi}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {patient.age}yo {patient.gender} · Bed: {patient.bedId || 'Waiting Area'} · Seen by {patient.assignedDoctor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('closeDrawer')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Tabs Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs bg-slate-100/70 dark:bg-slate-900">
          {[
            { id: 'overview', label: t('tabOverview'), icon: FileText },
            { id: 'vitals', label: t('tabVitals'), icon: Heart },
            { id: 'timeline', label: t('tabTimeline'), icon: Clock },
            { id: 'orders', label: t('tabOrders'), icon: Pill },
            { id: 'disposition', label: t('tabDisposition'), icon: MapPin },
            { id: 'fhir', label: t('tabFHIR'), icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'fhir') {
                    logAuditAccess(`Accessed HL7 FHIR JSON standards bundle for ${patient.pseudonym}`, patient.id, 'HL7 FHIR R4 Bundle');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              {/* Triage & Clinical Assessment Card */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Triage Acuity Assessment (ESI Level {patient.esi})
                  </span>
                  <span className="font-mono text-slate-500">Arrived: {patient.arrivalTime} ({patient.waitTimeMinutes}m ago)</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Acuity Rationale:</strong> {patient.esiReason}
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Initial Triage Notes:</strong> {patient.triageNotes}
                </p>
              </div>

              {/* Patient Attributes Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[11px] text-slate-500">Arrival Method</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{patient.arrivalMethod}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[11px] text-slate-500">Assigned Nurse</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{patient.assignedNurse}</p>
                </div>
              </div>

              {/* Allergies Alert */}
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20">
                <span className="font-bold text-rose-900 dark:text-rose-200 block mb-1">
                  Allergies & Contraindications:
                </span>
                {patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map(a => (
                      <span key={a} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold font-mono text-[11px]">
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {t('noAllergies')}
                  </span>
                )}
              </div>

              {/* Current Snapshot Vitals */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-2">
                  Telemetry Snapshot
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">HR</span>
                    <span className="font-bold text-sm text-rose-600">{patient.vitals.hr}</span>
                    <span className="text-[9px] text-slate-400 block">bpm</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">BP</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{patient.vitals.sbp}/{patient.vitals.dbp}</span>
                    <span className="text-[9px] text-slate-400 block">mmHg</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">SpO2</span>
                    <span className="font-bold text-sm text-teal-600">{patient.vitals.spo2}%</span>
                    <span className="text-[9px] text-slate-400 block">on O2</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">Temp</span>
                    <span className="font-bold text-sm text-amber-600">{patient.vitals.temp}°C</span>
                    <span className="text-[9px] text-slate-400 block">Tympanic</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">RR</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{patient.vitals.rr}</span>
                    <span className="text-[9px] text-slate-400 block">/min</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 block">GCS</span>
                    <span className="font-bold text-sm text-indigo-600">{patient.vitals.gcs || 15}</span>
                    <span className="text-[9px] text-slate-400 block">/15</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTINUOUS VITALS CHART */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                  Heart Rate & Blood Pressure Trend
                </h4>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patient.vitalHistory.length > 0 ? patient.vitalHistory : [
                      { time: '02:00', hr: patient.vitals.hr - 4, sbp: patient.vitals.sbp - 6, dbp: patient.vitals.dbp - 2, spo2: patient.vitals.spo2, temp: patient.vitals.temp, rr: patient.vitals.rr },
                      { time: '02:30', hr: patient.vitals.hr - 2, sbp: patient.vitals.sbp - 3, dbp: patient.vitals.dbp, spo2: patient.vitals.spo2, temp: patient.vitals.temp, rr: patient.vitals.rr },
                      { time: '03:00', hr: patient.vitals.hr, sbp: patient.vitals.sbp, dbp: patient.vitals.dbp, spo2: patient.vitals.spo2, temp: patient.vitals.temp, rr: patient.vitals.rr }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="hr" name="HR (bpm)" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="sbp" name="Systolic BP" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="dbp" name="Diastolic BP" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-6 text-xs">
              {patient.timeline.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="font-mono text-[10px] text-slate-500">{evt.time}</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{evt.event}</div>
                  <div className="text-[11px] text-slate-500">By {evt.clinician}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ORDERS & REQUESTS */}
          {activeTab === 'orders' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                Prescribed Medications & Dispensing Status
              </h4>
              <div className="space-y-2">
                {patient.medications.map(m => (
                  <div key={m.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{m.drugName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Dose: {m.dose} · {m.route} · Ordered at {m.orderedAt}</div>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 capitalize font-semibold">
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DISPOSITION */}
          {activeTab === 'disposition' && (
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Current Disposition Status:</span>
                <span className="font-bold capitalize text-slate-900 dark:text-slate-100">
                  {patient.disposition.replace(/_/g, ' ')}
                </span>
              </div>
              {patient.admitTargetWard && (
                <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
                  <strong>Inpatient Bed Request:</strong> {patient.admitTargetWard}
                  <span className="block text-[11px] mt-0.5">Holding time: {patient.admitWaitTime}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HL7 FHIR R4 JSON VIEW WITH LOINC & SNOMED CT */}
          {activeTab === 'fhir' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>HL7 FHIR R4 Resource Bundle (LOINC & SNOMED CT Encoded)</span>
                <span className="font-mono text-[10px]">UAE Federal Law No. 2/2019 Compliant</span>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[420px] border border-slate-800">
                {JSON.stringify(generateFhirJson(patient), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center text-xs text-slate-500">
          <span>Malaffi & Nabidh Federated Node: Connected</span>
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {t('closeDrawer')}
          </button>
        </div>
      </div>
    </div>
  );
};
