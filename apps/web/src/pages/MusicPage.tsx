import React, { useEffect, useState } from 'react';
import { Play, Pause, Music, Disc, Radio, Sparkles } from 'lucide-react';
import { useMusicPlayer, MusicTrack } from '../context/MusicPlayerContext';
import { useLanguage } from '../context/LanguageContext';
import FestiveButton from '../components/common/FestiveButton';

interface Playlist {
  id: string;
  name: string;
  nameBengali?: string;
  description?: string;
  coverImage?: string;
  tracks: MusicTrack[];
}

export const MusicPage: React.FC = () => {
  const { t } = useLanguage();
  const { activeTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = [
    { key: 'ALL', label: 'সমস্ত গান / All' },
    { key: 'MAHALAYA', label: '🪔 মহালয়া' },
    { key: 'PUJA_SONGS', label: '🎵 পুজোর গান' },
    { key: 'DHAK', label: '🥁 ঢাক ও ধুনুচি' },
    { key: 'AGOMONI', label: '🌺 আগমনী' },
    { key: 'AMBIENT', label: '🌙 সান্ধ্য ও লোকসঙ্গীত' },
  ];

  useEffect(() => {
    fetch('/api/v1/music/playlists')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlaylists(data.playlists);
          const allTracks = data.playlists.flatMap((p: Playlist) => p.tracks);
          // Always ensure Dugga Elo is default at the top
          allTracks.sort((a: MusicTrack, b: MusicTrack) => {
            const aIsDugga = a.title.toLowerCase().includes('dugga elo');
            const bIsDugga = b.title.toLowerCase().includes('dugga elo');
            if (aIsDugga && !bIsDugga) return -1;
            if (!aIsDugga && bIsDugga) return 1;
            return 0;
          });
          setTracks(allTracks);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTracks = selectedCategory === 'ALL'
    ? tracks
    : tracks.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Puja Music Room Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A0B0B]/80 border border-gold-500/40 text-gold-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-black/50">
          <span className="text-sm">🪔</span>
          <span className="font-bengali">আগমনী সঙ্গীতালয় • Puja Music Room</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-bengali text-[#FFF8EC] gold-gradient-text">
          {t.features.songs.title}
        </h1>
        <p className="text-xs sm:text-sm text-cream-200 font-bengali max-w-lg mx-auto leading-relaxed">
          মহালয়ার ভোর থেকে দশমীর ভাসান—বাঙালির দুর্গোৎসবের অবিচ্ছেদ্য সুর ও আগমনী গান
        </p>

        {/* Quick Play All Songs CTA */}
        {tracks.length > 0 && (
          <div className="pt-2 flex justify-center">
            <FestiveButton
              size="sm"
              variant="primary"
              onClick={() => {
                const targetTracks = filteredTracks.length > 0 ? filteredTracks : tracks;
                playTrack(targetTracks[0], targetTracks, true);
              }}
              className="gap-2 shadow-xl shadow-sindoor-950/80 px-6 py-2.5"
            >
              <Play size={15} className="fill-current" />
              <span className="font-bengali">সমস্ত গান শুনুন / Play All ({tracks.length})</span>
            </FestiveButton>
          </div>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all backdrop-blur-md font-bengali ${
              selectedCategory === c.key
                ? 'bg-gradient-to-r from-sindoor-600 to-sindoor-700 text-[#FFF8EC] shadow-lg shadow-sindoor-950/60 border border-gold-400/60'
                : 'bg-[#2A0B0B]/60 border border-gold-500/25 text-cream-200 hover:text-white hover:bg-[#3D1414]/80'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tracks Grid */}
      {isLoading ? (
        <div className="text-center py-20 space-y-3">
          <span className="text-4xl animate-bounce inline-block">🪔</span>
          <p className="text-sm text-gold-400 font-bengali">গান লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => {
              const isCurrentTrack = activeTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;

              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-4 group backdrop-blur-xl ${
                    isCurrentTrack
                      ? 'bg-gradient-to-r from-[#4A1010]/90 to-[#2A0B0B]/90 border-gold-400 shadow-2xl shadow-sindoor-950/70 ring-1 ring-gold-400/30'
                      : 'bg-[#240F0F]/65 border-gold-500/20 hover:border-gold-400/50 hover:bg-[#2A0B0B]/80 shadow-lg shadow-black/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Ornate Artwork with Diya/Flower cues */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#180C0C] border border-gold-500/40 flex-shrink-0 shadow-md">
                      {track.artworkUrl ? (
                        <img
                          src={track.artworkUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gold-400">
                          🎵
                        </div>
                      )}

                      {/* Animated Audio Equalizer Waveform Bars when playing */}
                      {isCurrentlyPlaying && (
                        <div className="absolute inset-0 bg-[#180C0C]/75 flex items-center justify-center gap-0.5">
                          <span className="w-1 bg-gold-400 rounded-full h-4 animate-pulse" />
                          <span className="w-1 bg-sindoor-400 rounded-full h-6 animate-pulse delay-75" />
                          <span className="w-1 bg-gold-300 rounded-full h-3 animate-pulse delay-150" />
                          <span className="w-1 bg-gold-500 rounded-full h-5 animate-pulse delay-100" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 truncate">
                      <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block font-bengali">
                        {track.category} • {track.provider === 'YOUTUBE_EMBED' ? 'YouTube' : 'Audio'}
                      </span>
                      <h4 className="text-sm font-bold text-[#FFF8EC] truncate mt-0.5 font-bengali">
                        {track.title}
                      </h4>
                      <p className="text-xs text-cream-300 truncate font-bengali">{track.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isCurrentTrack) {
                        togglePlay();
                      } else {
                        playTrack(track, filteredTracks);
                      }
                    }}
                    className={`p-3 rounded-2xl transition-all shadow-md flex-shrink-0 active:scale-95 ${
                      isCurrentlyPlaying
                        ? 'bg-gold-500 text-[#120909] font-bold shadow-gold-500/30'
                        : 'bg-[#180C0C] text-gold-300 border border-gold-500/30 hover:bg-gold-500 hover:text-[#120909]'
                    }`}
                    aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrentlyPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
