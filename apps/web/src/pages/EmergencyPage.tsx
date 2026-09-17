import React, { useEffect, useState } from 'react';
import { ShieldAlert, PhoneCall, VolumeX, MapPin, Plus, Trash2, Hospital, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import FestiveButton from '../components/common/FestiveButton';
import { apiFetch } from '../lib/api';

interface Helpline {
  name: string;
  number: string;
  category: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export const EmergencyPage: React.FC = () => {
  const { t } = useLanguage();
  const { token, isAuthenticated } = useAuth();
  const { pauseForEmergency, isPlaying } = useMusicPlayer();

  const [nationalHelplines, setNationalHelplines] = useState<Helpline[]>([]);
  const [localResources, setLocalResources] = useState<any[]>([]);
  const [userContacts, setUserContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);

  // New contact form
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Location status
  const [locationStatus, setLocationStatus] = useState<string>('Location permission not requested');

  useEffect(() => {
    // Automatically pause music when entering Emergency as specified
    pauseForEmergency();

    apiFetch('/api/v1/emergency/directory')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNationalHelplines(data.nationalHelplines);
          setLocalResources(data.localResources);
        }
      });

    if (token) {
      fetchUserContacts();
    }
  }, [token]);

  const fetchUserContacts = async () => {
    try {
      const res = await apiFetch('/api/v1/emergency/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUserContacts(data.contacts);
      }
    } catch (err) {
      console.error('Fetch emergency contacts', err);
    }
  };

  const handleRequestLocation = () => {
    if ('geolocation' in navigator) {
      setLocationStatus('Requesting GPS permission...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus(
            `Location verified: ~${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} (Approximate)`
          );
        },
        () => {
          setLocationStatus('Location access denied. Please dial 112 directly for assistance.');
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by your browser.');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await apiFetch('/api/v1/emergency/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: contactName, relationship, phoneNumber }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddingContact(false);
        setContactName('');
        setRelationship('');
        setPhoneNumber('');
        fetchUserContacts();
      }
    } catch (err) {
      alert('Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await fetch(`/api/v1/emergency/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserContacts();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Dominance Header with Mute Action */}
      <div className="bg-red-950/80 border-2 border-red-600 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/80 text-white text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={14} /> Immediate Assistance Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
            {t.emergency.heading}
          </h1>
          <p className="text-xs text-cream-200 font-bengali">
            {t.emergency.subheading}
          </p>
        </div>

        {/* Immediate Pause/Mute Music Action */}
        <FestiveButton
          variant="secondary"
          size="md"
          onClick={pauseForEmergency}
          className="gap-2 bg-night-950 border-red-500/50 hover:bg-black text-red-300"
        >
          <VolumeX size={16} />
          <span>{t.emergency.pauseMusic}</span>
        </FestiveButton>
      </div>

      {/* Geolocation Verification Box */}
      <div className="puja-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-cream-100 flex items-center gap-1.5">
            <MapPin size={14} className="text-gold-400" /> Dispatch Location Verification
          </span>
          <p className="text-cream-400">{locationStatus}</p>
        </div>
        <FestiveButton variant="secondary" size="sm" onClick={handleRequestLocation}>
          Grant Location
        </FestiveButton>
      </div>

      {/* National Helplines Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-cinzel">
          {t.emergency.nationalHelplines}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {nationalHelplines.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number.split(' ')[0]}`}
              className="p-4 rounded-2xl bg-night-900 border border-red-500/30 hover:border-red-500 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-semibold text-cream-100 group-hover:text-red-400">
                  {item.name}
                </h4>
                <p className="text-base font-extrabold text-white mt-1">{item.number}</p>
              </div>
              <div className="p-2 rounded-xl bg-red-950/80 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <PhoneCall size={16} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Local Verified Emergency Hospitals & Police */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-cinzel">
          {t.emergency.localHospitalsPolice}
        </h3>
        <div className="space-y-2">
          {localResources.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl bg-night-900 border border-gold-500/20 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-cream-100 flex items-center gap-2">
                  {res.category === 'HOSPITAL' ? (
                    <Hospital size={15} className="text-blue-400" />
                  ) : (
                    <Building2 size={15} className="text-yellow-400" />
                  )}
                  <span>{res.title}</span>
                </h4>
                <p className="text-[11px] text-cream-400">{res.address}</p>
              </div>
              <a
                href={`tel:${res.phoneNumber}`}
                className="px-3 py-1.5 rounded-xl bg-night-850 hover:bg-gold-500 hover:text-night-950 font-bold text-gold-400 border border-gold-500/40 flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall size={13} />
                <span>{res.phoneNumber}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* My Emergency Contacts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-cinzel">
            {t.emergency.myContacts}
          </h3>
          <FestiveButton
            variant="secondary"
            size="sm"
            onClick={() => setIsAddingContact(true)}
            className="gap-1.5 text-xs"
          >
            <Plus size={14} />
            <span>{t.emergency.addContact}</span>
          </FestiveButton>
        </div>

        {userContacts.length === 0 ? (
          <div className="puja-card p-6 text-center rounded-2xl text-xs text-cream-400">
            জরুরি পরিস্থিতিতে দ্রুত যোগাযোগের জন্য পরিবারের সদস্যদের নম্বর যোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userContacts.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-night-900 border border-gold-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-cream-100">{c.name}</h4>
                  <span className="text-[10px] text-gold-400 font-medium">({c.relationship})</span>
                  <p className="text-cream-300 font-semibold mt-1">{c.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="p-2 rounded-xl bg-green-950 text-green-400 hover:bg-green-800 hover:text-white transition-colors"
                  >
                    <PhoneCall size={15} />
                  </a>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-2 text-cream-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-cream-100 font-cinzel">
              + Add Private Emergency Contact
            </h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="text-cream-300 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Baba, Didi, Best Friend"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-cream-300 block mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Father / Sister / Friend"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-cream-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98300 00000"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <FestiveButton
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1"
                >
                  Cancel
                </FestiveButton>
                <FestiveButton type="submit" variant="gold" className="flex-1">
                  Save Contact
                </FestiveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
