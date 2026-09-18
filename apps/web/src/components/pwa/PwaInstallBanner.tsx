import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from './usePwaInstall';
import { PwaInstallModal } from './PwaInstallModal';

export const PwaInstallBanner: React.FC = () => {
  const {
    isStandalone,
    isIOS,
    isAndroid,
    showInstructions,
    setShowInstructions,
    triggerInstall,
  } = usePwaInstall();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If already in standalone mode, do not show
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed the banner recently
    const dismissedUntil = localStorage.getItem('agomoni_pwa_banner_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // DO NOT aggressively show popups immediately after page load.
    // Delay appearance by 6 seconds to ensure meaningful user engagement first
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [isStandalone]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 24 hours
    localStorage.setItem(
      'agomoni_pwa_banner_dismissed_until',
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <>
      <aside
        aria-label="App installation banner"
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-40 animate-slide-up"
      >
        <div className="bg-[#180A0B]/95 backdrop-blur-md border border-gold-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-cream-100">
          {/* Logo & Text */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-night-950 border border-gold-500/30 p-1 flex-shrink-0 flex items-center justify-center shadow-inner">
              <img src="/icons/durga-eye.svg" alt="AGOMONI logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gold-300 font-serif truncate">
                ফোনে পুজোটাকে সঙ্গে রাখুন 🌺
              </p>
              <p className="text-[11px] text-cream-300/80 truncate">
                হোম স্ক্রিনে AGOMONI অ্যাপ যোগ করুন
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={triggerInstall}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sindoor-600 to-sindoor-700 hover:from-sindoor-500 hover:to-sindoor-600 text-cream-100 font-semibold text-xs border border-gold-500/50 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3 h-3 text-gold-300" />
              <span>ইনস্টল</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-cream-300/60 hover:text-cream-100 hover:bg-night-800 rounded-full transition-colors"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Manual Instructions Modal for iOS / unprompted browsers */}
      <PwaInstallModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />
    </>
  );
};
