import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import AlponaDivider from '../components/common/AlponaDivider';

export const LegalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'safety';
  const [activeTab, setActiveTab] = useState<'safety' | 'privacy' | 'terms' | 'community' | 'deletion'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-cinzel text-cream-100">
          Agomoni Legal & Safety Policies
        </h1>
        <p className="text-xs text-gold-400 font-bengali">
          উৎসবের আনন্দ হোক স্বচ্ছ, নিরাপদ ও সুরক্ষিত
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-gold-500/20">
        {[
          { key: 'safety', label: '🛡️ Dating Safety', icon: AlertTriangle },
          { key: 'privacy', label: '🔒 Privacy Policy', icon: Lock },
          { key: 'terms', label: '📜 Terms of Service', icon: FileText },
          { key: 'community', label: '🤝 Community Guidelines', icon: ShieldCheck },
          { key: 'deletion', label: '🗑️ Account Deletion', icon: Trash2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'bg-night-900 border border-gold-500/20 text-cream-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="puja-card p-6 sm:p-8 rounded-3xl space-y-6 text-xs text-cream-200 leading-relaxed">
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gold-400 font-cinzel">
              Puja Date Safety Guidelines (নিরাপত্তা নির্দেশিকা)
            </h2>
            <div className="p-4 bg-sindoor-950/70 border border-sindoor-500/40 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">1. Strict 18+ Verification</h4>
              <p>Puja Date is exclusively for individuals aged 18 and older. Any attempt by minors to falsify date of birth will lead to an immediate ban.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-cream-50 text-sm">2. Never Send Money to Strangers</h4>
              <p>Agomoni will NEVER ask you to wire money or transfer funds to another user. If anyone asks for cash, gift cards, or crypto under any pretext, report and block them immediately.</p>

              <h4 className="font-bold text-cream-50 text-sm">3. Meet in Busy, Well-Lit Public Pandals</h4>
              <p>For your first meeting, always choose renowned, well-lit, crowded Puja pandals (e.g. Maddox Square, Bagbazar, Ekdalia) or reputable cafes. Never meet in private, secluded apartments or deserted areas.</p>

              <h4 className="font-bold text-cream-50 text-sm">4. Keep Friends or Family Informed</h4>
              <p>Always tell a trusted family member or friend where you are going, who you are meeting, and maintain your phone fully charged with our Emergency button handy.</p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gold-400 font-cinzel">
              Privacy Policy (গোপনীয়তা নীতি)
            </h2>
            <p>At Agomoni, your privacy is a foundational architectural principle. We follow a privacy-first, minimal-data retention model:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>No Precise GPS Exposure:</strong> We never broadcast exact lat/lng coordinates or street addresses to other users. Only approximate distances (e.g. "~3 km away" or neighborhood name) are displayed.</li>
              <li><strong>Masked Contact Relays:</strong> In Lost & Found, contact mechanisms are masked to prevent spam and extortion.</li>
              <li><strong>Private by Default:</strong> Memory Capsules remain private unless explicitly made shareable with an unguessable cryptographic token.</li>
              <li><strong>Secure Payments:</strong> Payments are processed directly through Razorpay PCI-DSS certified systems. Agomoni never stores credit/debit card numbers.</li>
            </ul>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gold-400 font-cinzel">
              Terms of Service (ব্যবহারের শর্তাবলী)
            </h2>
            <p>By accessing or using the Agomoni Progressive Web App, you agree to abide by these Terms:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>You agree to provide accurate registration information and acknowledge the 18+ requirement for dating interactions.</li>
              <li>You agree not to post defamatory, obscene, harassing, or fraudulent content.</li>
              <li>All digital entitlements (e.g. ₹49 Unlimited Chat, ₹29 Lost & Found Post) are non-refundable once activated and verified on our servers.</li>
              <li>Agomoni provides technology tools for festive companion discovery and emergency contacts, but does not provide direct emergency dispatch or police response.</li>
            </ul>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gold-400 font-cinzel">
              Community & Cultural Guidelines
            </h2>
            <p>Agomoni is a digital celebration of Bengali culture and Durga Puja. We expect all community members to honor the festive spirit:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Treat every fellow seeker, devotee, and companion with courtesy and dignity.</li>
              <li>No hate speech, religious intolerance, or offensive cultural mockery will be tolerated.</li>
              <li>Violators will have their accounts immediately reviewed and permanently removed by platform moderators.</li>
            </ul>
          </div>
        )}

        {activeTab === 'deletion' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gold-400 font-cinzel">
              Account Deletion & Data Erasure Policy
            </h2>
            <p>You have full sovereignty over your digital footprint on Agomoni:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>You can permanently delete your account at any time via your Profile Settings.</li>
              <li>Upon triggering account deletion, your profile is immediately expunged from dating feeds, your session tokens are revoked, and your private memories and emergency contacts are purged from our active databases.</li>
              <li>Anonymized audit logs strictly required by statutory financial or anti-fraud laws will be preserved in accordance with regulatory retention standards.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPage;
