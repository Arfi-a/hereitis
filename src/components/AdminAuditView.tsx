/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import {
  ShieldCheck,
  UserCheck,
  WifiOff,
  Database,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';

export const AdminAuditView: React.FC = () => {
  const { t } = useLanguage();
  const { auditLogs, beds } = useSimulation();

  const silentBeds = beds.filter(b => b.sensorSilent || b.status === 'unknown');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Healthcare Governance, Audit Trail & Sensor Health
            </h3>
            <span className="text-[11px] text-slate-500">
              UAE Health Data Law No. 2/2019 & ISO 27001 Access Ledger
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
          Compliant (All PII Pseudonymised)
        </span>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>UAE Federal Law No. 2/2019</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            All clinical telemetry, encounters, and orders are hosted within UAE sovereign data borders. Patient records use pseudonymised tokens.
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Sensor Failsafe Rule</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {silentBeds.length > 0 ? (
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                {silentBeds.length} bed sensor(s) silent (Bed 8). Correctly reported as 'Unknown', never assumed empty.
              </span>
            ) : (
              'All telemetry sensors reporting healthy heartbeats.'
            )}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Staff Privacy Preservation</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Location tracking enforced exclusively at zone/cubicle level. Individual staff surveillance is strictly prohibited by policy.
          </p>
        </div>
      </div>

      {/* Access Audit Trail Table */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
          Immutable Access Audit Log (Recent Electronic Health Record Queries)
        </h4>

        <div className="overflow-x-auto max-h-[260px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Clinician / User</th>
                <th className="py-2 px-3">Action Performed</th>
                <th className="py-2 px-3">Target Resource</th>
                <th className="py-2 px-3">Law Compliance Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">{log.userName}</td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="py-2 px-3 text-teal-700 dark:text-teal-400">{log.patientId || log.resourceType}</td>
                  <td className="py-2 px-3 text-slate-400 text-[10px]">{log.lawComplianceTag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
