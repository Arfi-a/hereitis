/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { IncomingAmbulance, ESILevel } from '../types';
import {
  Siren,
  Clock,
  Heart,
  Activity,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const AmbulancePanel: React.FC = () => {
  const { t } = useLanguage();
  const { ambulances, beds, assignBayToAmbulance } = useSimulation();
  const [selectedAmbId, setSelectedAmbId] = useState<string | null>(null);

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return 'Arrived / Docked';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getEsiBadge = (esi: ESILevel) => {
    switch (esi) {
      case 1:
        return {
          label: 'ESI-1 Resus',
          bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
          dot: 'bg-rose-600',
        };
      case 2:
        return {
          label: 'ESI-2 Emergent',
          bg: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
        };
      case 3:
      default:
        return {
          label: 'ESI-3 Urgent',
          bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
    }
  };

  const availableBeds = beds.filter(b => b.status === 'free' || b.status === 'reserved');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Siren className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('ambulancePanelTitle')}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              National Ambulance & DCAS Dispatch
            </span>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {ambulances.length} Active
        </span>
      </div>

      {/* Ambulance Cards List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
        {ambulances.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No incoming pre-hospital units at this time.
          </div>
        ) : (
          ambulances.map(amb => {
            const esiInfo = getEsiBadge(amb.esi);
            const isRerouted = amb.rerouted;

            return (
              <div
                key={amb.id}
                className={`p-3 rounded-lg border transition-all ${
                  isRerouted
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 opacity-75'
                    : amb.esi === 1
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Row 1: Callsign + ETA + ESI badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">
                      {amb.callSign}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {amb.agency}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ESI badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${esiInfo.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${esiInfo.dot}`} />
                      {esiInfo.label}
                    </span>

                    {/* ETA countdown */}
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      <span>{formatEta(amb.etaSeconds)}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Patient Demographics & Complaint */}
                <div className="text-xs mb-2">
                  <div className="flex items-baseline gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                    <span className="font-mono text-[11px] text-slate-500">
                      {amb.patientAge}yo {amb.patientGender}
                    </span>
                    <span>·</span>
                    <span className="truncate" title={amb.chiefComplaint}>
                      {amb.chiefComplaint}
                    </span>
                  </div>
                </div>

                {/* Row 3: Pre-arrival Vitals strip */}
                {amb.vitals && !isRerouted && (
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 py-1 px-2 rounded bg-slate-100/70 dark:bg-slate-800/60 mb-2">
                    {amb.vitals.hr && (
                      <span className="flex items-center gap-1" title="Heart Rate">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {amb.vitals.hr}
                      </span>
                    )}
                    {amb.vitals.sbp && amb.vitals.dbp && (
                      <span title="Blood Pressure">
                        BP {amb.vitals.sbp}/{amb.vitals.dbp}
                      </span>
                    )}
                    {amb.vitals.spo2 && (
                      <span className={amb.vitals.spo2 < 92 ? 'text-rose-600 font-bold' : ''} title="Oxygen Saturation">
                        SpO2 {amb.vitals.spo2}%
                      </span>
                    )}
                    {amb.vitals.gcs && (
                      <span title="Glasgow Coma Scale">
                        GCS {amb.vitals.gcs}
                      </span>
                    )}
                  </div>
                )}

                {/* Row 4: Assigned Destination Bay or Reroute alert */}
                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  {isRerouted ? (
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t('reroutedTo')}: {amb.rerouteDestination}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <span className="text-[11px]">{t('destinationBay')}:</span>
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded text-[11px]">
                        {amb.assignedBay || 'Unassigned'}
                      </span>
                    </div>
                  )}

                  {!isRerouted && (
                    <div className="relative">
                      <select
                        value={amb.assignedBay || ''}
                        onChange={(e) => assignBayToAmbulance(amb.id, e.target.value)}
                        className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        aria-label="Reassign Bay"
                      >
                        <option value="">Assign Bay...</option>
                        {availableBeds.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.label} ({b.zone.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
