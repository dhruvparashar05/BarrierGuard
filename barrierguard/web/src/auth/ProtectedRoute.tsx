import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="relative">
          <img
            src="/barrierguard_logo.png"
            alt="BarrierGuard Logo"
            className="w-14 h-14 rounded-2xl object-contain shadow-lg shadow-orange-500/30 animate-pulse"
          />
          <div className="absolute -inset-1 rounded-2xl border border-orange-400/40 animate-ping opacity-25" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-slate-200">BarrierGuard Workspace</p>
          <p className="text-xs text-slate-400 mt-1">Authenticating secure HSE session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  return <>{children}</>;
};
