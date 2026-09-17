import React, { useState } from 'react';
import {
  SearchCode,
  UploadCloud,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Zap,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyzeResult } from '../types';
import { SIFBadge } from '../components/SIFBadge';
import { RiskBadge } from '../components/RiskBadge';

const SAMPLE_SCENARIOS = [
  {
    name: 'Pump Isolation Bypass (SIF-High)',
    site: 'Site A - Duliajan',
    report_type: 'Near-Miss',
    text: 'During scheduled pump maintenance at Site A Crude Pump Station 3, technician started disassembling the 440V motor terminal box before confirming complete electrical LOTO isolation. Multimeter check later revealed live 440V feed to the breaker.'
  },
  {
    name: 'Confined Space Without Gas Test (SIF-High)',
    site: 'Site B - Moran',
    report_type: 'Near-Miss',
    text: 'During vessel cleaning of test separator V-101 at Moran Early Production Facility, contractor stepped inside the vessel manway prior to mandatory 4-gas atmospheric testing. Standby hole-watcher was absent from the hatch.'
  },
  {
    name: 'Derrick Mast Height Fall Risk (SIF-High)',
    site: 'Site D - Jorhat',
    report_type: 'Unsafe Act',
    text: 'During tripping pipe operation at Rig-04, the derrickman on the monkey board unclipped both harness lanyards simultaneously while moving across racking fingers at 24 meters height without an intermediate life-line.'
  },
  {
    name: 'Routine Office Sweeping (Non-SIF Low)',
    site: 'Site C - Digboi',
    report_type: 'Unsafe Condition',
    text: 'Observed plastic cleaning bucket and grease rags left on the main access corridor walkway near the workshop entrance. Housekeeping was completed shortly after notification. No high-energy source.'
  }
];

export const AnalyzePage: React.FC = () => {
  const [description, setDescription] = useState<string>(SAMPLE_SCENARIOS[0].text);
  const [site, setSite] = useState<string>(SAMPLE_SCENARIOS[0].site);
  const [reportType, setReportType] = useState<string>(SAMPLE_SCENARIOS[0].report_type);
  const [department, setDepartment] = useState<string>('Production Operations');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const handleRunAnalysis = async () => {
    if (!description.trim()) return;
    try {
      setAnalyzing(true);
      setSaveSuccess(null);
      const data = await api.analyzeReport({
        description,
        site,
        report_type: reportType,
        department
      });
      setResult(data);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!description.trim()) return;
    try {
      setSaving(true);
      const saved = await api.createReport({
        description,
        site,
        report_type: reportType,
        department,
        submitted_by: 'HSE Analyst (Live Input)'
      });
      setSaveSuccess(`Successfully logged to OIL repository with Report ID: ${saved.report_id}`);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadScenario = (sc: typeof SAMPLE_SCENARIOS[0]) => {
    setDescription(sc.text);
    setSite(sc.site);
    setReportType(sc.report_type);
    setResult(null);
    setSaveSuccess(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) setDescription(content.slice(0, 1500));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SearchCode className="w-6 h-6 text-blue-600" />
          Interactive SIF Precursor Analysis Sandbox
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ingest raw safety narratives, classify SIF potential, map IOGP rules, and extract precursor entities in real-time
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
          Load Pre-built Operational Safety Scenarios:
        </span>
        <div className="flex items-center flex-wrap gap-2">
          {SAMPLE_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadScenario(sc)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition"
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box & Parameters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Site / Installation</label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
            >
              <option value="Site A - Duliajan">Site A - Duliajan</option>
              <option value="Site B - Moran">Site B - Moran</option>
              <option value="Site C - Digboi">Site C - Digboi</option>
              <option value="Site D - Jorhat">Site D - Jorhat</option>
              <option value="Site E - Naharkatiya">Site E - Naharkatiya</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
            >
              <option value="Near-Miss">Near-Miss</option>
              <option value="Unsafe Condition">Unsafe Condition</option>
              <option value="Unsafe Act">Unsafe Act</option>
              <option value="Incident">Incident</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
            >
              <option value="Production Operations">Production Operations</option>
              <option value="Drilling & Workover">Drilling & Workover</option>
              <option value="Mechanical Maintenance">Mechanical Maintenance</option>
              <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
              <option value="Pipeline Gathering">Pipeline Gathering</option>
            </select>
          </div>
        </div>

        {/* Narrative Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700 text-xs">
              Incident Narrative / Free-Text Observation
            </label>
            <label className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import TXT / CSV</span>
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type or paste safety report narrative here (e.g., During pump maintenance, technician started work before confirming complete electrical isolation...)"
            className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => { setDescription(''); setResult(null); setSaveSuccess(null); }}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>

          <div className="flex items-center gap-3">
            <button
              disabled={analyzing || !description.trim()}
              onClick={handleRunAnalysis}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing NLP Precursors...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Analyze Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* DYNAMIC RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Result Banner */}
          <div className={`p-6 rounded-xl border shadow-sm ${
            result.sif_potential
              ? 'bg-red-50/50 border-red-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${result.sif_potential ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {result.sif_potential ? <AlertTriangle className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {result.sif_potential ? 'SIF POTENTIAL DETECTED' : 'NON-SIF ROUTINE OBSERVATION'}
                    </h3>
                    <SIFBadge isSif={result.sif_potential} size="lg" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {result.sif_potential
                      ? 'Fatal hazard exposure confirmed. Immediate operational barriers were degraded or bypassed.'
                      : 'Non-fatal low severity observation. Standard routine follow-up recommended.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Model Confidence</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Risk Score</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {result.risk_score.toFixed(2)}
                    </span>
                    <RiskBadge level={result.risk_level} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Extracted Precursors & Causal Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Precursors Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                Extracted Structured Precursor Entities
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block">Activity</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{result.precursors.activity}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block">Life-Saving Rule</span>
                  <span className="font-bold text-blue-600 mt-0.5 block">{result.life_saving_rule}</span>
                </div>

                <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 col-span-2">
                  <span className="text-red-700 text-[10px] font-semibold uppercase block">Barrier Failure</span>
                  <span className="font-bold text-red-900 text-sm mt-0.5 block">{result.precursors.barrier_failure}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block">Hazard</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{result.precursors.hazard}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block">Equipment</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{result.precursors.equipment}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block">Potential Consequence</span>
                  <span className="font-semibold text-red-800 mt-0.5 block">{result.precursors.potential_consequence}</span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-blue-950 uppercase text-[10px] block">Mandated HSE Supervisory Action:</span>
                <p className="text-blue-900 font-medium">{result.recommended_action}</p>
              </div>
            </div>

            {/* Explainable AI Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Why was this flagged? (Explainable AI)
                </h4>

                <ul className="space-y-2.5 mt-3">
                  {result.explanation.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 bg-amber-50/40 p-3 rounded-lg border border-amber-200/60 font-medium">
                      <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Record in OIL Central Database:</span>
                <button
                  disabled={saving}
                  onClick={handleSaveToDatabase}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save & Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
