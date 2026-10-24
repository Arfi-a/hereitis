/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { SupplyRequest } from '../types';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  AlertTriangle
} from 'lucide-react';

export const PharmacySupplyView: React.FC = () => {
  const { t } = useLanguage();
  const { supplyRequests, updateRequestStatus, inventory } = useSimulation();

  const getUrgencyBadge = (urgency: SupplyRequest['urgency']) => {
    switch (urgency) {
      case 'stat':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 font-bold';
      case 'urgent':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 font-semibold';
      case 'normal':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Supply Hub & Pharmacy Dispensing Kanban
            </h3>
            <span className="text-[11px] text-slate-500">
              Fulfillment queue for nurse and physician emergency orders
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
          {supplyRequests.filter(r => r.status !== 'delivered').length} Orders in Queue
        </span>
      </div>

      {/* Kanban / Table of incoming requests */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {supplyRequests.map(req => (
          <div
            key={req.id}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded border text-[10px] uppercase ${getUrgencyBadge(req.urgency)}`}>
                  {req.urgency}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {req.item}
                </span>
                <span className="font-mono text-slate-500">Qty: {req.quantity}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>Target: <strong>{req.bedId}</strong></span>
                <span>·</span>
                <span>Requested at: {req.requestedAt}</span>
                <span>·</span>
                <span>Runner: {req.assignedRunner || 'Assigned'}</span>
              </div>
            </div>

            {/* Action buttons to advance step */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400 capitalize px-2 py-1 rounded bg-teal-50 dark:bg-teal-950/40">
                {req.status.replace(/_/g, ' ')}
              </span>

              {req.status === 'requested' && (
                <button
                  onClick={() => updateRequestStatus(req.id, 'preparing')}
                  className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-medium transition-colors"
                >
                  Start Preparing
                </button>
              )}

              {req.status === 'preparing' && (
                <button
                  onClick={() => updateRequestStatus(req.id, 'on_the_way')}
                  className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-medium transition-colors"
                >
                  Dispatch to Bay
                </button>
              )}

              {req.status === 'on_the_way' && (
                <button
                  onClick={() => updateRequestStatus(req.id, 'delivered')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
                >
                  Confirm Delivered
                </button>
              )}

              {req.status === 'delivered' && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
