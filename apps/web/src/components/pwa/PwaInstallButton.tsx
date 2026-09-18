import React from 'react';
import { Download } from 'lucide-react';
import { usePwaInstall } from './usePwaInstall';
import { PwaInstallModal } from './PwaInstallModal';

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'prominent' | 'card' | 'compact';
  labelBengali?: string;
  labelEnglish?: string;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  className = '',
  variant = 'compact',
  labelBengali = 'পুজোটা সঙ্গে রাখুন',
  labelEnglish = 'Install App',
}) => {
  const {
    isStandalone,
    isIOS,
    isAndroid,
    showInstructions,
    setShowInstructions,
    triggerInstall,
  } = usePwaInstall();

  // If already installed or launched from home screen in standalone mode, do not show button
  if (isStandalone) {
    return null;
  }

  let buttonStyles = '';
  if (variant === 'navbar') {
    buttonStyles =
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-sindoor-700/80 to-sindoor-800/90 text-gold-200 text-xs font-semibold border border-gold-500/40 hover:border-gold-400 hover:text-white transition-all shadow-sm hover:shadow-gold-500/20 active:scale-95';
  } else if (variant === 'prominent') {
    buttonStyles =
      'inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-sindoor-600 via-sindoor-700 to-sindoor-800 text-cream-100 font-semibold text-sm border border-gold-500/50 shadow-lg shadow-sindoor-900/40 hover:shadow-gold-500/20 hover:scale-[1.02] active:scale-95 transition-all';
  } else if (variant === 'card') {
    buttonStyles =
      'w-full flex items-center justify-between p-3.5 rounded-xl bg-night-900/90 border border-gold-500/30 hover:border-gold-500/60 text-left transition-all group';
  } else {
    // compact
    buttonStyles =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-850/80 border border-gold-500/30 text-gold-300 text-[11px] font-medium hover:bg-sindoor-900/40 transition-colors';
  }

  return (
    <>
      <button
        onClick={triggerInstall}
        className={`${buttonStyles} ${className}`}
        aria-label="Install AGOMONI PWA"
        title="Install AGOMONI App on your device"
      >
        {variant === 'card' ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sindoor-950 border border-gold-500/30 flex items-center justify-center text-gold-300 flex-shrink-0">
                <Download className="w-5 h-5 text-gold-400 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-200 font-serif">{labelBengali}</p>
                <p className="text-xs text-cream-300/70">{labelEnglish}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-sindoor-800/80 text-gold-300 font-medium border border-gold-500/30 group-hover:bg-sindoor-700 transition-colors">
              ইনস্টল
            </span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-serif">{labelBengali}</span>
          </>
        )}
      </button>

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
