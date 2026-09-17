import axios from 'axios';
import {
  DashboardSummary,
  DashboardTrends,
  ReportDetail,
  AnalyzeResult,
  PatternItem,
  AlertItem,
  InterventionItem,
  AuthUser,
  AuthResponse
} from '../types';

const rawBase = (import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('barrierguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('barrierguard_token', res.data.access_token);
      localStorage.setItem('barrierguard_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async signup(payload: {
    full_name: string;
    email: string;
    organization?: string;
    role?: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/signup', payload);
    if (res.data.access_token) {
      localStorage.setItem('barrierguard_token', res.data.access_token);
      localStorage.setItem('barrierguard_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<AuthUser>('/auth/me');
    if (res.data) {
      localStorage.setItem('barrierguard_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if network fails, client clears storage
    } finally {
      localStorage.removeItem('barrierguard_token');
      localStorage.removeItem('barrierguard_user');
    }
  },

  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem('barrierguard_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Dashboard
  async getDashboardSummary(site?: string): Promise<DashboardSummary> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get('/dashboard/summary', { params });
    return res.data;
  },

  async getDashboardTrends(site?: string): Promise<DashboardTrends> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get('/dashboard/trends', { params });
    return res.data;
  },

  // Reports
  async getReports(params: Record<string, any>) {
    const res = await apiClient.get('/reports', { params });
    return res.data;
  },

  async getReportDetail(id: string | number): Promise<ReportDetail> {
    const res = await apiClient.get(`/reports/${id}`);
    return res.data;
  },

  async createReport(payload: {
    description: string;
    site: string;
    report_type: string;
    department?: string;
    submitted_by?: string;
    title?: string;
  }): Promise<ReportDetail> {
    const res = await apiClient.post('/reports', payload);
    return res.data;
  },

  async submitReportFeedback(id: string | number, feedback: {
    human_sif_label: boolean;
    reviewer_name: string;
    human_comments?: string;
  }) {
    const res = await apiClient.patch(`/reports/${id}/feedback`, feedback);
    return res.data;
  },

  // Live NLP Analysis
  async analyzeReport(payload: {
    description: string;
    report_type?: string;
    site?: string;
    department?: string;
  }): Promise<AnalyzeResult> {
    const res = await apiClient.post('/reports/analyze', payload);
    return res.data;
  },

  // Patterns
  async getPatterns(riskLevel?: string, site?: string): Promise<PatternItem[]> {
    const params: Record<string, string> = {};
    if (riskLevel && riskLevel !== 'All') params.risk_level = riskLevel;
    if (site && site !== 'All Sites') params.site = site;
    const res = await apiClient.get('/patterns', { params });
    return res.data;
  },

  async getPatternDetail(id: string): Promise<PatternItem> {
    const res = await apiClient.get(`/patterns/${id}`);
    return res.data;
  },

  // Site Analytics
  async getSiteAnalytics() {
    const res = await apiClient.get('/analytics/sites');
    return res.data;
  },

  // Rules
  async getLifeSavingRules() {
    const res = await apiClient.get('/life-saving-rules');
    return res.data;
  },

  // Alerts
  async getAlerts(site?: string, severity?: string): Promise<AlertItem[]> {
    const params: Record<string, string> = {};
    if (site && site !== 'All Sites') params.site = site;
    if (severity && severity !== 'All') params.severity = severity;
    const res = await apiClient.get('/alerts', { params });
    return res.data;
  },

  async updateAlert(id: string | number, payload: { acknowledged?: boolean; resolved?: boolean }): Promise<AlertItem> {
    const res = await apiClient.patch(`/alerts/${id}`, payload);
    return res.data;
  },

  // Interventions
  async getInterventions(stage?: string, site?: string): Promise<InterventionItem[]> {
    const params: Record<string, string> = {};
    if (stage && stage !== 'All') params.stage = stage;
    if (site && site !== 'All Sites') params.site = site;
    const res = await apiClient.get('/interventions', { params });
    return res.data;
  },

  async createIntervention(payload: {
    title: string;
    site: string;
    priority: string;
    corrective_action: string;
    assigned_to: string;
    due_date?: string;
    report_id?: string;
    pattern_id?: string;
  }): Promise<InterventionItem> {
    const res = await apiClient.post('/interventions', payload);
    return res.data;
  },

  async updateIntervention(id: string | number, payload: {
    stage?: string;
    assigned_to?: string;
    corrective_action?: string;
  }): Promise<InterventionItem> {
    const res = await apiClient.patch(`/interventions/${id}`, payload);
    return res.data;
  }
};
