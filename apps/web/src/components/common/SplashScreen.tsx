import React, { useState, useEffect } from 'react';

type SplashStage = 'darkness' | 'eyes-glow' | 'title-reveal' | 'dissolving';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    return !sessionStorage.getItem('agomoni_splash_seen');
  });

  const [stage, setStage] = useState<SplashStage>('darkness');

  useEffect(() => {
    if (!isVisible) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      sessionStorage.setItem('agomoni_splash_seen', 'true');
      return;
    }

    // Sequence:
    // 0ms: Subtle darkness
    // 120ms: Maa's eyes appear with warm golden glow
    const timer1 = setTimeout(() => {
      setStage('eyes-glow');
    }, 120);

    // 550ms: "আগমনী" fades and slides into view
    const timer2 = setTimeout(() => {
      setStage('title-reveal');
    }, 550);

    // 1250ms: Graceful dissolve out
    const timer3 = setTimeout(() => {
      setStage('dissolving');
    }, 1250);

    // 1650ms: Unmount
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('agomoni_splash_seen', 'true');
    }, 1650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    if (stage === 'dissolving') return;
    setStage('dissolving');
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('agomoni_splash_seen', 'true');
    }, 350);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 will-change-opacity select-none cursor-pointer bg-[#120909] ${
        stage === 'dissolving' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Agomoni Durga Puja Entrance"
    >
      {/* Deep maroon radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4A1010]/40 via-[#2A0B0B]/70 to-[#120909] pointer-events-none" />

      {/* Soft warm golden halo glow behind Maa's eyes */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-gold-500/20 via-sindoor-600/15 to-transparent blur-3xl pointer-events-none transition-all duration-700 ease-out ${
          stage !== 'darkness' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      />

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-gold-500/30 text-gold-400 text-xs font-medium backdrop-blur-md transition-all active:scale-95"
        >
          Skip ✕
        </button>
      </div>

      {/* Central Sequence Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 text-center flex flex-col items-center justify-center space-y-4">
        {/* Maa Durga Eyes with Soft Divine Glow */}
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 transition-all duration-700 ease-out transform ${
            stage !== 'darkness'
              ? 'opacity-100 scale-100 drop-shadow-[0_0_25px_rgba(212,175,55,0.7)]'
              : 'opacity-0 scale-90'
          }`}
        >
          <img
            src="/icons/durga-eye.svg"
            alt="Maa Durga"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title: আগমনী and Subtitle */}
        <div
          className={`space-y-1.5 transition-all duration-700 ease-out transform ${
            stage === 'title-reveal' || stage === 'dissolving'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-bold font-bengali tracking-tight gold-gradient-text drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            আগমনী
          </h1>
          <p className="text-base sm:text-lg font-bengali text-sindoor-300 font-semibold italic">
            মা আসছেন...
          </p>
        </div>

        {/* Subtle festive auspicious line */}
        <div
          className={`pt-2 transition-all duration-500 ${
            stage === 'title-reveal' ? 'opacity-80' : 'opacity-0'
          }`}
        >
          <span className="text-[11px] font-mono tracking-widest text-gold-400/90 uppercase">
            শারদীয়া ১৪৩৩ • SHARADOTSAV
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
