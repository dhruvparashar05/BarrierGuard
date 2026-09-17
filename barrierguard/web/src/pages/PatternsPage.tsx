import React, { useEffect, useState } from 'react';
import {
  Network,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Building,
  Wrench,
  CheckCircle,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { PatternItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface PatternsPageProps {
  onSelectReport: (id: string | number) => void;
}

export const PatternsPage: React.FC<PatternsPageProps> = ({ onSelectReport }) => {
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [siteFilter, setSiteFilter] = useState<string>('All Sites');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const data = await api.getPatterns(riskFilter, siteFilter);
      setPatterns(data);
    } catch (err) {
      console.error('Failed to fetch patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [riskFilter, siteFilter]);

  const filteredPatterns = patterns.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.activity.toLowerCase().includes(q) ||
      p.barrier_failure.toLowerCase().includes(q) ||
      p.site.toLowerCase().includes(q) ||
      p.life_saving_rule.toLowerCase().includes(q)
    );
  });

  const highRiskCount = patterns.filter((p) => p.risk_level === 'HIGH').length;
  const totalOccurrences = patterns.reduce((sum, p) => sum + p.occurrences, 0);

  return (
    <div className="p-8 space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Network className="w-6 h-6 text-amber-500" />
              Systemic Precursor Pattern Detection
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              PRIMARY USP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detects recurring multi-dimensional failure combinations (Activity + Barrier Failure + Rule + Site) before a fatality occurs
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl text-xs">
            <span className="text-red-600 font-semibold block text-[10px] uppercase">Critical Patterns</span>
            <span className="font-mono font-bold text-red-900 text-base">{highRiskCount}</span>
          </div>
          <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Total Clustered Reports</span>
            <span className="font-mono font-bold text-slate-900 text-base">{totalOccurrences}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patterns by failure mode, activity, rule, or site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto text-xs">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="All">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk</option>
          </select>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="All Sites">All OIL Sites</option>
            <option value="Site A - Duliajan">Site A - Duliajan</option>
            <option value="Site B - Moran">Site B - Moran</option>
            <option value="Site C - Digboi">Site C - Digboi</option>
            <option value="Site D - Jorhat">Site D - Jorhat</option>
            <option value="Site E - Naharkatiya">Site E - Naharkatiya</option>
          </select>
        </div>
      </div>

      {/* Pattern Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Clustering recurring safety observations...</span>
          </div>
        ) : filteredPatterns.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No recurring precursor patterns match the filter criteria.
          </div>
        ) : (
          filteredPatterns.map((pat) => (
            <div
              key={pat.pattern_id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 transition space-y-4"
            >
              {/* Pattern Top Row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    pat.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{pat.name}</h3>
                      <RiskBadge level={pat.risk_level} />
                    </div>
                    <span className="text-xs font-mono text-slate-400">ID: {pat.pattern_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Occurrences</span>
                    <span className="font-mono font-bold text-slate-900 text-base">{pat.occurrences} reports</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">SIF Ratio</span>
                    <span className="font-mono font-bold text-red-600 text-base">{pat.sif_percentage}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Trend</span>
                    <span className={`font-semibold ${pat.trend === 'Increasing' ? 'text-red-600' : 'text-slate-600'}`}>
                      {pat.trend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Combination Flow Diagram */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                    Activity: {pat.activity}
                  </span>
                  <span className="text-slate-400">→</span>

                  <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200">
                    Barrier Failure: {pat.barrier_failure}
                  </span>
                  <span className="text-slate-400">→</span>

                  <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                    Rule: {pat.life_saving_rule}
                  </span>
                  <span className="text-slate-400">→</span>

                  <span className="px-3 py-1 rounded-lg bg-slate-200 text-slate-800">
                    Location: {pat.site}
                  </span>
                </div>
              </div>

              {/* Recommended HSE Intervention */}
              {pat.recommended_action && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block text-[11px] uppercase">
                      Recommended Systemic HSE Action:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{pat.recommended_action}</p>
                  </div>
                </div>
              )}

              {/* Sample Matching Reports */}
              {pat.sample_reports && pat.sample_reports.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-2">
                    Recent Incident Observations in this Cluster:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {pat.sample_reports.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => onSelectReport(s.id)}
                        className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-blue-600 block text-[11px]">{s.id}</span>
                          <span className="text-slate-700 truncate font-medium block">{s.title}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
