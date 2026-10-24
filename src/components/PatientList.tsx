/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { Patient, ESILevel } from '../types';
import {
  Users,
  Search,
  AlertCircle,
  Clock,
  User,
  BedDouble,
  Heart,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export const PatientList: React.FC = () => {
  const { t } = useLanguage();
  const { patients, setSelectedPatientId, esiFilter, setEsiFilter } = useSimulation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ESI Styling (WCAG AA compliant, subtle red/urgent styling for 1 and 2)
  const getEsiBadge = (esi: ESILevel) => {
    switch (esi) {
      case 1:
        return {
          label: 'ESI 1 Resus',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 font-bold',
          rowClass: 'border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/15',
        };
      case 2:
        return {
          label: 'ESI 2 Emergent',
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800 font-semibold',
          rowClass: 'border-l-4 border-l-amber-500 bg-amber-50/15 dark:bg-amber-950/10',
        };
      case 3:
        return {
          label: 'ESI 3 Urgent',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
          rowClass: 'border-l-2 border-l-slate-300 dark:border-l-slate-700',
        };
      case 4:
        return {
          label: 'ESI 4 Less Urgent',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
          rowClass: 'border-l-2 border-l-slate-200 dark:border-l-slate-800',
        };
      case 5:
      default:
        return {
          label: 'ESI 5 Non-Urgent',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
          rowClass: 'border-l-2 border-l-slate-200 dark:border-l-slate-800',
        };
    }
  };

  // Filter & sort: ESI 1 and 2 at top, then wait time descending
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => {
        if (esiFilter !== 'all' && p.esi !== esiFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.pseudonym.toLowerCase().includes(q) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          p.chiefComplaint.toLowerCase().includes(q) ||
          (p.bedId && p.bedId.toLowerCase().includes(q)) ||
          p.assignedDoctor.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.esi !== b.esi) return a.esi - b.esi; // ESI 1 first, then 2, etc.
        return b.waitTimeMinutes - a.waitTimeMinutes; // longer wait time first within tier
      });
  }, [patients, esiFilter, searchQuery]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Header with Title and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('patientQueueTitle')}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {filteredPatients.length} Active Patients · ESI Triaged
            </span>
          </div>
        </div>

        {/* Search input + Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPatient')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 w-44 sm:w-60"
            />
          </div>

          {/* ESI Filter Buttons */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setEsiFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                esiFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {([1, 2, 3, 4] as ESILevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setEsiFilter(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                  esiFilter === lvl
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ESI {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table / List Rows */}
      <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-100 dark:divide-slate-800/80 pr-1">
        {filteredPatients.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No patients match current triage filter.
          </div>
        ) : (
          filteredPatients.map(patient => {
            const esiInfo = getEsiBadge(patient.esi);
            const isBoarding = patient.disposition === 'admitted_waiting_bed';

            return (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`py-2.5 px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer rounded-md ${esiInfo.rowClass}`}
                role="button"
                tabIndex={0}
                title="Click to view full clinical record & FHIR telemetry"
              >
                {/* Main line: Patient & Bed + Demographics + ESI + Wait time + Clinician */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {patient.pseudonym} · {patient.bedId || 'Triage Waiting'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      ({patient.age}{patient.gender})
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${esiInfo.badgeClass}`}>
                      {esiInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums">{patient.waitTimeMinutes}m wait</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[130px]">{patient.assignedDoctor}</span>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Complaint line */}
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-baseline gap-2">
                  <span className="font-semibold text-slate-500 text-[11px] shrink-0">{t('chiefComplaint')}:</span>
                  <span className="truncate">{patient.chiefComplaint}</span>
                </div>

                {/* Inpatient Bed Boarding Alert line (If admitted and waiting for inpatient bed) */}
                {isBoarding && (
                  <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <span className="font-medium">
                      ⚠️ {t('waitingForICUBed')} ({patient.admitWaitTime || '2h 10m'})
                    </span>
                    <span className="font-mono text-[10px]">{patient.admitTargetWard}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
