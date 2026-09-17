import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Minimize2, X, Volume2, Music, ListMusic } from 'lucide-react';
import { useMusicPlayer, initYouTubeListening } from '../../context/MusicPlayerContext';
import { useLanguage } from '../../context/LanguageContext';

export const FullMusicPlayerModal: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isFullPlayerOpen,
    playlist,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    playTrack,
    setIsFullPlayerOpen,
  } = useMusicPlayer();
  const { t } = useLanguage();

  const [hasStarted, setHasStarted] = React.useState(false);
  const [modalCategory, setModalCategory] = React.useState<string>('ALL');

  const modalCategories = [
    { key: 'ALL', label: 'সমস্ত / All' },
    { key: 'MAHALAYA', label: '🪔 মহালয়া' },
    { key: 'PUJA_SONGS', label: '🎵 পুজোর গান' },
    { key: 'DHAK', label: '🥁 ঢাক ও ধুনুচি' },
    { key: 'AGOMONI', label: '🌺 আগমনী' },
    { key: 'AMBIENT', label: '🌙 সান্ধ্য' },
  ];

  const filteredPlaylist = modalCategory === 'ALL'
    ? playlist
    : playlist.filter((t) => t.category === modalCategory);

  React.useEffect(() => {
    if (isPlaying || isFullPlayerOpen) {
      setHasStarted(true);
    }
  }, [isPlaying, isFullPlayerOpen]);

  // Reset if activeTrack changed to null or music stopped
  React.useEffect(() => {
    if (!activeTrack) {
      setHasStarted(false);
    }
  }, [activeTrack]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullPlayerOpen) {
        setIsFullPlayerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullPlayerOpen, setIsFullPlayerOpen]);

  // If not open or no active track, DO NOT render anything in the DOM
  if (!isFullPlayerOpen || !activeTrack) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFullPlayerOpen(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#120909]/90 backdrop-blur-md animate-fade-in pointer-events-auto"
    >
      <div className="relative w-full max-w-lg bg-[#180C0C] border border-gold-500/50 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-gold-400/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gold-500/20">
          <div className="flex items-center gap-2 text-gold-400">
            <span className="text-sm">🪔</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-bengali">
              {activeTrack.category} • {t.musicPlayer.nowPlaying}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullPlayerOpen(false)}
              aria-label="Minimize player"
              title="Minimize"
              className="p-2 text-cream-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={() => setIsFullPlayerOpen(false)}
              aria-label="Close player"
              title="Close"
              className="p-2 text-cream-400 hover:text-red-400 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Festive Artwork & Player Visualizer */}
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 mx-auto rounded-2xl overflow-hidden border-2 border-gold-500/50 shadow-2xl bg-[#120909] flex items-center justify-center group flex-shrink-0">
            {activeTrack.artworkUrl ? (
              <img
                src={activeTrack.artworkUrl}
                alt={activeTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            ) : (
              <span className="text-4xl">🪔</span>
            )}
            {isPlaying ? (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex items-end justify-center pb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/30 text-gold-300 text-[11px] font-semibold backdrop-blur-md border border-gold-400/40 animate-pulse font-bengali">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
                  শারদীয় গান চলছে
                </span>
              </div>
            ) : (
              <button
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs group-hover:bg-black/20 transition-all"
                aria-label="Play song"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-[#120909] flex items-center justify-center shadow-xl shadow-gold-950/60 hover:scale-110 active:scale-95 transition-all">
                  <Play size={20} className="ml-1 fill-current" />
                </div>
              </button>
            )}
          </div>

          {/* Track Details */}
          <div className="text-center space-y-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-cream-100 font-cinzel tracking-wide truncate px-2">
              {activeTrack.title}
            </h3>
            <p className="text-xs sm:text-sm text-gold-400/90 truncate">{activeTrack.artist}</p>
          </div>

          {/* Scrubber */}
          <div className="space-y-1 px-2">
            <input
              type="range"
              min={0}
              max={duration || 180}
              step={1}
              value={Math.min(currentTime, duration || 180)}
              onChange={(e) => seek(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #D4AF37 ${
                  duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
                }%, #2A2526 ${
                  duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
                }%)`,
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-gold-400 hover:accent-gold-300 transition-all"
            />
            <div className="flex justify-between text-xs font-mono text-cream-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-5 pt-1">
            <button
              onClick={prevTrack}
              aria-label="Previous Track"
              className="p-2.5 text-cream-300 hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-night-950 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold-950/50"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              aria-label="Next Track"
              className="p-2.5 text-cream-300 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-3 max-w-xs mx-auto text-cream-400 pt-2">
            <Volume2 size={16} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 bg-night-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
          </div>

          {/* Playlist Queue */}
          {playlist.length > 0 && (
            <div className="pt-4 border-t border-gold-500/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-gold-400">
                <div className="flex items-center gap-2">
                  <ListMusic size={14} />
                  <span>{t.musicPlayer.queue} ({filteredPlaylist.length})</span>
                </div>
                <span className="text-[10px] text-cream-400 uppercase tracking-wider font-normal">
                  {modalCategory === 'ALL' ? 'All Festive Songs' : modalCategory}
                </span>
              </div>

              {/* Category Filter Pills in Modal */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {modalCategories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setModalCategory(c.key)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all ${
                      modalCategory === c.key
                        ? 'bg-gold-500 text-night-950 font-bold shadow-sm'
                        : 'bg-white/5 text-cream-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredPlaylist.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(track, filteredPlaylist)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all backdrop-blur-md ${
                      track.id === activeTrack.id
                        ? 'bg-sindoor-600/35 text-gold-300 border border-sindoor-400/40 shadow-sm'
                        : 'bg-white/5 text-cream-300 hover:bg-white/10 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-medium">{track.title}</div>
                      <div className="text-[10px] text-gold-400/80 uppercase font-semibold">
                        {track.category}
                      </div>
                    </div>
                    <span className="text-[10px] text-cream-400 flex-shrink-0 ml-2">
                      {track.artist}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullMusicPlayerModal;
