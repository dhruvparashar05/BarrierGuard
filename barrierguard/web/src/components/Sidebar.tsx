import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  SearchCode,
  Network,
  ShieldCheck,
  MapPin,
  Bell,
  ClipboardCheck,
  Settings,
  ShieldAlert,
  ChevronRight,
  LogOut,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount = 0
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'BG';
    const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'BG';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analyze', label: 'Analyze Report', icon: SearchCode, highlight: true },
    { id: 'patterns', label: 'Patterns', icon: Network, badge: 'USP' },
    { id: 'life-saving-rules', label: 'Life-Saving Rules', icon: ShieldCheck },
    { id: 'sites', label: 'Sites & Activities', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell, count: unreadAlertsCount },
    { id: 'interventions', label: 'HSE Actions', icon: ClipboardCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 h-screen w-64 z-30 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none overflow-y-auto overflow-x-hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="/barrierguard_logo.png"
                alt="BarrierGuard Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20"
              />
              <div>
                <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                  BarrierGuard
                </h1>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {user?.organization || 'Oil India Limited'}
                </p>
              </div>
            </div>

            <div className="mt-3 px-2 py-1 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">SIF Precursor Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>v1.2</span>
            </div>
          </div>

          {/* Core Navigation Items */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              HSE Intelligence Core
            </p>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : item.highlight
                      ? 'text-blue-300 hover:bg-slate-800/80 hover:text-white border border-blue-500/20 bg-blue-950/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                        {item.count}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                {getInitials(user?.full_name)}
              </div>
              <div className="truncate text-left min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || 'A. K. Sharma'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.role || 'HSE Analyst'} • {user?.organization || 'Oil India Limited'}
                </p>
              </div>
            </div>
            <button
              title="Sign Out of BarrierGuard"
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shrink-0 ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Log out of BarrierGuard?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to end your current HSE session?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? (
                  <span>Logging out...</span>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
