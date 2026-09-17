import React from 'react';

/**
 * Traditional Bengali Alpana Corner Ornament (কলকা / পদ্ম কোণ)
 * Renders exquisite antique gold filigree in the corners of cards or containers.
 */
export const AlponaCorner: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position = 'top-left', className = '', size = 28 }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top-right':
        return 'top-1.5 right-1.5';
      case 'bottom-left':
        return 'bottom-1.5 left-1.5';
      case 'bottom-right':
        return 'bottom-1.5 right-1.5';
      default:
        return 'top-1.5 left-1.5';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClass()} pointer-events-none select-none z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${className}`}
      style={{ transform: getTransform() }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Corner Frame */}
        <path
          d="M 2 24 L 2 6 C 2 3.8 3.8 2 6 2 L 24 2"
          stroke="#D4AF37"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Traditional Kalkaa / Paisley Curve */}
        <path
          d="M 6 18 C 6 11, 11 6, 18 6 C 14 10, 14 14, 18 18 C 12 18, 9 15, 6 18 Z"
          fill="none"
          stroke="#E7C766"
          strokeWidth="0.9"
        />

        {/* Sindoor Dot Accent */}
        <circle cx="8" cy="8" r="1.5" fill="#D1261F" />

        {/* Sacred Conch / Ray Dot */}
        <circle cx="16" cy="4" r="1" fill="#D4AF37" />
        <circle cx="4" cy="16" r="1" fill="#D4AF37" />
      </svg>
    </div>
  );
};

export default AlponaCorner;
