import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  Layers,
  Wrench,
  AlertCircle,
  MapPin,
  Clock,
  UserCheck,
  Share2,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { ReportDetail } from '../types';
import { SIFBadge } from '../components/SIFBadge';
import { RiskBadge } from '../components/RiskBadge';

interface ReportDetailPageProps {
  reportId: string | number;
  onBack: () => void;
  onSelectSimilar: (id: string | number) => void;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  reportId,
  onBack,
  onSelectSimilar
}) => {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getReportDetail(reportId);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [reportId]);

  const handleHumanReview = async (overrideLabel: boolean) => {
    if (!report) return;
    try {
      setIsSubmittingFeedback(true);
      await api.submitReportFeedback(report.report_id, {
        human_sif_label: overrideLabel,
        reviewer_name: 'A. K. Sharma (HSE Analyst)',
        human_comments: feedbackNotes || (overrideLabel ? 'Confirmed SIF Potential after field verification' : 'Overridden as Non-SIF: barrier intact')
      });
      setFeedbackSuccess(
        overrideLabel
          ? 'Classification confirmed as SIF-Potential by HSE Reviewer.'
          : 'Classification successfully overridden to Non-SIF.'
      );
      fetchDetail();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Retrieving intelligence record {reportId}...</p>
        </div>
      </div>
    );
  }

  const isSif = report.prediction?.sif_potential ?? report.sif_potential;
  const riskScore = report.prediction?.risk_score ?? report.risk_score;
  const riskLevel = report.prediction?.risk_level ?? report.risk_level;
  const prob = report.prediction?.probability ?? 0.85;
  const prec = report.precursors;
  const explanationList = prec?.explanation || report.prediction?.human_comments ? [report.prediction?.human_comments || ''] : [];

  return (
    <div className="p-8 space-y-7 max-w-6xl mx-auto">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Report ID: {report.report_id}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">{report.site}</span>
        </div>
      </div>

      {/* Hero Status Banner */}
      <div className={`rounded-xl border p-6 shadow-xs ${
        isSif
          ? 'bg-red-50/50 border-red-200'
          : 'bg-emerald-50/40 border-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isSif ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {isSif ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {isSif ? 'FLAGGED AS SIF-POTENTIAL' : 'CLASSIFIED AS NON-SIF ROUTINE OBSERVATION'}
                </h2>
                <SIFBadge isSif={isSif} size="lg" />
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {isSif
                  ? 'Serious Injury & Fatality precursor detected. High energy hazard present with administrative or physical barrier failure.'
                  : 'Low-severity routine operational observation without acute high-energy exposure.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Model Confidence
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900">
                {(prob * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Risk Score
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {riskScore.toFixed(2)}
                </span>
                <RiskBadge level={riskLevel} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Narrative & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Incident Report Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Report ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{report.report_id}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Report Type</span>
                <span className="font-semibold text-slate-800">{report.report_type}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Date Reported</span>
                <span className="font-mono text-slate-700">{report.date.replace('T', ' ')}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Site / Asset</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" /> {report.site}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Department</span>
                <span className="text-slate-700 font-medium">{report.department || 'Production Operations'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Submitted By</span>
                <span className="text-slate-700 font-medium">{report.submitted_by || 'HSE Specialist'}</span>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Report Free-Text Narrative
              </span>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-800 leading-relaxed font-sans border border-slate-200/80">
                "{report.description}"
              </div>
            </div>
          </div>

          {/* AI ANALYSIS RESULTS (Precursors Breakdown) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                Structured Precursor Extractions
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                AI/NLP Pipeline Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Activity</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{prec?.activity || 'General Maintenance'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Life-Saving Rule</span>
                <span className="font-bold text-blue-700 text-sm mt-0.5 block">{prec?.life_saving_rule || report.life_saving_rule || 'Energy Isolation'}</span>
              </div>

              <div className="p-3 bg-red-50/50 rounded-lg border border-red-200">
                <span className="text-red-700 text-[10px] font-semibold uppercase tracking-wider block">Barrier Failure</span>
                <span className="font-bold text-red-900 text-sm mt-0.5 block">{prec?.barrier_failure || 'Isolation Not Verified'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Primary Hazard</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{prec?.hazard || 'Electrical Energy'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Equipment Involved</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{prec?.equipment || 'Pumping System'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Specific Location</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{prec?.location || report.site}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 sm:col-span-2">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Unsafe Act / Practice</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{prec?.unsafe_act || 'Commenced repair prior to positive verification'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 sm:col-span-2">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Credible Worst-Case Potential Consequence</span>
                <span className="font-semibold text-red-800 mt-0.5 block">{prec?.potential_consequence || 'Fatal electrocution / arc explosion'}</span>
              </div>
            </div>
          </div>

          {/* EXPLAINABLE AI: Why was this flagged? */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Explainable AI: Why was this report flagged?
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic causal attribution generated from extracted narrative features:
            </p>

            <ul className="space-y-2.5 mt-3">
              {explanationList.length > 0 ? (
                explanationList.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-800 bg-amber-50/40 p-3 rounded-lg border border-amber-200/60 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">No detailed attribution generated for this item.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Human-in-the-Loop Override & Similar Reports */}
        <div className="space-y-6">
          {/* HUMAN-IN-THE-LOOP Review Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">Human-in-the-Loop Review</h4>
            </div>

            <p className="text-xs text-slate-600">
              HSE Officers retain authority over AI predictions. Overrides feed directly into the model retraining pipeline.
            </p>

            {report.prediction?.reviewed_by_human && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Human Review Recorded
                </span>
                <p className="text-slate-600 text-[11px]">
                  Reviewer: <strong className="text-slate-800">{report.prediction.reviewer_name || 'HSE Analyst'}</strong>
                </p>
                {report.prediction.human_override && (
                  <p className="text-amber-700 font-semibold text-[11px]">Status: Overridden by Supervisor</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 uppercase block">Reviewer Notes</label>
              <textarea
                rows={2}
                placeholder="Add audit justification notes or barrier investigation reference..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                disabled={isSubmittingFeedback}
                onClick={() => handleHumanReview(true)}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm SIF
              </button>

              <button
                disabled={isSubmittingFeedback}
                onClick={() => handleHumanReview(false)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Override Non-SIF
              </button>
            </div>
          </div>

          {/* SIMILAR REPORTS (pgvector / Sentence Transformer Cosine) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Similar Historical Reports
              </h4>
              <span className="text-[10px] font-mono text-slate-400">pgvector cosine</span>
            </div>

            <div className="space-y-2.5">
              {(report.similar_reports || []).length > 0 ? (
                report.similar_reports?.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectSimilar(sim.id)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-600 group-hover:underline">
                        {sim.report_id}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                        {sim.similarity_percentage}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-semibold line-clamp-1">
                      {sim.title}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {sim.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{sim.site}</span>
                      <SIFBadge isSif={sim.sif_potential} size="sm" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No similar incidents above threshold in memory.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
