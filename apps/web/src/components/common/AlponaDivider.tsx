import React from 'react';

export const AlponaDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center my-8 ${className}`}>
      {/* Left elegant gold gradient trail */}
      <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent via-gold-500/50 to-gold-400"></div>

      {/* Ornate Alpana Center Motif */}
      <div className="mx-4 flex items-center gap-2 text-gold-500/90 select-none">
        <svg
          viewBox="0 0 160 36"
          className="w-36 sm:w-44 h-9 overflow-visible text-gold-500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Symmetrical scrollwork */}
          <path
            d="M 10 18 Q 30 6 50 18 T 80 18"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <path
            d="M 150 18 Q 130 6 110 18 T 80 18"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <path
            d="M 20 18 Q 35 28 50 18"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <path
            d="M 140 18 Q 125 28 110 18"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Sindoor petals */}
          <circle cx="50" cy="18" r="3" fill="#B51218" opacity="0.8" />
          <circle cx="110" cy="18" r="3" fill="#B51218" opacity="0.8" />
          <circle cx="35" cy="12" r="1.8" fill="#E7C766" opacity="0.75" />
          <circle cx="125" cy="12" r="1.8" fill="#E7C766" opacity="0.75" />

          {/* Central Lotus & Diya Flame */}
          <path
            d="M 80 6 C 75 11, 74 15, 80 19 C 86 15, 85 11, 80 6 Z"
            fill="url(#diyaFlameGrad)"
            className="animate-flame-flicker"
          />
          <path
            d="M 72 19 C 75 24, 85 24, 88 19 C 85 22, 75 22, 72 19 Z"
            fill="#D4AF37"
          />
          <circle cx="80" cy="24" r="1.5" fill="#B51218" />

          <defs>
            <linearGradient id="diyaFlameGrad" x1="80" y1="6" x2="80" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF8EC" />
              <stop offset="0.5" stopColor="#E7C766" />
              <stop offset="1" stopColor="#D1261F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right elegant gold gradient trail */}
      <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent via-gold-500/50 to-gold-400"></div>
    </div>
  );
};

export default AlponaDivider;

