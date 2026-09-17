import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Maximize2, X, ListMusic, ChevronUp, Music } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useLanguage } from '../../context/LanguageContext';

export const MiniMusicPlayer: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    currentTime,
    duration,
    isMiniPlayerVisible,
    playlist,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    stopMusic,
    setIsFullPlayerOpen,
  } = useMusicPlayer();
  const { lang } = useLanguage();

  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPlaylistOpen(false);
      }
    };
    if (isPlaylistOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlaylistOpen]);

  if (!isMiniPlayerVisible || !activeTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[400px] md:w-[440px] z-40 animate-fade-in mini-music-player"
    >
      {/* Floating Quick Playlist Popover Drawer */}
      {isPlaylistOpen && (
        <div className="mb-2 bg-[#180C0C]/98 backdrop-blur-2xl border border-gold-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.9)] space-y-3 animate-fade-in border-b-0 max-h-80 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gold-500/20 pb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ListMusic size={16} className="text-gold-400" />
              <h4 className="text-xs font-bold text-[#FFF8EC] font-cinzel">
                {lang === 'bn' ? 'শারদীয় সঙ্গীতালয়' : 'Festive Playlist Queue'}
              </h4>
              {playlist.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gold-500/20 text-gold-300 font-semibold border border-gold-500/30">
                  {playlist.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/songs"
                onClick={() => setIsPlaylistOpen(false)}
                className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 hover:underline font-bengali"
              >
                <span>{lang === 'bn' ? 'সকল গান' : 'All Songs'}</span>
                <span>➔</span>
              </Link>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-1 rounded-lg text-cream-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Playlist"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable Track Queue */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {playlist.length === 0 ? (
              <div className="py-4 text-center text-xs text-cream-400">
                <Music size={20} className="mx-auto mb-1 text-gold-500/60" />
                <p>{lang === 'bn' ? 'গান লোড হচ্ছে...' : 'Loading playlist...'}</p>
              </div>
            ) : (
              playlist.map((track) => {
                const isSelected = track.id === activeTrack.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      playTrack(track, playlist);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all text-xs border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4A1010] to-[#2A0B0B] border-gold-400 text-gold-300 shadow-md'
                        : 'bg-[#240F0F]/60 border-gold-500/10 text-cream-200 hover:bg-[#331414] hover:text-white'
                    }`}
                  >
                    {/* Artwork / Icon */}
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#180C0C] border border-gold-500/30 flex-shrink-0 flex items-center justify-center">
                      {track.artworkUrl ? (
                        <img
                          src={track.artworkUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">🎵</span>
                      )}
                      {isSelected && isPlaying && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[11px] sm:text-xs font-bengali">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-cream-400 truncate font-bengali">
                        {track.artist}
                      </p>
                    </div>

                    {/* Playing indicator */}
                    {isSelected && (
                      <span className="text-[10px] font-bold text-gold-400 flex items-center gap-1 flex-shrink-0 font-bengali">
                        <span className="inline-block w-1.5 h-3 bg-gold-400 animate-pulse rounded-full" />
                        <span>চলছে</span>
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Footer Action inside Popover */}
          <div className="pt-2 border-t border-gold-500/20 flex-shrink-0">
            <Link
              to="/songs"
              onClick={() => setIsPlaylistOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sindoor-600 to-gold-600 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-98 transition-all font-bengali"
            >
              <Music size={14} />
              <span>{lang === 'bn' ? 'সঙ্গীতালয়ে সকল গান শুনুন' : 'Explore All Songs & Library'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Mini Player Bar */}
      <div className="bg-[#180C0C]/95 backdrop-blur-2xl border border-gold-500/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_36px_0_rgba(0,0,0,0.85)] flex flex-col gap-1.5">
        {/* Progress bar */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sindoor-600 to-gold-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Track info & artwork (Tap to open full modal) */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 overflow-hidden cursor-pointer flex-1 min-w-0"
            onClick={() => setIsFullPlayerOpen(true)}
            title="Open Full Player"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-night-800 border border-gold-500/30 flex-shrink-0 shadow-sm">
              {activeTrack.artworkUrl ? (
                <img
                  src={activeTrack.artworkUrl}
                  alt={activeTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-500 text-sm">
                  🎵
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-sindoor-950/40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
                </div>
              )}
            </div>

            <div className="truncate min-w-0 flex-1">
              <h4 className="text-xs sm:text-[13px] font-semibold text-cream-100 truncate flex items-center gap-1">
                <span className="text-xs text-gold-400 flex-shrink-0">🎵</span>
                <span className="truncate">{activeTrack.title}</span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-cream-400 truncate">{activeTrack.artist}</p>
            </div>
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Prev Track */}
            <button
              onClick={prevTrack}
              aria-label="Previous Track"
              title="Previous"
              className="p-1 sm:p-1.5 text-cream-300 hover:text-white transition-colors"
            >
              <SkipBack size={15} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 text-night-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-950/40"
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              aria-label="Next Track"
              title="Next"
              className="p-1 sm:p-1.5 text-cream-300 hover:text-white transition-colors"
            >
              <SkipForward size={15} />
            </button>

            {/* Dedicated Playlist / All Songs Button */}
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              aria-label="Toggle Playlist & All Songs"
              title="Playlist & All Songs (প্লেলিস্ট ও সকল গান)"
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                isPlaylistOpen
                  ? 'bg-gold-500 text-night-950 border-gold-400 shadow-md font-bold'
                  : 'bg-gold-500/15 hover:bg-gold-500/25 border-gold-500/35 text-gold-300 hover:text-gold-200'
              }`}
            >
              <ListMusic size={15} className={isPlaylistOpen ? 'text-night-950' : 'text-gold-400'} />
              <span className="text-[11px] hidden xs:inline">
                {lang === 'bn' ? 'গান' : 'Playlist'}
              </span>
              <ChevronUp
                size={12}
                className={`transition-transform duration-200 ${isPlaylistOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expand to Full Player Modal */}
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              aria-label="Expand Player"
              title="Expand Player (পূর্ণ প্লেয়ার)"
              className="p-1 sm:p-1.5 text-cream-400 hover:text-gold-400 transition-colors hidden sm:inline-block"
            >
              <Maximize2 size={15} />
            </button>

            {/* Stop / Close Mini Player */}
            <button
              onClick={stopMusic}
              aria-label="Close Player"
              title="Close"
              className="p-1 sm:p-1.5 text-cream-400 hover:text-red-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMusicPlayer;
