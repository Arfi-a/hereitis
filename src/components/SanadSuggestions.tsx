/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { Sparkles, Check, X, ShieldAlert, Package, BedDouble } from 'lucide-react';

export const SanadSuggestions: React.FC = () => {
  const { t } = useLanguage();
  const { suggestions, approveSuggestion, dismissSuggestion } = useSimulation();

  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Sanad Proactive AI Suggestions" className="w-full">
      <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-teal-200/60 dark:border-teal-800/40">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-teal-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-teal-950 dark:text-teal-200">
                {t('suggestionsTitle')}
              </span>
              <span className="mx-2 text-slate-400">·</span>
              <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                {t('humanInLoopBadge')}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {suggestions.length} Active Recommendations
          </span>
        </div>

        {/* Suggestion cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {suggestions.map(sug => (
            <div
              key={sug.id}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {sug.category === 'kit_prep' ? (
                      <Package className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    {sug.title}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400">
                    {sug.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mb-2">
                  {sug.reason}
                </p>
              </div>

              {/* Action Buttons: Approve vs Dismiss */}
              <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => dismissSuggestion(sug.id)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>{t('btnDismiss')}</span>
                </button>

                <button
                  onClick={() => approveSuggestion(sug.id)}
                  className="px-3 py-1 text-[11px] font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-md transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>{t('btnApprove')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
