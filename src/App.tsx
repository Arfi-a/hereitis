/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { TopBar } from './components/TopBar';
import { KPIRow } from './components/KPIRow';
import { FloorPlan } from './components/FloorPlan';
import { AmbulancePanel } from './components/AmbulancePanel';
import { PatientList } from './components/PatientList';
import { OperatingTheatrePanel } from './components/OperatingTheatrePanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { SanadSuggestions } from './components/SanadSuggestions';
import { NurseRequestBar } from './components/NurseRequestBar';
import { AlertBanner } from './components/AlertBanner';
import { PatientReportDrawer } from './components/PatientReportDrawer';
import { PharmacySupplyView } from './components/PharmacySupplyView';
import { AdminAuditView } from './components/AdminAuditView';
import { DrillDownModal } from './components/DrillDownModal';
import { StandardsModal } from './components/StandardsModal';
import { BookOTModal } from './components/BookOTModal';
import { Layers, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { role, diversionStatus, scenario } = useSimulation();

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState<boolean>(false);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFB] text-slate-800'}`}>
      {/* Top Bar with Hospital Brand, Clock, Scenarios, Roles, Diversion Badge */}
      <TopBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenStandards={() => setIsStandardsOpen(true)}
      />

      {/* Floating System Alerts & Persistent Diversion Warning */}
      <AlertBanner />

      {/* Main Content Viewport (Desktop-first high-density ergonomic dashboard) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-4 space-y-4 pb-28">
        
        {/* Row 1: KPI Metrics Row (Clickable cards with sparklines) */}
        <KPIRow />

        {/* Row 2: Sanad Proactive AI Suggestions (Human-in-the-loop agentic strip) */}
        <SanadSuggestions />

        {/* Dynamic Panels based on Role */}
        {role === 'administrator' ? (
          /* ADMINISTRATOR ROLE VIEW: Audit log + Governance + Floor plan */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 space-y-4">
              <AdminAuditView />
            </div>
            <div className="xl:col-span-4 space-y-4">
              <EquipmentPanel />
              <FloorPlan />
            </div>
          </div>
        ) : role === 'supply_pharmacy' ? (
          /* SUPPLY & PHARMACY ROLE VIEW: Kanban requests + Equipment Fleet */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 space-y-4">
              <PharmacySupplyView />
            </div>
            <div className="xl:col-span-5 space-y-4">
              <EquipmentPanel />
              <FloorPlan />
            </div>
          </div>
        ) : (
          /* CHARGE NURSE & DOCTOR DEFAULT ROLE VIEW: Clean, Simple ER Command Center */
          <div className="space-y-4">
            {/* Main Operational Split: Floor Plan (8 cols) vs Incoming Ambulances (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <FloorPlan />
              </div>
              <div className="lg:col-span-4">
                <AmbulancePanel />
              </div>
            </div>

            {/* Clinical & Resources Row: Patient Queue + Operating Theatres */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <PatientList />
              </div>
              <div className="lg:col-span-5">
                <OperatingTheatrePanel />
              </div>
            </div>

            {/* Equipment Fleet Status Row */}
            <div>
              <EquipmentPanel />
            </div>
          </div>
        )}
      </main>

      {/* Docked Nurse Request Bar (Always accessible point-of-care logistics) */}
      <NurseRequestBar />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 text-xs text-slate-500 mb-16">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Sanad ER Command Center v2.4
            </span>
            <span>·</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-teal-700 dark:text-teal-400">
              {t('simulatedDataTag')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsStandardsOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>HL7 FHIR R4 · LOINC · SNOMED CT</span>
            </button>
            <span>·</span>
            <span>UAE Fed. Health Data Law No. 2/2019 (In-country hosting)</span>
            <span>·</span>
            <span>WCAG 2.2 AA Color-Safe</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PatientReportDrawer />
      <DrillDownModal />
      <BookOTModal />
      <StandardsModal
        isOpen={isStandardsOpen}
        onClose={() => setIsStandardsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <SimulationProvider>
        <DashboardContent />
      </SimulationProvider>
    </LanguageProvider>
  );
}
