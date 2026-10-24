/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import {
  X,
  BedDouble,
  Cpu,
  Scissors,
  Clock4,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const DrillDownModal: React.FC = () => {
  const { t } = useLanguage();
  const { selectedKpiKey, setSelectedKpiKey, beds, equipment, operatingTheatres, patients } = useSimulation();

  if (!selectedKpiKey) return null;

  const handleClose = () => setSelectedKpiKey(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
              {selectedKpiKey === 'beds' && <BedDouble className="w-5 h-5" />}
              {selectedKpiKey === 'equipment' && <Cpu className="w-5 h-5" />}
              {selectedKpiKey === 'ots' && <Scissors className="w-5 h-5" />}
              {selectedKpiKey === 'wait' && <Clock4 className="w-5 h-5" />}
              {selectedKpiKey === 'patients' && <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
                {selectedKpiKey === 'beds' && 'Inpatient & ER Bed Capacity Breakdown'}
                {selectedKpiKey === 'equipment' && 'Biomedical Asset Availability'}
                {selectedKpiKey === 'ots' && 'Surgical Operating Theatres Overview'}
                {selectedKpiKey === 'wait' && 'Emergency Department Throughput & Wait Time Analytics'}
                {selectedKpiKey === 'patients' && 'Emergency Census & Acuity Distribution'}
              </h3>
              <span className="text-xs text-slate-500">
                Granular clinical drill-down for command decision support
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Based on KPI Key */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto text-xs pr-1">
          {selectedKpiKey === 'beds' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="text-[10px] block font-sans">ER Free</span>
                  <span className="text-base font-bold">{beds.filter(b => b.status === 'free').length}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                  <span className="text-[10px] block font-sans">ER Occupied</span>
                  <span className="text-base font-bold">{beds.filter(b => b.status === 'occupied').length}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <span className="text-[10px] block font-sans">Cleaning</span>
                  <span className="text-base font-bold">{beds.filter(b => b.status === 'cleaning').length}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <span className="text-[10px] block font-sans">Reserved</span>
                  <span className="text-base font-bold">{beds.filter(b => b.status === 'reserved').length}</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-1">
                Hospital Ward Inpatient Availability:
              </h4>
              <div className="space-y-1.5">
                {[
                  { ward: 'Intensive Care Unit (ICU)', total: 24, free: 2, status: 'Critical / 1 bed turnover' },
                  { ward: 'Coronary Care Unit (CCU)', total: 16, free: 3, status: 'Normal' },
                  { ward: 'High Dependency Unit (HDU)', total: 20, free: 4, status: 'Normal' },
                  { ward: 'Acute Surgical Ward', total: 40, free: 8, status: 'Available' },
                  { ward: 'Internal Medicine Ward', total: 60, free: 12, status: 'Available' },
                  { ward: 'Pediatric Inpatient Unit', total: 20, free: 7, status: 'Available' },
                ].map(w => (
                  <div key={w.ward} className="p-2.5 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{w.ward}</span>
                      <span className="block text-[10px] text-slate-500">{w.status}</span>
                    </div>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      {w.free} / {w.total} free
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedKpiKey === 'equipment' && (
            <div className="space-y-2">
              {equipment.map(cat => (
                <div key={cat.id} className="p-2.5 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {cat.inUse} in use · {cat.cleaning} in sterilisation · {cat.maintenance} in biomedical workshop
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {cat.free} Available
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedKpiKey === 'ots' && (
            <div className="space-y-2">
              {operatingTheatres.map(ot => (
                <div key={ot.id} className="p-2.5 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ot.name}</span>
                    <span className="block text-[10px] text-slate-500">{ot.specialty} · Surgeon: {ot.assignedSurgeon || 'Standby'}</span>
                  </div>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400 capitalize">
                    {ot.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedKpiKey === 'wait' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                <span className="font-bold text-teal-950 dark:text-teal-200 block mb-1">
                  UAE Ministry of Health & Prevention Door-to-Doctor Target: &lt; 30 min
                </span>
                <p className="text-[11px] text-teal-800 dark:text-teal-300">
                  Current hospital average is within acceptable quality bounds. Resuscitation (ESI 1) door-to-doctor is currently 0.0 minutes (Immediate bedside handover).
                </p>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span>ESI 1 (Resus) Average:</span>
                  <span className="font-bold text-emerald-600">Immediate (&lt; 1 min)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span>ESI 2 (Emergent) Average:</span>
                  <span className="font-bold text-teal-600">14 minutes</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span>ESI 3 (Urgent) Average:</span>
                  <span className="font-bold text-amber-600">32 minutes</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span>ESI 4 (Less Urgent) Average:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">22 minutes (Fast Track)</span>
                </div>
              </div>
            </div>
          )}

          {selectedKpiKey === 'patients' && (
            <div className="space-y-2">
              <p className="text-slate-600 dark:text-slate-300">
                Currently <strong>{patients.length} active patients</strong> in the emergency department census.
              </p>
              <div className="space-y-1 font-mono">
                {[1, 2, 3, 4, 5].map(lvl => {
                  const count = patients.filter(p => p.esi === lvl).length;
                  return (
                    <div key={lvl} className="flex justify-between p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span>ESI Level {lvl}:</span>
                      <span className="font-bold">{count} patients</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  );
};
