import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { InterventionItem } from '../types';

const STAGES = [
  'Detected',
  'Under Review',
  'Action Assigned',
  'Corrective Action',
  'Resolved'
];

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSite, setNewSite] = useState<string>('Site A - Duliajan');
  const [newAction, setNewAction] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState<string>('Field HSE Lead');

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const data = await api.getInterventions();
      setInterventions(data);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleAdvanceStage = async (item: InterventionItem) => {
    const currentIndex = STAGES.indexOf(item.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      try {
        await api.updateIntervention(item.id, { stage: nextStage });
        fetchInterventions();
      } catch (err) {
        console.error('Failed to advance stage:', err);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAction.trim()) return;
    try {
      await api.createIntervention({
        title: newTitle,
        site: newSite,
        priority: 'HIGH',
        corrective_action: newAction,
        assigned_to: newAssignee,
        due_date: '2025-10-30'
      });
      setShowModal(false);
      setNewTitle('');
      setNewAction('');
      fetchInterventions();
    } catch (err) {
      console.error('Failed to create intervention:', err);
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            HSE Corrective Actions & Intervention Lifecycle
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            5-Stage closed-loop remediation tracking from precursor identification to field barrier verification
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Action Plan</span>
        </button>
      </div>

      {/* 5 Stage Visual Workflow Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {STAGES.map((st, idx) => {
          const count = interventions.filter((i) => i.stage === st).length;
          return (
            <div key={st} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Stage {idx + 1}
              </span>
              <h4 className="font-bold text-xs text-slate-800">{st}</h4>
              <span className="font-mono font-bold text-lg text-blue-600 block">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Loading corrective interventions...</span>
          </div>
        ) : interventions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No active HSE interventions.
          </div>
        ) : (
          interventions.map((item) => {
            const stageIndex = STAGES.indexOf(item.stage);
            const isResolved = item.stage === 'Resolved';
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.intervention_id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.site}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {item.stage}
                    </span>
                  </div>
                </div>

                {/* Remediation Details */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                  {item.corrective_action}
                </p>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Assigned: <strong className="text-slate-700">{item.assigned_to}</strong>
                    </span>
                    {item.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target: <strong className="text-slate-700">{item.due_date}</strong>
                      </span>
                    )}
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => handleAdvanceStage(item)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                    >
                      <span>Advance to {STAGES[stageIndex + 1]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Create Corrective Action Plan</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump Station 3 LOTO Station Installation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Facility / Site</label>
                <select
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                >
                  <option value="Site A - Duliajan">Site A - Duliajan</option>
                  <option value="Site B - Moran">Site B - Moran</option>
                  <option value="Site C - Digboi">Site C - Digboi</option>
                  <option value="Site D - Jorhat">Site D - Jorhat</option>
                  <option value="Site E - Naharkatiya">Site E - Naharkatiya</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Assigned To</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Maintenance Lead"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mandated Corrective Action</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed engineering / administrative corrective steps..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Create Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
