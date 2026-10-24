/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import {
  Scissors,
  BedDouble,
  CheckCircle2,
  Users,
  Activity,
  Plus,
  ChevronRight,
  Flame,
  Pill
} from 'lucide-react';

export const KPIRow: React.FC = () => {
  const { t } = useLanguage();
  const {
    beds,
    operatingTheatres,
    patients,
    setSelectedKpiKey,
    setIsBookOTOpen,
    setRole
  } = useSimulation();

  // 1. Bed metrics
  const erBedsTotal = beds.length; // 22
  const erBedsFree = beds.filter(b => b.status === 'free').length;
  const erBedsOccupied = beds.filter(b => b.status === 'occupied').length;
  const hospitalBedsTotal = 240;
  const hospitalBedsFree = 44 + erBedsFree;

  // 2. OT metrics
  const otsInUse = operatingTheatres.filter(ot => ot.status === 'in_use').length;
  const otsAvailable = operatingTheatres.filter(ot => ot.status === 'available' || ot.status === 'cleaning').length;

  // 3. Patients
  const patientsCount = patients.length;
  const criticalPatients = patients.filter(p => p.esi <= 2).length;

  return (
    <section aria-label="Key Hospital Operations & Quick Actions" className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        
        {/* CARD 1: BOOK THE OT (Prominent, Friendly Action Card) */}
        <button
          onClick={() => setIsBookOTOpen(true)}
          className="text-left p-3.5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-800 text-white shadow-md hover:from-teal-800 hover:to-teal-900 transition-all cursor-pointer group flex flex-col justify-between border border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          title="Click to Book an Operating Theatre Suite immediately"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-teal-200" />
              Book the OT
            </span>
            <span className="p-1 rounded-lg bg-teal-600/80 text-white group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </span>
          </div>

          <div className="my-1">
            <span className="text-xl font-bold font-mono tracking-tight block">
              + Reserve Suite
            </span>
            <span className="text-[11px] text-teal-100/90 font-medium block">
              {otsAvailable} OTs Ready for Booking
            </span>
          </div>

          <div className="pt-1.5 border-t border-teal-600/60 flex items-center justify-between text-[11px] text-teal-100 font-semibold">
            <span>Instant Reservation</span>
            <span className="flex items-center text-white">
              Open Form <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* CARD 2: TOTAL BEDS IN HOSPITAL */}
        <button
          onClick={() => setSelectedKpiKey('beds')}
          className="text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
          title="Total Hospital Capacity"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Hospital Beds
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {hospitalBedsTotal}
              </span>
              <span className="text-xs font-medium text-slate-500">Total Beds</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              218 Inpatient Wards · {erBedsTotal} in ER
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Overall Capacity</span>
            <span className="group-hover:text-teal-600 transition-colors flex items-center">
              Drill-down <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* CARD 3: FREE BEDS */}
        <button
          onClick={() => setSelectedKpiKey('beds')}
          className="text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
          title="Free & Available Beds"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Free Beds
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums">
                {hospitalBedsFree}
              </span>
              <span className="text-xs font-medium text-emerald-600">Available</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
              <strong className="text-emerald-600">{erBedsFree} Free in ER</strong> · 44 in Wards
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ready for Intake</span>
            <span className="group-hover:text-teal-600 transition-colors flex items-center">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* CARD 4: OCCUPIED OTs & ER BEDS */}
        <button
          onClick={() => setSelectedKpiKey('ots')}
          className="text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
          title="Occupied Theatres & ER Bays"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Occupied OTs & ER
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {otsInUse} <span className="text-xs font-normal text-slate-500">OTs</span> · {erBedsOccupied} <span className="text-xs font-normal text-slate-500">ER</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
              {operatingTheatres.length - otsInUse} OTs Available · 1 Cleaning
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>In Active Care</span>
            <span className="group-hover:text-teal-600 transition-colors flex items-center">
              Details <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* CARD 5: PATIENT LIST & PHARMACY */}
        <button
          onClick={() => setSelectedKpiKey('patients')}
          className="text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
          title="Active Patient Census & Pharmacy Orders"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Patient List & Pharmacy
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {patientsCount}
              </span>
              <span className="text-xs font-medium text-slate-500">Patients in ER</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              <strong className="text-rose-600 font-mono">{criticalPatients} Critical (ESI 1-2)</strong> · Meds Tracked
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Triage Census</span>
            <span className="group-hover:text-teal-600 transition-colors flex items-center">
              View List <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

      </div>
    </section>
  );
};
