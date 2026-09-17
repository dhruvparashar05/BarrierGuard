import React from 'react';
import {
  Building2,
  Calendar,
  Bell,
  Search,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  selectedSite: string;
  onSelectSite: (site: string) => void;
  selectedRange: string;
  onSelectRange: (range: string) => void;
  onOpenAnalyze: () => void;
  onOpenSearch?: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedSite,
  onSelectSite,
  selectedRange,
  onSelectRange,
  onOpenAnalyze,
  unreadAlertsCount = 0
}) => {
  const sites = [
    'All Sites',
    'Site A - Duliajan',
    'Site B - Moran',
    'Site C - Digboi',
    'Site D - Jorhat',
    'Site E - Naharkatiya'
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Engine Title & Tagline */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              SIF Precursor Intelligence Engine
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              OIL HSE Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            "Turning Safety Reports into Proactive Fatal-Risk Prevention"
          </p>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Site Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSite}
              onChange={(e) => onSelectSite(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer text-slate-800"
            >
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedRange}
              onChange={(e) => onSelectRange(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer text-slate-800"
            >
              <option value="Past 30 Days">Past 30 Days</option>
              <option value="Past 90 Days">Past 90 Days</option>
              <option value="Past 180 Days">Past 180 Days (Demo)</option>
              <option value="YTD 2025">YTD 2025</option>
            </select>
          </div>

          {/* New Safety Report CTA */}
          <button
            onClick={onOpenAnalyze}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze New Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
