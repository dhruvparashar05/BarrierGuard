import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Check,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [siteFilter, setSiteFilter] = useState<string>('All Sites');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(siteFilter, severityFilter);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [siteFilter, severityFilter]);

  const handleUpdate = async (id: number, payload: { acknowledged?: boolean; resolved?: boolean }) => {
    try {
      await api.updateAlert(id, payload);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-red-600" />
            Active SIF Hazard & Systemic Failure Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications triggered by recurring failure frequency spikes and critical Life-Saving Rule violations
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 text-xs">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="All">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
          </select>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="All Sites">All Sites</option>
            <option value="Site A - Duliajan">Site A - Duliajan</option>
            <option value="Site B - Moran">Site B - Moran</option>
            <option value="Site C - Digboi">Site C - Digboi</option>
            <option value="Site D - Jorhat">Site D - Jorhat</option>
            <option value="Site E - Naharkatiya">Site E - Naharkatiya</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Checking live alert feeds...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No alerts match the selected criteria.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition ${
                !alert.acknowledged
                  ? 'border-red-300 ring-1 ring-red-200/50 bg-red-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {alert.site}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {alert.time}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {alert.description}
              </p>

              {alert.recommended_action && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase text-[10px] block">
                    Recommended Urgent Countermeasure:
                  </span>
                  <p className="text-slate-800 font-medium">{alert.recommended_action}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">ID: {alert.alert_id}</span>

                <div className="flex items-center gap-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleUpdate(alert.id, { acknowledged: true })}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Acknowledge Alert
                    </button>
                  )}
                  {!alert.resolved ? (
                    <button
                      onClick={() => handleUpdate(alert.id, { acknowledged: true, resolved: true })}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
