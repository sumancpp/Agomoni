import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export const PwaUpdateToast: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodically check for updates every hour in production
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('PWA registration notice:', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="App update available"
      className="fixed top-20 right-4 left-4 md:left-auto md:max-w-md z-50 animate-slide-down"
    >
      <div className="bg-[#1C0A0C]/95 backdrop-blur-md border border-gold-400/60 rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-cream-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0" role="img" aria-label="flower">🌸</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gold-300 font-serif">
              নতুন AGOMONI এসেছে!
            </p>
            <p className="text-[11px] text-cream-200/85 truncate">
              নতুন ফিচার ও সুরের জন্য এখনই আপডেট করুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-night-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            <span>আপডেট করুন</span>
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="p-1.5 text-cream-300/60 hover:text-cream-100 hover:bg-night-800 rounded-full transition-colors"
            aria-label="Dismiss update"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
