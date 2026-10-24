/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { SystemAlert } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  X,
  Bell,
  ArrowRight
} from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { t } = useLanguage();
  const { alerts, dismissAlert, diversionStatus, ambulances } = useSimulation();
  const [activeToasts, setActiveToasts] = useState<SystemAlert[]>([]);
  const [showAlertDrawer, setShowAlertDrawer] = useState<boolean>(false);

  // Manage transient 3-second auto-fade for non-persistent alerts
  useEffect(() => {
    // Only recent alerts created within last 4 seconds that are not dismissed
    const recent = alerts.filter(a => !a.dismissed).slice(0, 3);
    setActiveToasts(recent);

    // Auto dismiss transient ones after 4 seconds
    const transientTimers = recent.map(alert => {
      if (!alert.persistent) {
        return setTimeout(() => {
          setActiveToasts(prev => prev.filter(a => a.id !== alert.id));
        }, 4000);
      }
      return null;
    });

    return () => {
      transientTimers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [alerts]);

  const getTierMeta = (tier: SystemAlert['tier']) => {
    switch (tier) {
      case 'critical':
        return {
          icon: ShieldAlert,
          bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bg: 'bg-sky-50 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100',
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
    }
  };

  const redirectedAmbulances = ambulances.filter(a => a.rerouted);

  return (
    <>
      {/* Toast Alert Notice Bar (Floats calmly on top right) */}
      <div className="fixed top-16 right-4 z-40 max-w-md w-full space-y-2 pointer-events-none">
        {activeToasts.map(alert => {
          const meta = getTierMeta(alert.tier);
          const Icon = meta.icon;

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border shadow-lg backdrop-blur-md pointer-events-auto transition-all transform animate-in fade-in slide-in-from-top-2 ${meta.bg}`}
              role="alert"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.iconColor}`} />
                  <div>
                    <h5 className="font-bold text-xs">{alert.title}</h5>
                    <p className="text-xs opacity-90 mt-0.5 leading-snug">{alert.message}</p>
                    <span className="font-mono text-[10px] opacity-60 mt-1 block">
                      {alert.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    dismissAlert(alert.id);
                    setActiveToasts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Red Diversion Reroute notification */}
              {alert.persistent && diversionStatus === 'red' && redirectedAmbulances.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/60 text-xs">
                  <div className="font-semibold text-[11px] mb-1">
                    {t('diversionAlertMsg')}:
                  </div>
                  <div className="space-y-1">
                    {redirectedAmbulances.map(a => (
                      <div key={a.id} className="flex items-center justify-between font-mono text-[11px] bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded">
                        <span>{a.callSign} ({a.agency})</span>
                        <span>→ {a.rerouteDestination}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
