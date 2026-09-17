import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { ReportItem } from '../types';
import { SIFBadge } from '../components/SIFBadge';
import { RiskBadge } from '../components/RiskBadge';

interface ReportsPageProps {
  initialSifFilter?: boolean;
  onSelectReport: (id: string | number) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  initialSifFilter,
  onSelectReport
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sifFilter, setSifFilter] = useState<string>(
    initialSifFilter === true ? 'sif' : initialSifFilter === false ? 'non-sif' : 'all'
  );
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [siteFilter, setSiteFilter] = useState<string>('All Sites');
  const [ruleFilter, setRuleFilter] = useState<string>('All Rules');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');
  const [sortBy, setSortBy] = useState<string>('date');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        order
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (sifFilter === 'sif') params.sif = true;
      if (sifFilter === 'non-sif') params.sif = false;
      if (riskFilter !== 'All') params.risk_level = riskFilter;
      if (siteFilter !== 'All Sites') params.site = siteFilter;
      if (ruleFilter !== 'All Rules') params.rule = ruleFilter;
      if (typeFilter !== 'All Types') params.report_type = typeFilter;

      const res = await api.getReports(params);
      setReports(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, pageSize, sifFilter, riskFilter, siteFilter, ruleFilter, typeFilter, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSifFilter('all');
    setRiskFilter('All');
    setSiteFilter('All Sites');
    setRuleFilter('All Rules');
    setTypeFilter('All Types');
    setPage(1);
  };

  return (
    <div className="p-5 lg:p-6 space-y-5 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Safety & Precursor Incident Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of Unsafe Acts, Conditions, Near-Misses, and SIF Precursors across OIL assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReports()}
            title="Refresh"
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => alert('Downloading reports export...')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 w-full min-w-0">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3 w-full min-w-0">
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by keywords, report ID, activity, barrier failure, or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="flex items-center flex-wrap gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* SIF Status Filter */}
          <select
            value={sifFilter}
            onChange={(e) => { setSifFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All SIF Status</option>
            <option value="sif">SIF-Potential Only</option>
            <option value="non-sif">Non-SIF Only</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => { setSiteFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="All Sites">All OIL Sites</option>
            <option value="Site A - Duliajan">Site A - Duliajan</option>
            <option value="Site B - Moran">Site B - Moran</option>
            <option value="Site C - Digboi">Site C - Digboi</option>
            <option value="Site D - Jorhat">Site D - Jorhat</option>
            <option value="Site E - Naharkatiya">Site E - Naharkatiya</option>
          </select>

          {/* Report Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="All Types">All Report Types</option>
            <option value="Near-Miss">Near-Miss</option>
            <option value="Unsafe Condition">Unsafe Condition</option>
            <option value="Unsafe Act">Unsafe Act</option>
            <option value="Incident">Incident</option>
          </select>

          {/* Sort Control */}
          <div className="ml-auto flex items-center gap-1 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord as any);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="risk_score-desc">Highest Risk Score</option>
              <option value="risk_score-asc">Lowest Risk Score</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-slate-500 hover:text-slate-800 underline font-semibold text-xs ml-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reports Data Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full min-w-0">
        {/* Inner Scroll Wrapper: vertical scroll only, zero horizontal overflow */}
        <div className="w-full overflow-y-auto overflow-x-hidden max-h-[calc(100vh-310px)] min-h-[380px]">
          <table className="w-full table-fixed text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold sticky top-0 z-10 shadow-xs">
              <tr>
                <th style={{ width: '8.5%' }} className="py-3 px-2 align-middle">Report ID</th>
                <th style={{ width: '7%' }} className="hidden xl:table-cell py-3 px-1.5 align-middle">Date</th>
                <th style={{ width: '8%' }} className="py-3 px-1 text-center align-middle">Type</th>
                <th style={{ width: '11%' }} className="py-3 px-2 align-middle">Site / Facility</th>
                <th style={{ width: '21%' }} className="py-3 px-2.5 align-middle">Title & Precursor Summary</th>
                <th style={{ width: '10.5%' }} className="py-3 px-1 text-center align-middle">SIF Potential</th>
                <th style={{ width: '9%' }} className="py-3 px-1 text-center align-middle">Risk Score</th>
                <th style={{ width: '9.5%' }} className="hidden xl:table-cell py-3 px-2 align-middle">IOGP Rule</th>
                <th style={{ width: '7.5%' }} className="py-3 px-1 text-center align-middle">Status</th>
                <th style={{ width: '8%' }} className="py-3 px-1 text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    onClick={() => onSelectReport(rep.id)}
                    className="hover:bg-blue-50/40 transition cursor-pointer group"
                  >
                    <td className="py-2.5 px-2 align-middle">
                      <span
                        className="font-mono font-bold text-blue-600 truncate block text-[11px]"
                        title={rep.report_id}
                      >
                        {rep.report_id}
                      </span>
                    </td>

                    <td className="hidden xl:table-cell py-2.5 px-1.5 text-slate-500 font-mono text-[11px] whitespace-nowrap align-middle">
                      {rep.date.split('T')[0]}
                    </td>

                    <td className="py-2.5 px-1 text-center align-middle">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-full"
                        title={rep.report_type}
                      >
                        {rep.report_type}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 font-semibold text-slate-900 align-middle">
                      <span className="truncate block text-xs" title={rep.site}>
                        {rep.site}
                      </span>
                    </td>

                    <td className="py-2.5 px-2.5 align-middle">
                      <p
                        className="font-semibold text-slate-800 truncate text-xs group-hover:text-blue-600 transition"
                        title={rep.title}
                      >
                        {rep.title}
                      </p>
                      {rep.barrier_failure && (
                        <p
                          className="text-[11px] text-red-600 font-medium truncate"
                          title={`Failure: ${rep.barrier_failure}`}
                        >
                          Failure: {rep.barrier_failure}
                        </p>
                      )}
                    </td>

                    <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                      <SIFBadge isSif={rep.sif_potential} size="sm" />
                    </td>

                    <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                      <RiskBadge level={rep.risk_level} score={rep.risk_score} showScore size="sm" />
                    </td>

                    <td className="hidden xl:table-cell py-2.5 px-2 text-slate-700 font-medium text-[11px] align-middle">
                      <span className="truncate block" title={rep.life_saving_rule || 'Work Authorization'}>
                        {rep.life_saving_rule || 'Work Authorization'}
                      </span>
                    </td>

                    <td className="py-2.5 px-1 text-center align-middle">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-full ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rep.status === 'Action Assigned'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        title={rep.status}
                      >
                        {rep.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(rep.id);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition shrink-0"
                        title="View Report Details"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong className="font-semibold text-slate-800">{reports.length}</strong> of{' '}
            <strong className="font-semibold text-slate-800">{total}</strong> total observations
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium font-mono text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
