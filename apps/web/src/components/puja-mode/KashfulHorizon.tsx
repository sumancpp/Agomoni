import React from 'react';

/**
 * Authentic Bengali Kashful Horizon & Clay Diya Base
 * Depicts the iconic white autumn reed grass (কাশফুল) swaying in the night breeze
 * along with glowing earthen diyas (মাটির প্রদীপ) that announce Durga Puja in Bengal.
 */
export const KashfulHorizon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Warm Diya Glow Pools along ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#120909] via-[#120909]/80 to-transparent z-0" />

      {/* SVG Layer: Swaying Kashful Silhouette & Earthen Diyas */}
      <svg
        viewBox="0 0 1440 180"
        className="relative z-10 w-full h-24 sm:h-32 md:h-40 object-cover object-bottom drop-shadow-[0_-4px_16px_rgba(231,199,102,0.18)]"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Kashful Cream Plume Gradient */}
          <linearGradient id="kashfulPlume" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A1010" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#F5E6C8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFF8EC" stopOpacity="0.9" />
          </linearGradient>

          {/* Diya Flame Gradient */}
          <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8EC" stopOpacity="1" />
            <stop offset="30%" stopColor="#E7C766" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#D1261F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#120909" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="terracottaClay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A331E" />
            <stop offset="50%" stopColor="#B34728" />
            <stop offset="100%" stopColor="#6E2412" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* BACKGROUND KASHFUL LAYER (Taller, softer plumes in the distance) */}
        {/* ========================================================================= */}
        <g opacity="0.45" className="animate-pulse" style={{ animationDuration: '6s' }}>
          {/* Left clusters */}
          <path
            d="M 60 180 C 70 120, 85 70, 115 35 C 105 60, 95 100, 90 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 120 180 C 135 110, 150 60, 180 25 C 165 55, 155 105, 145 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 230 180 C 240 125, 260 75, 290 40 C 275 65, 260 110, 250 180 Z"
            fill="url(#kashfulPlume)"
          />

          {/* Right clusters */}
          <path
            d="M 1180 180 C 1195 115, 1210 65, 1245 28 C 1230 55, 1215 105, 1205 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 1290 180 C 1300 120, 1320 60, 1360 20 C 1340 55, 1325 105, 1315 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 1370 180 C 1380 130, 1400 80, 1430 45 C 1415 70, 1400 115, 1390 180 Z"
            fill="url(#kashfulPlume)"
          />
        </g>

        {/* ========================================================================= */}
        {/* FOREGROUND KASHFUL LAYER (Crisp, feathery autumn stalks swaying) */}
        {/* ========================================================================= */}
        <g opacity="0.8">
          {/* Left Wing Stalks */}
          <path
            d="M 20 180 Q 40 110, 75 60 Q 60 95, 45 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 80 180 Q 110 90, 150 45 Q 130 85, 105 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 160 180 Q 185 105, 220 55 Q 200 95, 180 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 310 180 Q 330 115, 365 70 Q 350 105, 335 180 Z"
            fill="url(#kashfulPlume)"
          />

          {/* Center Subtle Reeds */}
          <path
            d="M 520 180 Q 535 130, 560 90 Q 550 120, 540 180 Z"
            fill="url(#kashfulPlume)"
            opacity="0.5"
          />
          <path
            d="M 700 180 Q 715 135, 735 98 Q 725 125, 718 180 Z"
            fill="url(#kashfulPlume)"
            opacity="0.4"
          />
          <path
            d="M 880 180 Q 900 130, 930 88 Q 915 120, 905 180 Z"
            fill="url(#kashfulPlume)"
            opacity="0.5"
          />

          {/* Right Wing Stalks */}
          <path
            d="M 1080 180 Q 1105 110, 1145 60 Q 1125 95, 1105 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 1230 180 Q 1260 85, 1310 40 Q 1285 85, 1260 180 Z"
            fill="url(#kashfulPlume)"
          />
          <path
            d="M 1340 180 Q 1365 100, 1405 50 Q 1385 90, 1365 180 Z"
            fill="url(#kashfulPlume)"
          />
        </g>

        {/* ========================================================================= */}
        {/* EARTHEN DIYAS (মাটির প্রদীপ) WITH WARM FLICKERING FLAMES */}
        {/* ========================================================================= */}
        {/* Diya 1 (Left flank) */}
        <g transform="translate(190, 158)">
          <circle cx="0" cy="-6" r="24" fill="url(#diyaGlow)" opacity="0.65" />
          {/* Terracotta diya bowl */}
          <path d="M -16 6 C -12 14, 12 14, 16 6 C 10 10, -10 10, -16 6 Z" fill="url(#terracottaClay)" />
          {/* Golden Flame */}
          <path
            d="M 0 -12 C -4 -4, -3 2, 0 5 C 3 2, 4 -4, 0 -12 Z"
            fill="#FFF8EC"
            className="animate-flame-flicker"
          />
          <circle cx="0" cy="1" r="2" fill="#E86014" />
        </g>

        {/* Diya 2 (Center Left) */}
        <g transform="translate(460, 162)">
          <circle cx="0" cy="-5" r="20" fill="url(#diyaGlow)" opacity="0.55" />
          <path d="M -14 5 C -10 12, 10 12, 14 5 C 9 9, -9 9, -14 5 Z" fill="url(#terracottaClay)" />
          <path
            d="M 0 -10 C -3.5 -3, -2.5 2, 0 4 C 2.5 2, 3.5 -3, 0 -10 Z"
            fill="#FFF8EC"
            className="animate-flame-flicker"
          />
          <circle cx="0" cy="1" r="1.8" fill="#E86014" />
        </g>

        {/* Diya 3 (Center Right) */}
        <g transform="translate(980, 162)">
          <circle cx="0" cy="-5" r="20" fill="url(#diyaGlow)" opacity="0.55" />
          <path d="M -14 5 C -10 12, 10 12, 14 5 C 9 9, -9 9, -14 5 Z" fill="url(#terracottaClay)" />
          <path
            d="M 0 -10 C -3.5 -3, -2.5 2, 0 4 C 2.5 2, 3.5 -3, 0 -10 Z"
            fill="#FFF8EC"
            className="animate-flame-flicker"
          />
          <circle cx="0" cy="1" r="1.8" fill="#E86014" />
        </g>

        {/* Diya 4 (Right flank) */}
        <g transform="translate(1250, 158)">
          <circle cx="0" cy="-6" r="24" fill="url(#diyaGlow)" opacity="0.65" />
          <path d="M -16 6 C -12 14, 12 14, 16 6 C 10 10, -10 10, -16 6 Z" fill="url(#terracottaClay)" />
          <path
            d="M 0 -12 C -4 -4, -3 2, 0 5 C 3 2, 4 -4, 0 -12 Z"
            fill="#FFF8EC"
            className="animate-flame-flicker"
          />
          <circle cx="0" cy="1" r="2" fill="#E86014" />
        </g>
      </svg>
    </div>
  );
};

export default KashfulHorizon;
