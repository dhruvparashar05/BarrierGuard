import React from 'react';

interface OilLogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // light: for dark backgrounds; dark: for light backgrounds (default)
}

export const OilLogo: React.FC<OilLogoProps> = ({ className = 'h-10', variant = 'dark' }) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#0F172A' : '#FFFFFF';
  const mottoColor = isDark ? '#475569' : '#CBD5E1';
  const innerHole = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Oil India Limited Emblem */}
      <div className="relative shrink-0 flex flex-col items-center">
        {/* Outer Black Ring */}
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
          {/* Inner Circle / Hole */}
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: innerHole }}
          />
        </div>
        {/* Red Vertical Stand / Pillar */}
        <div className="w-3.5 h-4 -mt-1 bg-red-600 rounded-[1.5px] shadow-sm" />
      </div>

      {/* Official Typography Hierarchy */}
      <div className="flex flex-col justify-center leading-none">
        {/* Hindi: ऑयल इंडिया लिमिटेड */}
        <span
          className="text-[11px] sm:text-[12px] font-bold tracking-tight"
          style={{ color: textColor, fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
        >
          ऑयल इंडिया लिमिटेड
        </span>

        {/* English: Oil India Limited */}
        <span
          className="text-[13px] sm:text-[14px] font-extrabold tracking-tight -mt-0.5"
          style={{ color: textColor }}
        >
          Oil India Limited
        </span>

        {/* Red Accent Divider */}
        <div className="w-full h-[1.5px] bg-red-600 my-[1.5px]" />

        {/* Tagline: Conquering Newer Horizons */}
        <span
          className="text-[9px] sm:text-[9.5px] italic tracking-tight font-serif"
          style={{ color: mottoColor }}
        >
          Conquering Newer Horizons
        </span>
      </div>
    </div>
  );
};
