/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { ESILevel } from '../types';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Package,
  Clock,
  Layers
} from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { t, language } = useLanguage();
  const { patients, inventory, esiFilter, setEsiFilter, scenario } = useSimulation();

  const [timeRange, setTimeRange] = useState<'2h' | '6h' | '12h' | 'today'>('6h');
  const [activeChartTab, setActiveChartTab] = useState<'flow' | 'esi' | 'inventory'>('flow');

  // Realistic data generators responsive to scenarios
  const hourlyData = [
    { time: '20:00', arrivals: 6, admissions: 2, waitAvg: 18 },
    { time: '21:00', arrivals: 9, admissions: 4, waitAvg: 22 },
    { time: '22:00', arrivals: 14, admissions: 5, waitAvg: 28 },
    { time: '23:00', arrivals: 11, admissions: 4, waitAvg: 31 },
    { time: '00:00', arrivals: 8, admissions: 3, waitAvg: 26 },
    { time: '01:00', arrivals: 12, admissions: 4, waitAvg: 27 },
    { time: '02:00', arrivals: scenario === 'collision' ? 22 : 15, admissions: 6, waitAvg: scenario === 'collision' ? 44 : 29 },
    { time: '03:00', arrivals: scenario === 'collision' ? 18 : 10, admissions: 5, waitAvg: scenario === 'collision' ? 41 : 24 },
  ];

  const occupancyTrendData = [
    { time: '21:00', occupancy: 72, capacityThreshold: 85 },
    { time: '22:00', occupancy: 78, capacityThreshold: 85 },
    { time: '23:00', occupancy: 81, capacityThreshold: 85 },
    { time: '00:00', occupancy: 79, capacityThreshold: 85 },
    { time: '01:00', occupancy: 83, capacityThreshold: 85 },
    { time: '02:00', occupancy: scenario === 'collision' ? 96 : 84, capacityThreshold: 85 },
    { time: '03:00', occupancy: scenario === 'collision' ? 98 : 82, capacityThreshold: 85 },
  ];

  // ESI Distribution
  const esiCounts = [
    { name: 'ESI 1 Resus', level: 1 as ESILevel, value: patients.filter(p => p.esi === 1).length, color: '#F43F5E' },
    { name: 'ESI 2 Emergent', level: 2 as ESILevel, value: patients.filter(p => p.esi === 2).length, color: '#FB923C' },
    { name: 'ESI 3 Urgent', level: 3 as ESILevel, value: patients.filter(p => p.esi === 3).length, color: '#FBBF24' },
    { name: 'ESI 4 Less Urgent', level: 4 as ESILevel, value: patients.filter(p => p.esi === 4).length, color: '#60A5FA' },
    { name: 'ESI 5 Non-Urgent', level: 5 as ESILevel, value: patients.filter(p => p.esi === 5).length || 1, color: '#94A3B8' },
  ];

  // Inventory Levels for horizontal bar
  const inventoryChartData = inventory.map(item => ({
    name: language === 'ar' ? item.nameAr : item.name,
    stock: item.currentStock,
    min: item.minThreshold,
    unit: item.unit,
    isLow: item.currentStock <= item.minThreshold,
  }));

  const handleEsiSliceClick = (entry: any) => {
    if (esiFilter === entry.level) {
      setEsiFilter('all');
    } else {
      setEsiFilter(entry.level);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Chart Header + Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('analyticsTitle')}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive Trends & Real-Time Stock Depletion
            </span>
          </div>
        </div>

        {/* Tab & Time-Range Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Sub-Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveChartTab('flow')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeChartTab === 'flow'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Arrivals & Wait
            </button>
            <button
              onClick={() => setActiveChartTab('esi')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeChartTab === 'esi'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ESI Donut (Filter)
            </button>
            <button
              onClick={() => setActiveChartTab('inventory')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeChartTab === 'inventory'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Critical Stock
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {(['2h', '6h', '12h', 'today'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2 py-0.5 rounded border ${
                  timeRange === tr
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                }`}
              >
                {tr.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[220px]">
        {/* VIEW 1: FLOW (Hourly arrivals + Wait time trend) */}
        {activeChartTab === 'flow' && (
          <div className="w-full h-full min-h-[220px]">
            <div className="text-[11px] text-slate-500 flex items-center justify-between mb-1">
              <span>Hourly Patient Influx vs Average Wait Time (min)</span>
              <span className="font-mono text-teal-700 dark:text-teal-400">Peak: 02:00</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="arrivals" name="Arrivals" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="waitAvg" name="Wait Time (min)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 2: ESI DONUT (Clickable to filter patient list) */}
        {activeChartTab === 'esi' && (
          <div className="w-full h-full min-h-[220px] flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-48 h-48 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Pie
                    data={esiCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    onClick={handleEsiSliceClick}
                    cursor="pointer"
                  >
                    {esiCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={esiFilter === entry.level ? '#0D9488' : '#ffffff'}
                        strokeWidth={esiFilter === entry.level ? 3 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-xl font-bold text-slate-800 dark:text-slate-100">
                  {patients.length}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Patients</span>
              </div>
            </div>

            {/* Click to filter legend */}
            <div className="space-y-1.5 text-xs w-full max-w-[220px]">
              <p className="text-[11px] font-semibold text-slate-500 pb-1">
                Click slice to filter patient queue:
              </p>
              {esiCounts.map(item => (
                <button
                  key={item.level}
                  onClick={() => handleEsiSliceClick(item)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                    esiFilter === item.level
                      ? 'bg-teal-50 dark:bg-teal-950/50 ring-1 ring-teal-500 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                    {item.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: INVENTORY BARS WITH LOW-STOCK THRESHOLD */}
        {activeChartTab === 'inventory' && (
          <div className="w-full h-full min-h-[220px] space-y-2 pt-1 overflow-y-auto max-h-[230px] pr-1">
            <div className="text-[11px] text-slate-500 flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span>Item & Minimum Threshold</span>
              <span>Reserves Status</span>
            </div>

            {inventoryChartData.map(item => {
              const maxScale = Math.max(item.stock, item.min * 2, 20);
              const stockPercent = Math.min(100, Math.round((item.stock / maxScale) * 100));
              const thresholdPercent = Math.min(100, Math.round((item.min / maxScale) * 100));

              return (
                <div key={item.name} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`font-bold ${item.isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.stock} {item.unit}
                      </span>
                      <span className="text-slate-400 text-[10px]">(min: {item.min})</span>
                    </div>
                  </div>

                  {/* Horizontal Bar with Threshold marker */}
                  <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isLow ? 'bg-rose-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${stockPercent}%` }}
                    />
                    {/* Minimum Threshold Red Notch */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${thresholdPercent}%` }}
                      title={`Threshold: ${item.min}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
