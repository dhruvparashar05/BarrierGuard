import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUpIsBad?: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  variant?: 'blue' | 'red' | 'amber' | 'slate' | 'emerald';
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUpIsBad = false,
  trendDirection = 'neutral',
  icon: Icon,
  variant = 'blue',
  badgeText
}) => {
  const variantStyles = {
    blue: {
      border: 'border-slate-200 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600',
      valColor: 'text-slate-900',
    },
    red: {
      border: 'border-red-200 hover:border-red-300 bg-red-50/20',
      iconBg: 'bg-red-100 text-red-600',
      valColor: 'text-red-700',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-300 bg-amber-50/20',
      iconBg: 'bg-amber-100 text-amber-600',
      valColor: 'text-amber-800',
    },
    slate: {
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      valColor: 'text-slate-900',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/20',
      iconBg: 'bg-emerald-100 text-emerald-600',
      valColor: 'text-emerald-800',
    }
  };

  const style = variantStyles[variant];

  const getTrendColor = () => {
    if (trendDirection === 'neutral') return 'text-slate-500 bg-slate-100';
    const isBad = trendDirection === 'up' ? trendUpIsBad : !trendUpIsBad;
    return isBad ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50';
  };

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-xs transition-all duration-200 ${style.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight font-mono ${style.valColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badgeText && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${getTrendColor()}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
