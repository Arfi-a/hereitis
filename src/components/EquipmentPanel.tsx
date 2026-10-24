/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { EquipmentCategory } from '../types';
import {
  Wind,
  Zap,
  Activity,
  Droplet,
  Scan,
  Circle,
  X,
  BatteryCharging,
  Cpu,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const EquipmentPanel: React.FC = () => {
  const { t, language } = useLanguage();
  const { equipment, selectedEquipmentId, setSelectedEquipmentId } = useSimulation();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind': return Wind;
      case 'Zap': return Zap;
      case 'Activity': return Activity;
      case 'Droplet': return Droplet;
      case 'Scan': return Scan;
      case 'Circle': default: return Circle;
    }
  };

  const activeCategory = equipment.find(e => e.id === selectedEquipmentId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('equipmentPanelTitle')}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Biomedical Telemetry & Location Tracking
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500">
          6 Clinical Categories
        </span>
      </div>

      {/* Equipment Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {equipment.map(cat => {
          const Icon = getCategoryIcon(cat.iconName);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedEquipmentId(cat.id)}
              className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 hover:border-teal-500/50 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="p-1.5 rounded bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-slate-200/80 dark:border-slate-700 group-hover:bg-teal-50">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {cat.free} free
                </span>
              </div>

              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate mb-1">
                {language === 'ar' ? cat.nameAr : cat.name}
              </div>

              {/* Status pills: Free / In Use / Cleaning / Maint */}
              <div className="grid grid-cols-4 gap-1 text-[10px] font-mono tabular-nums text-center">
                <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 py-0.5 rounded" title="Free">
                  {cat.free}F
                </div>
                <div className="bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 py-0.5 rounded" title="In Use">
                  {cat.inUse}U
                </div>
                <div className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 py-0.5 rounded" title="Cleaning">
                  {cat.cleaning}C
                </div>
                <div className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 py-0.5 rounded" title="Service">
                  {cat.maintenance}M
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Unit Level Detail Modal */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {language === 'ar' ? activeCategory.nameAr : activeCategory.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {activeCategory.total} Total Units Tracked · RFID/BLE Sub-meter
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEquipmentId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {activeCategory.items.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {item.serial}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      <span>{item.zone}</span>
                      {item.assignedBed && <span>(Assigned: {item.assignedBed})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.batteryPercent !== undefined && (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                        {item.batteryPercent}%
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${
                        item.status === 'free'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.status === 'in_use'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : item.status === 'cleaning'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEquipmentId(null)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
