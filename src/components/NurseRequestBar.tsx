/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { SupplyRequest } from '../types';
import {
  Package,
  Pill,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
  Truck
} from 'lucide-react';

export const NurseRequestBar: React.FC = () => {
  const { t } = useLanguage();
  const {
    beds,
    patients,
    supplyRequests,
    createSupplyRequest,
    requestMedicationDelivery
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'supplies' | 'medicines' | 'trackers'>('supplies');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Form states for supplies
  const [selectedBed, setSelectedBed] = useState<string>('RESUS-01');
  const [selectedItem, setSelectedItem] = useState<string>('IV Start Set & 18G Cannula');
  const [quantity, setQuantity] = useState<number>(2);
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'stat'>('urgent');

  // Available supplies catalog
  const supplyCatalog = [
    'IV Start Set & 18G Cannula',
    'Arterial Line Kit & Transducer',
    'Oxygen Non-Rebreather Mask (NRB)',
    'Bag-Valve-Mask (BVM) Adult Airway Set',
    'Sterile Dressing & Suture Pack',
    'Suction Canister & Yankauer Tubing',
    '12-Lead ECG Electrodes Pack',
    'Venipuncture Blood Collection Tubes',
    'Emergency Pelvic Binder & Traction Splint',
    'Rapid Blood Infuser Tubing & Filter',
    'Cooling Ice Packs & Hypothermia Blanket',
    'Bronchodilator Nebuliser Mask & T-Piece'
  ];

  // Doctor ordered medicines for selected bed
  const currentPatient = patients.find(p => p.bedId === selectedBed);
  const doctorOrders = currentPatient?.medications || [];

  const handleSendSupply = (e: React.FormEvent) => {
    e.preventDefault();
    createSupplyRequest(selectedBed, selectedItem, quantity, urgency);
  };

  const getStepStatusIndex = (status: SupplyRequest['status']) => {
    switch (status) {
      case 'requested': return 0;
      case 'preparing': return 1;
      case 'on_the_way': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const formatEta = (sec: number) => {
    if (sec <= 0) return 'Delivered';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const activeRequestsCount = supplyRequests.filter(r => r.status !== 'delivered').length;

  return (
    <aside aria-label="Nurse Rapid Request Dock" className="fixed bottom-0 left-0 right-0 z-30 transition-all border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg">
      <div className="max-w-[1720px] mx-auto px-4">
        {/* Toggle Bar / Title Row */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t('requestBarTitle')}
              </span>
              <span className="text-[11px] text-slate-500">
                Point-of-care rapid logistics
              </span>
            </div>

            {/* Navigation tabs inside the bar */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => { setActiveTab('supplies'); setIsExpanded(true); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'supplies'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{t('tabSupplies')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('medicines'); setIsExpanded(true); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'medicines'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{t('tabMedicines')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('trackers'); setIsExpanded(true); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'trackers'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('tabMyRequests')}</span>
                {activeRequestsCount > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-teal-600 text-white font-bold">
                    {activeRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expand / Minimize toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label={isExpanded ? 'Collapse Request Bar' : 'Expand Request Bar'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Content Drawer */}
        {isExpanded && (
          <div className="py-3">
            {/* TAB 1: SUPPLIES REQUEST FORM */}
            {activeTab === 'supplies' && (
              <form onSubmit={handleSendSupply} className="flex flex-wrap items-center gap-3 text-xs">
                {/* Select Bed */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500">{t('selectBed')}:</label>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    className="h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {beds.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.label} ({b.zone.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Item */}
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label className="text-[11px] font-medium text-slate-500">{t('selectItem')}:</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {supplyCatalog.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1 w-20">
                  <label className="text-[11px] font-medium text-slate-500">{t('quantity')}:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-8 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Urgency buttons */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500">Urgency Level:</label>
                  <div className="flex items-center gap-1 h-8">
                    <button
                      type="button"
                      onClick={() => setUrgency('normal')}
                      className={`px-2.5 h-full rounded text-[11px] font-medium border transition-all ${
                        urgency === 'normal'
                          ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('urgencyNormal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('urgent')}
                      className={`px-2.5 h-full rounded text-[11px] font-medium border transition-all ${
                        urgency === 'urgent'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t('urgencyUrgent')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('stat')}
                      className={`px-2.5 h-full rounded text-[11px] font-bold border transition-all flex items-center gap-1 ${
                        urgency === 'stat'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-rose-600'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {t('urgencyStat')}
                    </button>
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="flex flex-col gap-1 pt-4">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('btnSendRequest')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MEDICINES PRE-ORDERED BY DOCTOR */}
            {activeTab === 'medicines' && (
              <div className="space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Target Bed:
                    </span>
                    <select
                      value={selectedBed}
                      onChange={(e) => setSelectedBed(e.target.value)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                    >
                      {beds.filter(b => b.status === 'occupied').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.label} ({b.currentPatientId || 'Occupied'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="italic text-teal-700 dark:text-teal-400">
                    ℹ️ {t('doctorOrdersNotice')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {doctorOrders.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-slate-500">
                      No active physician medication orders pending delivery for {selectedBed}.
                    </div>
                  ) : (
                    doctorOrders.map(med => {
                      const isDeliveredOrAdministered = med.status === 'administered' || med.status === 'delivered';
                      const isPending = med.status === 'ordered';

                      return (
                        <div
                          key={med.id}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]" title={med.drugName}>
                              {med.drugName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {med.dose} · {med.route} · By {med.orderedBy.split(' ')[0]}
                            </div>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400 capitalize font-medium mt-0.5">
                              Status: {med.status.replace(/_/g, ' ')}
                            </div>
                          </div>

                          {isPending ? (
                            <button
                              onClick={() => requestMedicationDelivery(selectedBed, med.id)}
                              className="px-2.5 py-1 text-[11px] font-medium bg-teal-700 hover:bg-teal-800 text-white rounded transition-colors whitespace-nowrap cursor-pointer"
                            >
                              {t('btnRequestDelivery')}
                            </button>
                          ) : isDeliveredOrAdministered ? (
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-amber-600 font-medium">
                              In transit
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: "MY REQUESTS" LIVE STEP PROGRESS TRACKER */}
            {activeTab === 'trackers' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {supplyRequests.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-slate-500">
                      No requests dispatched in this session.
                    </div>
                  ) : (
                    supplyRequests.slice(0, 8).map(req => {
                      const stepIdx = getStepStatusIndex(req.status);
                      const steps = ['Requested', 'Preparing', 'On the way', 'Delivered'];

                      return (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                              {req.item}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-semibold">
                              {req.bedId}
                            </span>
                          </div>

                          {/* 4-Step Progress Dots / Bar */}
                          <div className="relative flex items-center justify-between my-2 px-1">
                            <div className="absolute left-2 right-2 top-1.5 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
                            <div
                              className="absolute left-2 top-1.5 h-0.5 bg-teal-600 transition-all z-0"
                              style={{ width: `${(stepIdx / 3) * 100}%` }}
                            />

                            {steps.map((st, i) => {
                              const isCompleted = i <= stepIdx;
                              return (
                                <div key={st} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                      isCompleted
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                    }`}
                                  >
                                    {i + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                            <span className="capitalize font-semibold text-teal-700 dark:text-teal-400">
                              {req.status.replace(/_/g, ' ')}
                            </span>
                            <span>ETA: {formatEta(req.etaSeconds)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
