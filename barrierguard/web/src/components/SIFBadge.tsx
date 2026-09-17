import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SIFBadgeProps {
  isSif: boolean;
  probability?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SIFBadge: React.FC<SIFBadgeProps> = ({ isSif, probability, size = 'md' }) => {
  if (isSif) {
    return (
      <span className={`inline-flex items-center font-bold rounded-lg border shadow-sm ${
        size === 'lg'
          ? 'px-3.5 py-1.5 text-sm bg-red-600 text-white border-red-700 gap-1.5'
          : size === 'sm'
          ? 'px-1.5 py-0.5 text-[10px] bg-red-50 text-red-700 border-red-200 tracking-tight gap-1'
          : 'px-2.5 py-1 text-xs bg-red-100 text-red-800 border-red-300 gap-1.5'
      }`}>
        <AlertTriangle className={size === 'lg' ? 'w-4 h-4 shrink-0' : size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
        <span>SIF-POTENTIAL</span>
        {probability !== undefined && (
          <span className={`font-mono font-medium ${size === 'lg' ? 'text-red-100' : 'text-red-600'}`}>
            ({(probability * 100).toFixed(0)}%)
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-lg border ${
      size === 'lg'
        ? 'px-3.5 py-1.5 text-sm bg-slate-100 text-slate-700 border-slate-300 gap-1.5'
        : size === 'sm'
        ? 'px-1.5 py-0.5 text-[10px] bg-slate-50 text-slate-600 border-slate-200 gap-1'
        : 'px-2.5 py-0.5 text-xs bg-slate-50 text-slate-600 border-slate-200 gap-1.5'
    }`}>
      <CheckCircle2 className={size === 'lg' ? 'w-4 h-4 text-slate-500 shrink-0' : size === 'sm' ? 'w-3 h-3 text-slate-400 shrink-0' : 'w-3 h-3 text-slate-400 shrink-0'} />
      <span>Non-SIF</span>
      {probability !== undefined && (
        <span className="font-mono text-slate-400 text-xs">
          ({(probability * 100).toFixed(0)}%)
        </span>
      )}
    </span>
  );
};
