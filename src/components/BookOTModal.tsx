/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import {
  Scissors,
  X,
  Check,
  Clock,
  User,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const BookOTModal: React.FC = () => {
  const { t } = useLanguage();
  const {
    isBookOTOpen,
    setIsBookOTOpen,
    operatingTheatres,
    patients,
    preselectedOTId,
    bookOperatingTheatre
  } = useSimulation();

  const [selectedOT, setSelectedOT] = useState<string>('OT-3');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [procedureName, setProcedureName] = useState<string>('Emergency Laparotomy');
  const [urgency, setUrgency] = useState<'stat' | 'urgent' | 'scheduled'>('stat');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [surgeon, setSurgeon] = useState<string>('Dr. Hamad Al-Remeithi (Consultant Trauma)');
  const [anaesthetist, setAnaesthetist] = useState<string>('Dr. Paulson Mathew (On-Call)');

  useEffect(() => {
    if (preselectedOTId) {
      setSelectedOT(preselectedOTId);
    } else {
      // Pick first available OT
      const avail = operatingTheatres.find(o => o.status === 'available' || o.status === 'cleaning');
      if (avail) setSelectedOT(avail.id);
    }
  }, [preselectedOTId, operatingTheatres, isBookOTOpen]);

  if (!isBookOTOpen) return null;

  const quickProcedures = [
    'Emergency Laparotomy',
    'Acute Appendectomy',
    'Open Fracture Reduction',
    'Damage Control Surgery',
    'Vascular Repair',
    'Wound Debridement'
  ];

  const surgeonsList = [
    'Dr. Hamad Al-Remeithi (Consultant Trauma)',
    'Dr. Layla Mansoor (Vascular & General)',
    'Dr. Sultan Al-Nuaimi (Orthopaedic)',
    'Rapid Response Surgical Team B'
  ];

  const anaesthetistsList = [
    'Dr. Paulson Mathew (On-Call)',
    'Dr. Mona Salem (Emergency Anaesthesia)',
    'Dr. Tariq Zaid (Critical Care)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookOperatingTheatre({
      otId: selectedOT,
      patientId: selectedPatientId,
      procedureName,
      urgency,
      durationMinutes,
      surgeon,
      anaesthetist
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Book Operating Theatre
              </h3>
              <p className="text-xs text-slate-500">
                Direct emergency surgical suite reservation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBookOTOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Step 1: Select OT Suite */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              1. Select Operating Theatre Suite:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operatingTheatres.map(ot => {
                const isSelected = selectedOT === ot.id;
                const isAvailable = ot.status === 'available';

                return (
                  <button
                    key={ot.id}
                    type="button"
                    onClick={() => setSelectedOT(ot.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-2 ring-teal-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {ot.name.split('(')[0]}
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium capitalize ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ot.status === 'cleaning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {ot.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-500 block truncate">
                      {ot.specialty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Patient from Census */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              2. Assign Patient from ER:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="">Select an active ER patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.pseudonym} ({p.age}{p.gender}) · ESI-{p.esi} · Bed: {p.bedId || 'Waiting'} · {p.chiefComplaint.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Procedure Name & Quick Chips */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              3. Surgical Procedure:
            </label>
            <input
              type="text"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              placeholder="e.g. Emergency Laparotomy"
              required
              className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium mb-1.5"
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickProcedures.map(proc => (
                <button
                  key={proc}
                  type="button"
                  onClick={() => setProcedureName(proc)}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] transition-colors ${
                    procedureName === proc
                      ? 'bg-teal-600 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {proc}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Urgency & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Urgency Level:
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setUrgency('stat')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                    urgency === 'stat'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  STAT
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('urgent')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-semibold transition-all ${
                    urgency === 'urgent'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  Urgent (&lt;2h)
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Estimated Duration:
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
                <option value={180}>180 Minutes (3 Hours)</option>
              </select>
            </div>
          </div>

          {/* Step 5: Surgical Team */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lead Surgeon:
              </label>
              <select
                value={surgeon}
                onChange={(e) => setSurgeon(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px]"
              >
                {surgeonsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Anaesthetist:
              </label>
              <select
                value={anaesthetist}
                onChange={(e) => setAnaesthetist(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px]"
              >
                {anaesthetistsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Surgical Suite will immediately switch to reserved status.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBookOTOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Book Theatre</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
