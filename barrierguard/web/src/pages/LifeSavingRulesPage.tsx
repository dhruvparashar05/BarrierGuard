import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Box,
  Flame,
  Crosshair,
  Truck,
  AlertTriangle,
  Navigation,
  FileText,
  ArrowDownCircle,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const ICON_MAP: Record<string, any> = {
  Zap,
  Box,
  Flame,
  Crosshair,
  Truck,
  AlertTriangle,
  Navigation,
  FileText,
  ArrowDownCircle,
  ShieldAlert: AlertTriangle
};

export const LifeSavingRulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getLifeSavingRules();
        setRules(data);
      } catch (err) {
        console.error('Failed to load rules:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading IOGP compliance database...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-7 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            IOGP Life-Saving Rules Intelligence
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 font-mono">
            IOGP Report 459 Standard
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automated semantic mapping of unstructured near-miss narratives to international Oil & Gas producer standards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => {
          const IconComponent = ICON_MAP[rule.icon] || ShieldCheck;
          return (
            <div
              key={rule.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{rule.name}</h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          {rule.iogp_code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Critical Fatal Risk Barrier</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-slate-900 block">{rule.reports_count}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Reports</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {rule.description}
                </p>

                {/* Mandatory Barriers */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Mandatory Safe Safeguards:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {(rule.mandatory_barriers || []).map((barrier: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{barrier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-slate-700 text-[10px] uppercase block">
                    Mandated Supervisory Action:
                  </span>
                  <p className="text-slate-800 font-medium">{rule.recommended_action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
