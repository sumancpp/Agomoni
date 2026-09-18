import React, { useEffect } from 'react';
import { X, Share2, PlusSquare, MoreVertical, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  isAndroid,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="relative w-full max-w-md bg-[#160B0C] border border-gold-500/40 rounded-2xl p-6 shadow-2xl text-cream-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-sindoor-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gold-300/80 hover:text-gold-200 hover:bg-night-800 rounded-full transition-colors"
          aria-label="Close installation instructions"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-night-950 border border-gold-500/40 p-1.5 flex items-center justify-center shadow-md">
            <img src="/icons/durga-eye.svg" alt="AGOMONI logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 id="pwa-install-title" className="text-lg font-bold text-gold-300 font-serif leading-tight">
              AGOMONI ইনস্টল করুন
            </h2>
            <p className="text-xs text-cream-200/80">পুজোটা সঙ্গে রাখুন আপনার ফোনে</p>
          </div>
        </div>

        {/* Platform Specific Instructions */}
        {isIOS ? (
          <div className="space-y-3.5 text-sm">
            <div className="p-3 bg-night-900/80 border border-gold-500/20 rounded-xl">
              <p className="font-medium text-gold-200 flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-sindoor-400" />
                iPhone / iPad (Safari) নির্দেশাবলী:
              </p>
              <p className="text-xs text-cream-300/80">
                অ্যাপল সাফারি ব্রাউজারে ৩টি সহজ ধাপে ইনস্টল করুন:
              </p>
            </div>

            <ol className="space-y-2.5 text-xs text-cream-100/90 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ১
                </span>
                <span>
                  সাফারি ব্রাউজারের নিচের বারে <strong className="text-gold-300 inline-flex items-center gap-1 font-semibold"><Share2 className="w-3.5 h-3.5" /> Share (শেয়ার)</strong> আইকনে ট্যাপ করুন।
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ২
                </span>
                <span>
                  তালিকায় নিচে স্ক্রোল করে <strong className="text-gold-300 inline-flex items-center gap-1 font-semibold"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen (হোম স্ক্রিনে যোগ)</strong> বেছে নিন।
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ৩
                </span>
                <span>
                  উপরে ডানদিকের <strong className="text-gold-300 font-semibold">'Add'</strong> বাটনে ট্যাপ করুন। আগমনী আইকন আপনার হোম স্ক্রিনে যুক্ত হয়ে যাবে!
                </span>
              </li>
            </ol>
          </div>
        ) : isAndroid ? (
          <div className="space-y-3.5 text-sm">
            <div className="p-3 bg-night-900/80 border border-gold-500/20 rounded-xl">
              <p className="font-medium text-gold-200 flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-sindoor-400" />
                Android (Chrome) নির্দেশাবলী:
              </p>
              <p className="text-xs text-cream-300/80">
                ক্রোম ব্রাউজারে ২ সেকেন্ডে অ্যাপ হিসেবে ইনস্টল করুন:
              </p>
            </div>

            <ol className="space-y-2.5 text-xs text-cream-100/90 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ১
                </span>
                <span>
                  ব্রাউজারের উপরে ডানদিকের ৩টি ডট <strong className="text-gold-300 inline-flex items-center gap-1 font-semibold"><MoreVertical className="w-3.5 h-3.5" /> মেনু</strong> আইকনে ট্যাপ করুন।
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ২
                </span>
                <span>
                  মেনু থেকে <strong className="text-gold-300 font-semibold">'Install app'</strong> অথবা <strong className="text-gold-300 font-semibold">'Add to Home screen'</strong> ট্যাপ করে কনফার্ম করুন।
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3.5 text-sm">
            <div className="p-3 bg-night-900/80 border border-gold-500/20 rounded-xl">
              <p className="font-medium text-gold-200 flex items-center gap-2 mb-1">
                <Monitor className="w-4 h-4 text-sindoor-400" />
                Desktop (Chrome / Edge) নির্দেশাবলী:
              </p>
              <p className="text-xs text-cream-300/80">
                ডেস্কটপ ব্রাউজার থেকে সরাসরি অ্যাপ মোডে ইনস্টল করুন:
              </p>
            </div>

            <ol className="space-y-2.5 text-xs text-cream-100/90 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ১
                </span>
                <span>
                  ব্রাউজারের অ্যাড্রেস বারের (URL bar) ডানপাশে <strong className="text-gold-300 font-semibold">Install Icon (ডাউনলোড বাটন)</strong>-এ ক্লিক করুন।
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sindoor-800 border border-gold-500/40 flex items-center justify-center font-bold text-[11px] text-gold-300 mt-0.5">
                  ২
                </span>
                <span>
                  <strong className="text-gold-300 font-semibold">'Install'</strong> কনফার্ম করলেই সম্পূর্ণ ফুলস্ক্রিন অ্যাপ হিসেবে আগমনী খুলে যাবে।
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Benefits reminder */}
        <div className="mt-5 pt-3.5 border-t border-gold-500/20 grid grid-cols-2 gap-2 text-[11px] text-cream-300/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            <span>ফুলস্ক্রিন অ্যাপ মোড</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            <span>অফলাইনেও ওপেন হয়</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            <span>দ্রুত এবং লাইটওয়েট</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            <span>ব্যাকগ্রাউন্ড মিউজিক সাপোর্ট</span>
          </div>
        </div>

        {/* Understand Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sindoor-700 to-sindoor-800 hover:from-sindoor-600 hover:to-sindoor-700 text-cream-100 font-semibold text-xs rounded-xl border border-gold-500/40 transition-all shadow-md active:scale-95"
          >
            বুঝেছি • Got It
          </button>
        </div>
      </div>
    </div>
  );
};
