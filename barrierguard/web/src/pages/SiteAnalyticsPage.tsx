import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Building,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Wrench,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const SiteAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getSiteAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load site analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading OIL facility analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-7 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building className="w-6 h-6 text-blue-600" />
          OIL Site & Asset Risk Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Comparative risk density, SIF precursor exposure, and failure mode distribution across facilities
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] block">Total Monitored Sites</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{data.kpi.total_sites}</span>
        </div>
        <div className="bg-red-50/40 rounded-xl border border-red-200 p-4 shadow-xs">
          <span className="text-red-700 font-semibold uppercase text-[10px] block">High-Risk Assets</span>
          <span className="text-2xl font-bold font-mono text-red-900 mt-1 block">{data.kpi.high_risk_sites}</span>
        </div>
        <div className="bg-amber-50/40 rounded-xl border border-amber-200 p-4 shadow-xs">
          <span className="text-amber-700 font-semibold uppercase text-[10px] block">Medium-Risk Assets</span>
          <span className="text-2xl font-bold font-mono text-amber-900 mt-1 block">{data.kpi.medium_risk_sites}</span>
        </div>
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-200 p-4 shadow-xs">
          <span className="text-emerald-700 font-semibold uppercase text-[10px] block">Low-Risk Assets</span>
          <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">{data.kpi.low_risk_sites}</span>
        </div>
      </div>

      {/* Facilities Deep Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.sites.map((site: any) => (
          <div
            key={site.site}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{site.site}</h3>
                  <span className="text-xs text-slate-400 font-mono">Assam / Northeast Operational Sector</span>
                </div>
              </div>

              <RiskBadge level={site.risk_tier} score={site.average_risk_score} showScore />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center py-1 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="p-2">
                <span className="text-slate-400 text-[10px] font-semibold uppercase block">Total Reports</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{site.total_reports}</span>
              </div>
              <div className="p-2 border-x border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold uppercase block">SIF Precursors</span>
                <span className="font-mono font-bold text-red-600 text-sm mt-0.5 block">{site.sif_reports}</span>
              </div>
              <div className="p-2">
                <span className="text-slate-400 text-[10px] font-semibold uppercase block">SIF Density</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{site.sif_density_pct}%</span>
              </div>
            </div>

            {/* Density Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-500 text-[11px]">SIF Precursor Density Bar</span>
                <span className="text-slate-800">{site.sif_density_pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    site.risk_tier === 'HIGH' ? 'bg-red-600' : site.risk_tier === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, site.sif_density_pct * 2.5)}%` }}
                />
              </div>
            </div>

            {/* Breakdown entities */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" /> Primary Hazardous Activity:
                </span>
                <strong className="text-slate-800">{site.top_activity}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Top Life-Saving Rule:
                </span>
                <strong className="text-blue-700">{site.top_rule}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Top Barrier Failure:
                </span>
                <strong className="text-red-800">{site.top_barrier_failure}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
