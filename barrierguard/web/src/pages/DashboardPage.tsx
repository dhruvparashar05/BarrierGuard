import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Network,
  MapPin,
  TrendingUp,
  Download,
  SearchCode,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Check,
  Building,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, DashboardTrends, AlertItem } from '../types';
import { MetricCard } from '../components/MetricCard';
import { RiskBadge } from '../components/RiskBadge';

interface DashboardPageProps {
  selectedSite: string;
  onNavigate: (tab: string, extra?: any) => void;
}

const RULE_COLORS = [
  '#2563EB', // Energy Isolation - Blue
  '#DC2626', // Confined Space - Red
  '#EA580C', // Working at Height - Orange
  '#0891B2', // Hot Work - Cyan
  '#7C3AED', // Line of Fire - Purple
  '#059669', // Safe Mechanical Lifting - Green
  '#D97706', // Bypassing Safety Controls - Amber
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedSite,
  onNavigate
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, trendRes] = await Promise.all([
        api.getDashboardSummary(selectedSite),
        api.getDashboardTrends(selectedSite)
      ]);
      setSummary(sumRes);
      setTrends(trendRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to reach backend API. Ensure FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSite]);

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await api.updateAlert(alertId, { acknowledged: true });
      fetchData();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  if (loading && !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading HSE intelligence streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-7 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="underline font-semibold text-xs ml-4 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Reports"
          value={summary?.total_reports ?? 751}
          subtitle="Processed across facilities"
          trend="+12.4% MoM"
          trendDirection="up"
          trendUpIsBad={false}
          icon={FileText}
          variant="slate"
        />

        <MetricCard
          title="SIF-Potential Reports"
          value={summary?.sif_potential_reports ?? 196}
          subtitle={`${summary?.sif_percentage ?? 26.1}% of all observations`}
          trend={summary?.sif_trend_direction || '-4.2% MoM'}
          trendDirection="down"
          trendUpIsBad={true}
          icon={AlertTriangle}
          variant="red"
          badgeText="FATAL RISK"
        />

        <MetricCard
          title="High-Risk Patterns"
          value={summary?.high_risk_patterns ?? 12}
          subtitle="Recurring systemic precursor clusters"
          trend="Actionable USP"
          trendDirection="neutral"
          icon={Network}
          variant="amber"
        />

        <MetricCard
          title="Priority Sites"
          value={summary?.priority_sites_count ?? 5}
          subtitle="Sites requiring immediate audit"
          trend="Duliajan & Moran"
          trendDirection="neutral"
          icon={MapPin}
          variant="blue"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. SIF-Potential Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  SIF-Potential vs Total Reports Trend
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly volume and dangerous precursor detection rates
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                  <span className="text-slate-600 font-medium">Total Reports</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500 inline-block" />
                  <span className="text-slate-600 font-medium">SIF Precursors</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trends?.monthly_trend || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="total_reports" name="Total Reports" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="sif_reports" name="SIF Precursors" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSif)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Detection Sensitivity: <strong className="text-slate-700 font-semibold">98.5%</strong></span>
            <button
              onClick={() => onNavigate('reports', { sif: true })}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              View Flagged Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* B. Life-Saving Rules Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SIF Precursors by IOGP Rule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of Life-Saving Rules breached
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trends?.rules_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(trends?.rules_distribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={RULE_COLORS[index % RULE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom rule pills */}
            <div className="space-y-1.5 mt-2">
              {(trends?.rules_distribution || []).slice(0, 4).map((rule, idx) => (
                <div key={rule.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: RULE_COLORS[idx % RULE_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate font-medium">{rule.name}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('life-saving-rules')}
            className="pt-3 mt-3 border-t border-slate-100 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-between w-full"
          >
            <span>Explore All 10 Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* C & D: High Risk Sites Table and High Risk Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Top High-Risk Sites Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-700" />
                High-Risk OIL Sites Ranking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by serious precursor density and recurrence volume
              </p>
            </div>
            <button
              onClick={() => onNavigate('sites')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Site Deep Dive <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="w-[10%] py-2.5 px-2">Rank</th>
                  <th className="w-[28%] py-2.5 px-2">Site / Facility</th>
                  <th className="w-[14%] py-2.5 px-2 text-right">Reports</th>
                  <th className="w-[14%] py-2.5 px-2 text-right">SIF</th>
                  <th className="w-[12%] py-2.5 px-2 text-right">Density</th>
                  <th className="w-[12%] py-2.5 px-2 text-center">Risk Tier</th>
                  <th className="w-[10%] py-2.5 px-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(trends?.top_high_risk_sites || []).map((site) => (
                  <tr key={site.site} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2 font-mono font-bold text-slate-500">#{site.rank}</td>
                    <td className="py-3 px-2 font-semibold text-slate-900 truncate">{site.site}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">{site.total_reports}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-red-600">{site.sif_reports}</td>
                    <td className="py-3 px-2 text-right font-mono font-medium text-slate-700">{site.sif_density}</td>
                    <td className="py-3 px-2 text-center">
                      <RiskBadge level={site.risk} />
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-slate-600 text-[11px] truncate">{site.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* D. Recent High-Risk Alerts Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Recent High-Risk Alerts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live systemic failure alarms
                </p>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {(trends?.recent_alerts || []).slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border border-red-100 bg-red-50/30 hover:bg-red-50/60 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-red-800 line-clamp-1">{alert.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{alert.description}</p>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{alert.site}</span>
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('alerts')}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition text-center"
            >
              Open Incident Command Feed
            </button>
          </div>
        </div>
      </div>

      {/* E. Quick Actions Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">HSE Strategic Safety Actions</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid proactive tools for safety supervisors and field incident investigation teams.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <SearchCode className="w-4 h-4" />
            Upload New Report
          </button>

          <button
            onClick={() => onNavigate('reports', { sif: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            View Flagged Reports
          </button>

          <button
            onClick={() => onNavigate('patterns')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Network className="w-4 h-4 text-amber-400" />
            Explore Patterns (USP)
          </button>

          <button
            onClick={() => alert('Exporting full OIL HSE intelligence dataset in CSV / JSON format...')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};
