import React from 'react';

interface RiskBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = false, size = 'md' }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (normLevel === 'HIGH') {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (normLevel === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border whitespace-nowrap ${
      size === 'sm'
        ? 'gap-1 px-1.5 py-0.5 text-[10px]'
        : 'gap-1.5 px-2.5 py-0.5 text-xs'
    } ${colorClasses}`}>
      <span className={`rounded-full shrink-0 ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5'} ${dotColor}`} />
      {normLevel}
      {showScore && score !== undefined && (
        <span className="font-mono ml-0.5 opacity-80">({score.toFixed(2)})</span>
      )}
    </span>
  );
};
