import { Platform } from 'react-native';

// Physical device connects over LAN Wi-Fi (192.168.1.9), web connects via localhost
const LAN_HOST = '192.168.1.9';
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:8000/api' : `http://${LAN_HOST}:8000/api`;

export const mobileApi = {
  async getDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    return await res.json();
  },

  async getReports(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/reports?${query}`);
    return await res.json();
  },

  async analyzeReport(payload: {
    description: string;
    site: string;
    report_type: string;
    department?: string;
  }) {
    const res = await fetch(`${BASE_URL}/reports/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async submitReport(payload: {
    description: string;
    site: string;
    report_type: string;
    department?: string;
    submitted_by?: string;
  }) {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getAlerts() {
    const res = await fetch(`${BASE_URL}/alerts`);
    return await res.json();
  },

  async acknowledgeAlert(id: number) {
    const res = await fetch(`${BASE_URL}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged: true })
    });
    return await res.json();
  }
};
