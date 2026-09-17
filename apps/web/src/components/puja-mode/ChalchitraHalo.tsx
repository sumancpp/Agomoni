import React from 'react';

/**
 * Authentic Bengali Chalchitra (চালচিত্র / প্রভামণ্ডল)
 * Traditional semicircular ornamental arch found behind Maa Durga idols in Bengal.
 * Provides unmistakable Durga Puja sacred iconography even when viewed without text.
 */
export const ChalchitraHalo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Ambient Divine Radiance Behind Arch */}
      <div className="absolute -top-10 w-[420px] sm:w-[620px] md:w-[780px] h-[280px] sm:h-[380px] md:h-[460px] bg-gradient-to-b from-gold-500/18 via-sindoor-600/12 to-transparent rounded-t-full blur-3xl" />

      <svg
        viewBox="0 0 600 320"
        className="w-[340px] sm:w-[500px] md:w-[680px] h-auto overflow-visible opacity-80 transition-opacity duration-700 hover:opacity-100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold foil metallic gradient */}
          <linearGradient id="chalchitraGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8EC" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#E7C766" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#B8860B" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#8A6409" stopOpacity="0.8" />
          </linearGradient>

          {/* Sindoor crimson gradient */}
          <linearGradient id="chalchitraSindoor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D1261F" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8A0C10" stopOpacity="0.5" />
          </linearGradient>

          {/* Radial soft glow filter */}
          <filter id="chalchitraGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Prabhavali Radiating Flame Rays (অগ্নিশিখা প্রভামণ্ডল) */}
        <g stroke="url(#chalchitraGold)" strokeWidth="1.2" opacity="0.65">
          {Array.from({ length: 27 }).map((_, i) => {
            const angle = Math.PI - (i * Math.PI) / 26;
            const rInner = 245;
            const rOuter = i % 2 === 0 ? 275 : 262;
            const x1 = 300 + rInner * Math.cos(angle);
            const y1 = 310 - rInner * Math.sin(angle);
            const x2 = 300 + rOuter * Math.cos(angle);
            const y2 = 310 - rOuter * Math.sin(angle);
            return (
              <line
                key={`ray-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray={i % 4 === 0 ? 'none' : '2,2'}
              />
            );
          })}
        </g>

        {/* Outer Chalchitra Rim Arch */}
        <path
          d="M 55 310 A 245 245 0 0 1 545 310"
          stroke="url(#chalchitraGold)"
          strokeWidth="2.5"
          filter="url(#chalchitraGlow)"
        />

        {/* Ornate Scallop / Lotus Petal Crest Arch */}
        <path
          d="M 68 310 A 232 232 0 0 1 532 310"
          stroke="url(#chalchitraGold)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity="0.8"
        />

        {/* Middle Decorative Arch Band with Bengali Alpana Lotus Petals */}
        <path
          d="M 90 310 A 210 210 0 0 1 510 310"
          stroke="url(#chalchitraSindoor)"
          strokeWidth="6"
          opacity="0.35"
        />
        <path
          d="M 90 310 A 210 210 0 0 1 510 310"
          stroke="url(#chalchitraGold)"
          strokeWidth="1.5"
        />

        {/* Inner Lotus Petal Border */}
        {Array.from({ length: 21 }).map((_, i) => {
          const angle = Math.PI - (i * Math.PI) / 20;
          const r = 188;
          const cx = 300 + r * Math.cos(angle);
          const cy = 310 - r * Math.sin(angle);
          return (
            <circle
              key={`petal-${i}`}
              cx={cx}
              cy={cy}
              r={i % 2 === 0 ? 3 : 2}
              fill={i % 2 === 0 ? 'url(#chalchitraGold)' : '#D1261F'}
              opacity="0.85"
            />
          );
        })}

        {/* Inner Arch */}
        <path
          d="M 130 310 A 170 170 0 0 1 470 310"
          stroke="url(#chalchitraGold)"
          strokeWidth="1.8"
          opacity="0.75"
        />

        {/* Innermost Delicate Arch */}
        <path
          d="M 155 310 A 145 145 0 0 1 445 310"
          stroke="url(#chalchitraGold)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Top Pinnacle Kalash / Mukut Finial (শীর্ষ কলকা ও ত্রিশূল চিহ্ন) */}
        <g transform="translate(300, 32)">
          {/* Central Finial Diya Flame */}
          <path
            d="M 0 -22 C -6 -12 -5 -4 0 4 C 5 -4 6 -12 0 -22 Z"
            fill="url(#chalchitraGold)"
            filter="url(#chalchitraGlow)"
          />
          <circle cx="0" cy="-6" r="2.5" fill="#D1261F" />

          {/* Symmetrical Shankha / Lotus Scrollwork Finials */}
          <path
            d="M -1 -2 Q -18 -10 -24 -24 Q -12 -18 0 -4 Q 12 -18 24 -24 Q 18 -10 1 -2"
            stroke="url(#chalchitraGold)"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

export default ChalchitraHalo;
