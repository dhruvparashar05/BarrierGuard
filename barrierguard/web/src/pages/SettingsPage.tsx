import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Cpu,
  User,
  Database,
  ShieldCheck,
  CheckCircle2,
  Key,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [highThreshold, setHighThreshold] = useState<number>(0.70);
  const [mediumThreshold, setMediumThreshold] = useState<number>(0.40);
  const [selectedProvider, setSelectedProvider] = useState<string>('MOCK');
  const [activeRole, setActiveRole] = useState<string>('HSE Analyst');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-7 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-700" />
          System & Model Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Adjust risk scoring parameters, LLM multi-provider abstractions, and evaluation environment settings
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Configuration settings updated successfully.</span>
        </div>
      )}

      {/* 1. Risk Scoring Thresholds */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">BarrierGuard Prototype Risk Score Thresholds</h3>
        </div>
        <p className="text-xs text-slate-500">
          Configure probability cut-offs for SIF precursor categorization. (Label: "BarrierGuard Prototype Risk Score")
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">HIGH Risk Cut-off</span>
              <span className="font-mono text-red-600 font-bold">{highThreshold.toFixed(2)} - 1.00</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.05"
              value={highThreshold}
              onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">Reports scoring above this value are marked SIF-Potential HIGH.</p>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">MEDIUM Risk Cut-off</span>
              <span className="font-mono text-amber-600 font-bold">{mediumThreshold.toFixed(2)} - {(highThreshold - 0.01).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.50"
              step="0.05"
              value={mediumThreshold}
              onChange={(e) => setMediumThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">Reports below this value are considered LOW routine observations.</p>
          </div>
        </div>
      </div>

      {/* 2. LLM Provider Abstraction */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">LLM Abstraction Architecture</h3>
        </div>
        <p className="text-xs text-slate-500">
          Switch between offline deterministic NLP or live cloud providers for structured entity extraction and explanation generation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => setSelectedProvider('MOCK')}
            className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
              selectedProvider === 'MOCK'
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="font-bold">Offline Deterministic</strong>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-600">Built-in OIL domain heuristics. Zero external API keys needed.</p>
          </div>

          <div
            onClick={() => setSelectedProvider('OPENAI')}
            className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
              selectedProvider === 'OPENAI'
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="font-bold">OpenAI / Local vLLM</strong>
              <span className="text-[10px] font-mono text-slate-400">API</span>
            </div>
            <p className="text-[11px] text-slate-600">OpenAI compatible /chat/completions endpoint (GPT-4o / Mistral / Llama).</p>
          </div>

          <div
            onClick={() => setSelectedProvider('GEMINI')}
            className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
              selectedProvider === 'GEMINI'
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="font-bold">Google Gemini</strong>
              <span className="text-[10px] font-mono text-slate-400">API</span>
            </div>
            <p className="text-[11px] text-slate-600">Google Generative Language SDK (gemini-1.5-flash).</p>
          </div>
        </div>
      </div>

      {/* 3. Demo Role Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Demo User Role Switcher</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { role: 'HSE Analyst', email: 'demo@barrierguard.local', desc: 'Can submit reports, review predictions, trigger XAI analysis.' },
            { role: 'HSE Manager', email: 'manager@barrierguard.local', desc: 'Can review systemic patterns, assign interventions, audit sites.' },
            { role: 'Administrator', email: 'admin@barrierguard.local', desc: 'Full database access and system configuration rights.' }
          ].map((u) => (
            <div
              key={u.role}
              onClick={() => setActiveRole(u.role)}
              className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                activeRole === u.role
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <strong className="font-bold block">{u.role}</strong>
              <span className="font-mono text-[10px] text-slate-500 block">{u.email}</span>
              <p className="text-[11px] text-slate-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};
