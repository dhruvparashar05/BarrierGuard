import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { PatternsPage } from './pages/PatternsPage';
import { LifeSavingRulesPage } from './pages/LifeSavingRulesPage';
import { SiteAnalyticsPage } from './pages/SiteAnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

/**
 * Authenticated Application Shell containing the fixed Sidebar, Header,
 * and page router for protected HSE intelligence features.
 */
const AuthenticatedApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [selectedRange, setSelectedRange] = useState<string>('Past 180 Days');
  const [selectedReportId, setSelectedReportId] = useState<string | number | null>(null);
  const [initialSifFilter, setInitialSifFilter] = useState<boolean | undefined>(undefined);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(2);

  // Derive active tab from URL pathname
  const pathname = location.pathname.replace(/^\//, '') || 'dashboard';
  let activeTab = 'dashboard';
  if (pathname.startsWith('reports')) activeTab = 'reports';
  else if (pathname.startsWith('analyze')) activeTab = 'analyze';
  else if (pathname.startsWith('patterns')) activeTab = 'patterns';
  else if (pathname.startsWith('life-saving-rules')) activeTab = 'life-saving-rules';
  else if (pathname.startsWith('sites')) activeTab = 'sites';
  else if (pathname.startsWith('alerts')) activeTab = 'alerts';
  else if (pathname.startsWith('hse-actions') || pathname.startsWith('interventions')) activeTab = 'interventions';
  else if (pathname.startsWith('settings')) activeTab = 'settings';

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const alerts = await api.getAlerts();
        const unread = alerts.filter((a) => !a.acknowledged).length;
        setUnreadAlertsCount(unread);
      } catch {
        // Backend not yet reached or starting up
      }
    };
    checkAlerts();
  }, []);

  const handleSelectTab = (tab: string) => {
    setSelectedReportId(null);
    if (tab === 'reports') {
      setInitialSifFilter(undefined);
      navigate('/reports');
    } else if (tab === 'interventions') {
      navigate('/hse-actions');
    } else {
      navigate(`/${tab}`);
    }
    window.scrollTo(0, 0);
  };

  const handleNavigateFromDashboard = (tab: string, extra?: any) => {
    setSelectedReportId(null);
    if (tab === 'reports' && extra?.sif) {
      setInitialSifFilter(true);
      navigate('/reports');
    } else {
      navigate(`/${tab}`);
    }
    window.scrollTo(0, 0);
  };

  const handleSelectReport = (id: string | number) => {
    setSelectedReportId(id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans w-full max-w-full overflow-x-hidden">
      {/* Fixed Left Sidebar (w-64 = 256px) */}
      <Sidebar
        currentTab={selectedReportId ? 'reports' : activeTab}
        onSelectTab={handleSelectTab}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Content Area - perfectly offset by sidebar width */}
      <div className="ml-64 flex-1 flex flex-col min-w-0 w-[calc(100%-16rem)] max-w-[calc(100%-16rem)] min-h-screen">
        <Header
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
          onOpenAnalyze={() => handleSelectTab('analyze')}
          unreadAlertsCount={unreadAlertsCount}
        />

        <main className="flex-1 pb-16">
          {selectedReportId ? (
            <ReportDetailPage
              reportId={selectedReportId}
              onBack={() => setSelectedReportId(null)}
              onSelectSimilar={handleSelectReport}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  selectedSite={selectedSite}
                  onNavigate={handleNavigateFromDashboard}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsPage
                  initialSifFilter={initialSifFilter}
                  onSelectReport={handleSelectReport}
                />
              )}

              {activeTab === 'analyze' && <AnalyzePage />}

              {activeTab === 'patterns' && (
                <PatternsPage onSelectReport={handleSelectReport} />
              )}

              {activeTab === 'life-saving-rules' && <LifeSavingRulesPage />}

              {activeTab === 'sites' && <SiteAnalyticsPage />}

              {activeTab === 'alerts' && <AlertsPage />}

              {activeTab === 'interventions' && <InterventionsPage />}

              {activeTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patterns"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/life-saving-rules"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites-activities"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hse-actions"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interventions"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
