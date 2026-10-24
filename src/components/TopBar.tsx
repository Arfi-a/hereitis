/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { UserRole, ScenarioType } from '../types';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Moon,
  Sun,
  Languages,
  UserCheck,
  Stethoscope,
  ClipboardList,
  PackageCheck,
  RotateCcw,
  Play,
  Pause,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Scissors
} from 'lucide-react';

interface TopBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenStandards: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ darkMode, setDarkMode, onOpenStandards }) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const {
    role,
    setRole,
    scenario,
    setScenario,
    resetSimulation,
    diversionStatus,
    isPaused,
    setIsPaused,
    scenarioTimelineSec,
    setScenarioTimelineSec,
    setIsBookOTOpen
  } = useSimulation();

  // UAE Live Clock (GST UTC+4)
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(language === 'ar' ? 'ar-AE' : 'en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  const roles: { id: UserRole; labelKey: string; icon: React.ElementType }[] = [
    { id: 'charge_nurse', labelKey: 'roleChargeNurse', icon: ClipboardList },
    { id: 'doctor', labelKey: 'roleDoctor', icon: Stethoscope },
    { id: 'supply_pharmacy', labelKey: 'rolePharmacy', icon: PackageCheck },
    { id: 'administrator', labelKey: 'roleAdmin', icon: UserCheck },
  ];

  const scenarios: { id: ScenarioType; labelKey: string }[] = [
    { id: 'normal', labelKey: 'scenarioNormal' },
    { id: 'collision', labelKey: 'scenarioCollision' },
    { id: 'heatstroke', labelKey: 'scenarioHeatstroke' },
    { id: 'duststorm', labelKey: 'scenarioDuststorm' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Zone: Brand + UAE Hospital Name + Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              سند
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight whitespace-nowrap">
                  SANAD
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">|</span>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                  {t('hospitalName')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Live Clock with GST indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{timeStr}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase">GST</span>
          </div>

          {/* Diversion Status Badge (WCAG compliant: Icon + explicit text) */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              diversionStatus === 'green'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : diversionStatus === 'amber'
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 animate-pulse'
            }`}
            role="status"
            aria-live="polite"
          >
            {diversionStatus === 'green' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : diversionStatus === 'amber' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-semibold">
              {diversionStatus === 'green'
                ? t('diversionNormal')
                : diversionStatus === 'amber'
                ? t('diversionAmber')
                : t('diversionRed')}
            </span>
          </div>
        </div>

        {/* Middle Zone: Scenario Switcher & Timeline Replay */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1.5 whitespace-nowrap">
            {t('scenarioSelector')}:
          </label>
          <div className="flex items-center gap-1">
            {scenarios.map(sc => {
              const active = scenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t(sc.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Pause / Play simulation */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Reset scenario */}
          <button
            onClick={resetSimulation}
            title={t('resetScenario')}
            className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label={t('resetScenario')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Zone: Book OT + Role Switcher + Standards + Language + Theme */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Book OT Button */}
          <button
            onClick={() => setIsBookOTOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            title="Book an Operating Theatre Suite"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Book OT</span>
          </button>

          {/* Role switcher segmented buttons */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            {roles.map(r => {
              const active = role === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    active
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t(r.labelKey)}</span>
                </button>
              );
            })}
          </div>

          {/* Standards & Compliance link modal */}
          <button
            onClick={onOpenStandards}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            title="Health Informatics & UAE Data Law Standards"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Standards</span>
          </button>

          {/* Language Toggle (EN / AR) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-2 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            aria-label="Switch Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-mono">{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Surge Mode Banner Notification (Subtle UI shift when in Surge or Collision) */}
      {diversionStatus !== 'green' && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between border-t transition-colors ${
            diversionStatus === 'red'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-amber-500 text-slate-950 border-amber-600'
          }`}
        >
          <div className="flex items-center gap-2 max-w-[1720px] mx-auto w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>{t('surgeModeActive')}:</strong>{' '}
              {diversionStatus === 'red'
                ? `${t('diversionAlertMsg')} (AMB-406 rerouted to Al Rahba Hospital)`
                : 'High patient density. Rapid bed turnaround and expedited triage protocols initiated.'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
