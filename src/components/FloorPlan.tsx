/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { Bed, BedStatus } from '../types';
import {
  Bed as BedIcon,
  CheckCircle2,
  User,
  Sparkles,
  Clock,
  WifiOff,
  Radio,
  MapPin,
  Maximize2,
  Info
} from 'lucide-react';

export const FloorPlan: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { beds, patients, setSelectedPatientId, setSelectedBedId } = useSimulation();

  const [hoveredBedId, setHoveredBedId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<BedStatus | 'all'>('all');

  // Zone geofence metrics
  const getZoneStats = (zoneKey: string) => {
    const zonePatients = patients.filter(p => {
      if (zoneKey === 'resus') return p.zone === 'resus';
      if (zoneKey === 'acute') return p.zone === 'acute';
      if (zoneKey === 'subacute') return p.zone === 'subacute';
      if (zoneKey === 'fasttrack') return p.zone === 'fasttrack';
      if (zoneKey === 'waiting') return p.zone === 'waiting' || p.disposition === 'triage';
      if (zoneKey === 'imaging') return p.zone === 'imaging';
      return false;
    });

    const count = zonePatients.length;
    const avgWait = count > 0 ? Math.round(zonePatients.reduce((a, b) => a + b.waitTimeMinutes, 0) / count) : 0;
    return { count, avgWait };
  };

  const getBedPatient = (bedId: string) => {
    return patients.find(p => p.bedId === bedId);
  };

  const handleBedClick = (bed: Bed) => {
    setSelectedBedId(bed.id);
    const pt = getBedPatient(bed.id);
    if (pt) {
      setSelectedPatientId(pt.id);
    }
  };

  // State styling helper (WCAG compliant colors + icons)
  const getStatusMeta = (status: BedStatus) => {
    switch (status) {
      case 'occupied':
        return {
          label: t('bedOccupied'),
          bg: 'fill-sky-100 dark:fill-sky-950/70',
          stroke: 'stroke-sky-400 dark:stroke-sky-600',
          textClass: 'text-sky-800 dark:text-sky-300',
          badgeBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300',
          icon: User,
        };
      case 'free':
        return {
          label: t('bedFree'),
          bg: 'fill-emerald-100 dark:fill-emerald-950/70',
          stroke: 'stroke-emerald-400 dark:stroke-emerald-600',
          textClass: 'text-emerald-800 dark:text-emerald-300',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'cleaning':
        return {
          label: t('bedCleaning'),
          bg: 'fill-amber-100 dark:fill-amber-950/70',
          stroke: 'stroke-amber-400 dark:stroke-amber-600',
          textClass: 'text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300',
          icon: Sparkles,
        };
      case 'reserved':
        return {
          label: t('bedReserved'),
          bg: 'fill-indigo-100 dark:fill-indigo-950/70',
          stroke: 'stroke-indigo-400 dark:stroke-indigo-600',
          textClass: 'text-indigo-800 dark:text-indigo-300',
          badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-300',
          icon: Clock,
        };
      case 'unknown':
      default:
        return {
          label: t('bedUnknown'),
          bg: 'fill-slate-200 dark:fill-slate-800',
          stroke: 'stroke-slate-400 dark:stroke-slate-600',
          textClass: 'text-slate-700 dark:text-slate-400',
          badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300',
          icon: WifiOff,
        };
    }
  };

  // Coordinates for beds in the floor plan SVG (viewBox: 0 0 960 560)
  const bedCoordinates: Record<string, { x: number; y: number; w: number; h: number }> = {
    // Resus Unit (Top Left)
    'RESUS-01': { x: 40, y: 70, w: 90, h: 52 },
    'RESUS-02': { x: 145, y: 70, w: 90, h: 52 },
    'RESUS-03': { x: 40, y: 135, w: 90, h: 52 },
    'RESUS-04': { x: 145, y: 135, w: 90, h: 52 },

    // Acute Treatment Bays (Center Grid)
    'BAY-01': { x: 290, y: 70, w: 72, h: 48 },
    'BAY-02': { x: 375, y: 70, w: 72, h: 48 },
    'BAY-03': { x: 460, y: 70, w: 72, h: 48 },
    'BAY-04': { x: 545, y: 70, w: 72, h: 48 },

    'BAY-05': { x: 290, y: 140, w: 72, h: 48 },
    'BAY-06': { x: 375, y: 140, w: 72, h: 48 },
    'BAY-07': { x: 460, y: 140, w: 72, h: 48 },
    'BAY-08': { x: 545, y: 140, w: 72, h: 48 },

    // Sub-Acute Bays (Mid-Bottom Center)
    'BAY-09': { x: 290, y: 240, w: 72, h: 48 },
    'BAY-10': { x: 375, y: 240, w: 72, h: 48 },
    'BAY-11': { x: 460, y: 240, w: 72, h: 48 },
    'BAY-12': { x: 290, y: 305, w: 72, h: 48 },
    'BAY-13': { x: 375, y: 305, w: 72, h: 48 },
    'BAY-14': { x: 460, y: 305, w: 72, h: 48 },

    // Fast Track Clinic (Bottom Right)
    'FT-01': { x: 740, y: 250, w: 80, h: 46 },
    'FT-02': { x: 835, y: 250, w: 80, h: 46 },
    'FT-03': { x: 740, y: 310, w: 80, h: 46 },
    'FT-04': { x: 835, y: 310, w: 80, h: 46 },
  };

  const activeHoveredBed = beds.find(b => b.id === hoveredBedId);
  const activeHoveredPatient = activeHoveredBed ? getBedPatient(activeHoveredBed.id) : null;

  // Counts by status
  const statusCounts = {
    occupied: beds.filter(b => b.status === 'occupied').length,
    free: beds.filter(b => b.status === 'free').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
    reserved: beds.filter(b => b.status === 'reserved').length,
    unknown: beds.filter(b => b.status === 'unknown').length,
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-4 flex flex-col h-full">
      {/* Floor Plan Header + Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('floorPlanTitle')}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{beds.length} Total Beds</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{statusCounts.free} Free</span>
              <span>·</span>
              <span>{statusCounts.occupied} Occupied</span>
            </div>
          </div>
        </div>

        {/* Legend / Status Filter Controls (functional buttons) */}
        <div className="flex items-center flex-wrap gap-1 text-xs">
          <button
            onClick={() => setFilterState('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              filterState === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({beds.length})
          </button>
          
          {(['occupied', 'free', 'cleaning', 'reserved', 'unknown'] as BedStatus[]).map(st => {
            const meta = getStatusMeta(st);
            const Icon = meta.icon;
            const count = statusCounts[st];
            const active = filterState === st;

            return (
              <button
                key={st}
                onClick={() => setFilterState(active ? 'all' : st)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border transition-all ${
                  active
                    ? `${meta.badgeBg} ring-1 ring-teal-500`
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Filter by ${meta.label}`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">{meta.label}</span>
                <span className="font-mono tabular-nums text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative flex-1 w-full min-h-[360px] bg-[#F3F5F7] dark:bg-slate-950/60 rounded-lg p-2 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 960 480"
          className="w-full h-full max-h-[480px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Hospital Boundary Walls */}
          <rect
            x="10"
            y="10"
            width="940"
            height="460"
            rx="12"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-800"
            strokeWidth="2"
          />

          {/* 1. Zone: Ambulance Arrival Airlock (Top left corner) */}
          <rect
            x="20"
            y="20"
            width="230"
            height="36"
            rx="6"
            className="fill-rose-50/60 dark:fill-rose-950/20 stroke-rose-300 dark:stroke-rose-800/60"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="30" y="42" className="text-[11px] font-semibold fill-rose-800 dark:fill-rose-300 tracking-wide">
            {t('ambulanceBay')}
          </text>

          {/* 2. Zone: Resuscitation Unit (Top Left) */}
          <rect
            x="20"
            y="60"
            width="230"
            height="140"
            rx="8"
            className="fill-slate-50 dark:fill-slate-900/60 stroke-slate-300 dark:stroke-slate-800"
            strokeWidth="1.5"
          />
          <text x="32" y="80" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
            {t('resusZone')}
          </text>
          {/* Geofence count tag */}
          <g transform="translate(180, 68)">
            <rect width="60" height="18" rx="4" className="fill-slate-200 dark:fill-slate-800" />
            <text x="30" y="13" textAnchor="middle" className="text-[9px] font-mono fill-slate-700 dark:fill-slate-300">
              {getZoneStats('resus').count} pts · {getZoneStats('resus').avgWait}m
            </text>
          </g>

          {/* 3. Zone: Acute Treatment Bays (Center Top) */}
          <rect
            x="270"
            y="20"
            width="370"
            height="180"
            rx="8"
            className="fill-slate-50 dark:fill-slate-900/60 stroke-slate-300 dark:stroke-slate-800"
            strokeWidth="1.5"
          />
          <text x="285" y="42" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
            {t('acuteBays')} (Beds 1-8)
          </text>
          <g transform="translate(560, 30)">
            <rect width="66" height="18" rx="4" className="fill-slate-200 dark:fill-slate-800" />
            <text x="33" y="13" textAnchor="middle" className="text-[9px] font-mono fill-slate-700 dark:fill-slate-300">
              {getZoneStats('acute').count} pts · {getZoneStats('acute').avgWait}m
            </text>
          </g>

          {/* 4. Zone: Emergency Radiology & CT (Top Right) */}
          <rect
            x="660"
            y="20"
            width="280"
            height="180"
            rx="8"
            className="fill-indigo-50/40 dark:fill-indigo-950/20 stroke-indigo-200 dark:stroke-indigo-800"
            strokeWidth="1.5"
          />
          <text x="675" y="42" className="text-[11px] font-bold fill-indigo-900 dark:fill-indigo-300">
            {t('imagingZone')}
          </text>
          {/* CT scanner circle */}
          <circle cx="740" cy="115" r="32" className="fill-indigo-100/70 dark:fill-indigo-900/40 stroke-indigo-400 dark:stroke-indigo-600" strokeWidth="2" />
          <circle cx="740" cy="115" r="16" className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-600" strokeWidth="1.5" />
          <text x="740" y="119" textAnchor="middle" className="text-[10px] font-mono fill-indigo-700 dark:fill-indigo-300">CT 1</text>
          {/* X-Ray room */}
          <rect x="810" y="70" width="110" height="90" rx="6" className="fill-white dark:fill-slate-900 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="1" />
          <text x="865" y="105" textAnchor="middle" className="text-[10px] font-medium fill-slate-600 dark:fill-slate-400">Digital X-Ray</text>
          <text x="865" y="125" textAnchor="middle" className="text-[9px] font-mono fill-emerald-600 dark:fill-emerald-400">Available</text>

          {/* 5. Zone: Sub-Acute Bays (Center Bottom) */}
          <rect
            x="270"
            y="215"
            width="280"
            height="150"
            rx="8"
            className="fill-slate-50 dark:fill-slate-900/60 stroke-slate-300 dark:stroke-slate-800"
            strokeWidth="1.5"
          />
          <text x="285" y="235" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
            {t('subacuteBays')} (Beds 9-14)
          </text>

          {/* 6. Zone: Fast Track Clinic (Bottom Right) */}
          <rect
            x="720"
            y="215"
            width="220"
            height="150"
            rx="8"
            className="fill-slate-50 dark:fill-slate-900/60 stroke-slate-300 dark:stroke-slate-800"
            strokeWidth="1.5"
          />
          <text x="735" y="235" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
            {t('fastTrackZone')}
          </text>
          <g transform="translate(860, 222)">
            <rect width="65" height="18" rx="4" className="fill-slate-200 dark:fill-slate-800" />
            <text x="32" y="13" textAnchor="middle" className="text-[9px] font-mono fill-slate-700 dark:fill-slate-300">
              {getZoneStats('fasttrack').count} pts · {getZoneStats('fasttrack').avgWait}m
            </text>
          </g>

          {/* 7. Zone: Triage Assessment & Public Waiting Hall (Bottom Left) */}
          <rect
            x="20"
            y="215"
            width="230"
            height="240"
            rx="8"
            className="fill-teal-50/40 dark:fill-teal-950/20 stroke-teal-200 dark:stroke-teal-800"
            strokeWidth="1.5"
          />
          <text x="35" y="238" className="text-[11px] font-bold fill-teal-900 dark:fill-teal-200">
            {t('waitingZone')} & {t('triageZone')}
          </text>
          
          {/* Waiting geofenced people count visual */}
          <g transform="translate(35, 255)">
            <rect width="200" height="50" rx="6" className="fill-white dark:fill-slate-900 stroke-teal-200 dark:stroke-teal-800/60" strokeWidth="1" />
            <text x="12" y="24" className="text-[11px] font-medium fill-slate-700 dark:fill-slate-300">
              Waiting Room Census:
            </text>
            <text x="12" y="42" className="text-[12px] font-bold font-mono fill-teal-700 dark:fill-teal-400">
              {getZoneStats('waiting').count} Patients Waiting
            </text>
            <text x="135" y="42" className="text-[10px] font-mono fill-slate-500">
              Avg {getZoneStats('waiting').avgWait} min
            </text>
          </g>

          {/* Geofence people dots in waiting room */}
          {Array.from({ length: Math.min(12, getZoneStats('waiting').count + 4) }).map((_, idx) => {
            const dotX = 45 + (idx % 6) * 30;
            const dotY = 330 + Math.floor(idx / 6) * 35;
            return (
              <g key={`dot-${idx}`}>
                <circle cx={dotX} cy={dotY} r="7" className="fill-teal-600/70 dark:fill-teal-400/80 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
                <circle cx={dotX} cy={dotY - 3} r="3" className="fill-white dark:fill-slate-900" />
              </g>
            );
          })}
          {/* Central Corridor label */}
          <text x="480" y="202" textAnchor="middle" className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500 tracking-wider uppercase">
            Central Staff Corridor
          </text>

          {/* Nurse Station desk */}
          <rect x="560" y="235" width="140" height="120" rx="6" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" strokeWidth="1" />
          <text x="630" y="275" textAnchor="middle" className="text-[10px] font-semibold fill-slate-700 dark:fill-slate-300">NURSE STATION</text>
          <text x="630" y="295" textAnchor="middle" className="text-[9px] font-mono fill-teal-600">Pneumatic Tube A1</text>
          <text x="630" y="315" textAnchor="middle" className="text-[9px] font-mono fill-slate-500">Telemetry Hub</text>

          {/* Clean Supply Alcove (Bottom Center) */}
          <rect x="270" y="380" width="430" height="75" rx="8" className="fill-slate-50 dark:fill-slate-900/60 stroke-slate-300 dark:stroke-slate-800" strokeWidth="1" />
          <text x="285" y="405" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300">Clean Utility & Supply Alcove</text>
          <text x="285" y="425" className="text-[10px] fill-slate-500">Emergency Meds Pyxis · Rapid Fluid Warmers · Airway Cart</text>

          {/* RENDER ALL BEDS AS INTERACTIVE CARDS */}
          {beds.map(bed => {
            const coords = bedCoordinates[bed.id];
            if (!coords) return null;

            const isFiltered = filterState !== 'all' && bed.status !== filterState;
            const meta = getStatusMeta(bed.status);
            const pt = getBedPatient(bed.id);
            const isHovered = hoveredBedId === bed.id;

            return (
              <g
                key={bed.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                className={`cursor-pointer transition-all ${isFiltered ? 'opacity-25' : 'opacity-100'}`}
                onMouseEnter={() => setHoveredBedId(bed.id)}
                onMouseLeave={() => setHoveredBedId(null)}
                onClick={() => handleBedClick(bed)}
                role="button"
                tabIndex={0}
                aria-label={`${bed.label}: ${meta.label} ${pt ? `Patient: ${pt.pseudonym}` : ''}`}
              >
                {/* Bed Outer Card */}
                <rect
                  width={coords.w}
                  height={coords.h}
                  rx="6"
                  className={`${meta.bg} ${meta.stroke} transition-all ${
                    isHovered ? 'stroke-[2.5px] filter drop-shadow-md' : 'stroke-[1.5px]'
                  }`}
                />

                {/* Bed Pillow / Head Outline */}
                <rect
                  x="4"
                  y="4"
                  width="14"
                  height={coords.h - 8}
                  rx="3"
                  className="fill-white/80 dark:fill-slate-900/80 stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="0.8"
                />

                {/* Bed ID Label */}
                <text
                  x="22"
                  y={coords.h / 2 - 3}
                  className="text-[10px] font-bold font-mono fill-slate-900 dark:fill-slate-100"
                >
                  {bed.label}
                </text>

                {/* Status subtext inside bed */}
                <text
                  x="22"
                  y={coords.h / 2 + 10}
                  className={`text-[8.5px] font-semibold ${meta.textClass}`}
                >
                  {bed.status === 'occupied' && pt
                    ? `ESI-${pt.esi} · ${pt.pseudonym}`
                    : bed.status === 'cleaning'
                    ? `Cleaning (~${bed.cleaningProgressMinutes || 2}m)`
                    : bed.status === 'unknown'
                    ? 'Sensor Silent'
                    : meta.label}
                </text>

                {/* State Mini Indicator */}
                <circle
                  cx={coords.w - 10}
                  cy="12"
                  r="4"
                  className={
                    bed.status === 'occupied'
                      ? 'fill-sky-500'
                      : bed.status === 'free'
                      ? 'fill-emerald-500'
                      : bed.status === 'cleaning'
                      ? 'fill-amber-500'
                      : bed.status === 'reserved'
                      ? 'fill-indigo-500'
                      : 'fill-slate-400'
                  }
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Bed Tooltip (Overlay Card) */}
        {activeHoveredBed && (
          <div
            className="absolute top-4 right-4 z-20 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg pointer-events-none transition-all"
            role="tooltip"
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <BedIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {activeHoveredBed.label} ({activeHoveredBed.zone.toUpperCase()})
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusMeta(activeHoveredBed.status).badgeBg}`}>
                {getStatusMeta(activeHoveredBed.status).label}
              </span>
            </div>

            {activeHoveredBed.status === 'occupied' && activeHoveredPatient ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeHoveredPatient.pseudonym} ({activeHoveredPatient.age}{activeHoveredPatient.gender})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Acuity:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    ESI Level {activeHoveredPatient.esi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complaint:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={activeHoveredPatient.chiefComplaint}>
                    {activeHoveredPatient.chiefComplaint}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vitals:</span>
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    HR {activeHoveredPatient.vitals.hr} · BP {activeHoveredPatient.vitals.sbp}/{activeHoveredPatient.vitals.dbp} · SpO2 {activeHoveredPatient.vitals.spo2}%
                  </span>
                </div>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                  Click bed to view full clinical report
                </p>
              </div>
            ) : activeHoveredBed.status === 'unknown' ? (
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Telemetry Silent / Disconnected</span>
                </div>
                <p className="text-[11px]">
                  Bed sensor offline since {activeHoveredBed.lastSensorPing}. Showing Unknown state (Never assumed empty).
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p className="text-[11px]">
                  {activeHoveredBed.specialty || 'Standard Acute Monitoring Cubicle'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Last verified: {activeHoveredBed.lastSensorPing}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
