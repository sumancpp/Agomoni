import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AlponaDivider from '../common/AlponaDivider';
import { PwaInstallButton } from '../pwa/PwaInstallButton';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#180C0C]/95 border-t border-gold-500/25 pt-14 pb-24 lg:pb-12 text-[#FFF8EC] shadow-2xl relative overflow-hidden">
      {/* Subtle background ambient gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-b from-gold-500/10 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <AlponaDivider />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-500/40 p-0.5 bg-[#2A0B0B]/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                <img src="/icons/durga-eye.svg" alt="Agomoni" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold font-cinzel text-[#FFF8EC] tracking-wider">AGOMONI</span>
            </div>
            <p className="text-sm font-bengali text-gold-300 font-semibold italic">
              "এই পুজোয়, কিছু মানুষ আপন হোক।"
            </p>
            <p className="text-xs text-cream-300 leading-relaxed">
              Celebrate. Connect. Remember. Stay Safe. A digital Durga Puja companion honoring Bengali heritage.
            </p>
            {/* Small Diya Motif */}
            <div className="flex items-center gap-2 text-gold-400 text-xs pt-1">
              <span>🪔</span>
              <span className="text-gold-300/80 font-bengali">মায়ের আগমনী বার্তা</span>
            </div>

            {/* PWA Install Button in Footer */}
            <div className="pt-2">
              <PwaInstallButton variant="compact" />
            </div>
          </div>

          {/* Quick Pillars */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <span>❖</span>
              <span>উৎসবের ফিচার্স / Pillars</span>
            </h4>
            <ul className="space-y-2 text-xs text-cream-300">
              <li><Link to="/puja-date" className="hover:text-gold-300 transition-colors">🌸 Puja Date (18+)</Link></li>
              <li><Link to="/lost-found" className="hover:text-gold-300 transition-colors">🧒 Lost & Found (নিরাপত্তা)</Link></li>
              <li><Link to="/memories" className="hover:text-gold-300 transition-colors">📦 Memory Capsule</Link></li>
              <li><Link to="/songs" className="hover:text-gold-300 transition-colors">🎵 Puja Songs Room</Link></li>
            </ul>
          </div>

          {/* Safety & Helplines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <span>❖</span>
              <span>নিরাপত্তা / Safety & Helplines</span>
            </h4>
            <ul className="space-y-2 text-xs text-cream-300">
              <li><Link to="/emergency" className="text-sindoor-400 hover:text-sindoor-300 font-semibold hover:underline flex items-center gap-1">🚨 Emergency Helpline: 112</Link></li>
              <li>Police Control: 100</li>
              <li>Ambulance: 108 / 102</li>
              <li>Women Safety Helpline: 1090 / 1091</li>
              <li>Childline Service: 1098</li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <span>❖</span>
              <span>আইনগত ও নীতি / Legal & Privacy</span>
            </h4>
            <ul className="space-y-2 text-xs text-cream-300">
              <li><Link to="/legal?tab=privacy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal?tab=terms" className="hover:text-gold-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal?tab=safety" className="hover:text-gold-300 transition-colors">Dating Safety Guidelines</Link></li>
              <li><Link to="/legal?tab=community" className="hover:text-gold-300 transition-colors">Community Guidelines</Link></li>
              <li><Link to="/legal?tab=deletion" className="hover:text-gold-300 transition-colors">Account & Data Deletion</Link></li>
            </ul>
          </div>
        </div>

        {/* Closing Devotional Quote & Copyright */}
        <div className="pt-8 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-400 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bengali text-sm text-gold-300 font-semibold tracking-wide">
              "মায়ের আগমনের অপেক্ষায়, বাংলা।"
            </p>
            <p className="text-[11px] text-cream-400">
              © 2026 AGOMONI. Crafted with devotion & Bengali cultural pride.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gold-400 font-bengali font-bold">
              <Sparkles size={13} /> জয় মা দুর্গা
            </span>
            <span className="text-gold-500/40">•</span>
            <span className="text-cream-400 text-[11px]">PWA 1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
