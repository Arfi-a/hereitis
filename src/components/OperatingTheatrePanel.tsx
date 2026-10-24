/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { OperatingTheatre } from '../types';
import {
  Scissors,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const OperatingTheatrePanel: React.FC = () => {
  const { t } = useLanguage();
  const { operatingTheatres, scenario, setIsBookOTOpen, setPreselectedOTId } = useSimulation();

  const getStatusMeta = (status: OperatingTheatre['status']) => {
    switch (status) {
      case 'in_use':
        return {
          label: t('otInUse'),
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
          ringColor: 'stroke-rose-500',
        };
      case 'cleaning':
        return {
          label: t('otCleaning'),
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
          ringColor: 'stroke-amber-500',
        };
      case 'reserved_emergency':
        return {
          label: t('otReserved'),
          badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800',
          ringColor: 'stroke-indigo-500',
        };
      case 'available':
      default:
        return {
          label: t('otAvailable'),
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
          ringColor: 'stroke-emerald-500',
        };
    }
  };

  const showBottleneckWarning = scenario === 'collision';

  const handleOpenBooking = (otId?: string) => {
    if (otId) setPreselectedOTId(otId);
    setIsBookOTOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('otPanelTitle')}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Surgical Suite Capacity & Turnaround
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenBooking()}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>+ Book OT</span>
          </button>
          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
            4 Suites
          </span>
        </div>
      </div>

      {/* Bottleneck Prediction Alert (Scenario Reactive) */}
      {showBottleneckWarning && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Predictive Bottleneck Advisory:</span>{' '}
            {t('otBottleneckWarning')}
          </div>
        </div>
      )}

      {/* 4 OT Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {operatingTheatres.map(ot => {
          const meta = getStatusMeta(ot.status);
          const percent = ot.status === 'in_use'
            ? Math.max(10, Math.min(90, 100 - (ot.estimatedFinishMinutes || 30) * 1.5))
            : ot.status === 'cleaning' ? 70 : 100;

          // Circumference for r=16 is ~100
          const dashOffset = 100 - (percent);

          return (
            <div
              key={ot.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between"
            >
              {/* Top row: Name + Progress Ring */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {ot.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">{ot.specialty}</p>
                </div>

                {/* Progress Ring */}
                <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      className="fill-none stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      className={`fill-none ${meta.ringColor} transition-all duration-500`}
                      strokeWidth="3"
                      strokeDasharray="94.2"
                      strokeDashoffset={(94.2 * (100 - percent)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono text-[9px] font-bold text-slate-700 dark:text-slate-300">
                    {Math.round(percent)}%
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${meta.badgeClass}`}>
                  {meta.label}
                </span>
                {ot.currentProcedure && (
                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate mt-1">
                    {ot.currentProcedure}
                  </p>
                )}
              </div>

              {/* Staff & Next Available */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>{t('otSurgeon')}:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                    {ot.assignedSurgeon || 'Standby'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('otAnaesthetist')}:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                    {ot.assignedAnaesthetist || 'Standby'}
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono font-semibold text-teal-700 dark:text-teal-400 pt-0.5">
                  <span>{t('otNextAvailable')}: {ot.nextAvailableMinutes > 0 ? `${ot.nextAvailableMinutes} min` : 'Now'}</span>
                  <button
                    onClick={() => handleOpenBooking(ot.id)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer"
                  >
                    + Book
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
