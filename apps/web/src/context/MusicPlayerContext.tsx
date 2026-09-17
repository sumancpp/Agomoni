import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'AGOMONI' | 'MAHALAYA' | 'DHAK' | 'PUJA_SONGS' | 'AMBIENT';
  provider: 'ORIGINAL' | 'YOUTUBE_EMBED' | 'SPOTIFY_EMBED';
  sourceUrl?: string;
  embedUrl?: string;
  artworkUrl?: string;
  durationSeconds?: number;
}

interface MusicPlayerContextType {
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMiniPlayerVisible: boolean;
  isFullPlayerOpen: boolean;
  playlist: MusicTrack[];
  playTrack: (track: MusicTrack, playlistContext?: MusicTrack[], openModal?: boolean) => void;
  togglePlay: () => void;
  pause: () => void;
  stopMusic: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  setIsFullPlayerOpen: (open: boolean) => void;
  setIsMiniPlayerVisible: (visible: boolean) => void;
  pauseForEmergency: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Audio URL getter for custom audio tracks
function getSafeAudioUrl(track: MusicTrack): string {
  return track.sourceUrl || '';
}

// Send standard YouTube iframe API postMessage command
export function sendYouTubeCommand(func: string, args?: any) {
  const iframe = document.getElementById('agomoni-youtube-iframe') as HTMLIFrameElement | null;
  if (iframe && iframe.contentWindow) {
    try {
      const payload: any = {
        event: 'command',
        func,
      };
      if (args !== undefined && args !== '') {
        payload.args = Array.isArray(args) ? args : [args];
      }
      iframe.contentWindow.postMessage(JSON.stringify(payload), '*');
    } catch (e) {
      console.warn('YouTube postMessage error', e);
    }
  }
}

// Handshake with YouTube iframe to enable duration and time reporting
export function initYouTubeListening() {
  const iframe = document.getElementById('agomoni-youtube-iframe') as HTMLIFrameElement | null;
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      sendYouTubeCommand('getDuration');
      sendYouTubeCommand('getCurrentTime');
    } catch (e) {
      console.warn('YouTube listening handshake error', e);
    }
  }
}

const DEFAULT_DUGGA_ELO_TRACK: MusicTrack = {
  id: 'default-dugga-elo',
  title: 'Dugga Elo (Official Festive Anthem)',
  artist: 'Monali Thakur & Guddu',
  category: 'PUJA_SONGS',
  provider: 'YOUTUBE_EMBED',
  embedUrl: 'https://www.youtube-nocookie.com/embed/xlElO06nQy8',
  artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  durationSeconds: 151, // Dugga Elo length: 2:31
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(151);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-load all festive tracks on mount so the playlist queue is immediately available
  useEffect(() => {
    fetch('/api/v1/music/playlists')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.playlists) && data.playlists.length > 0) {
          const allTracks: MusicTrack[] = data.playlists.flatMap((p: any) => p.tracks);
          allTracks.sort((a, b) => {
            const aIsDugga = a.title.toLowerCase().includes('dugga elo');
            const bIsDugga = b.title.toLowerCase().includes('dugga elo');
            if (aIsDugga && !bIsDugga) return -1;
            if (!aIsDugga && bIsDugga) return 1;
            return 0;
          });
          setPlaylist(allTracks);
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize state from YouTube iframe events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // 1. YouTube duration and current time infoDelivery updates
        if (data.info) {
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            const realDuration = Math.round(data.info.duration);
            setDuration(realDuration);
            if (activeTrack && (!activeTrack.durationSeconds || activeTrack.durationSeconds !== realDuration)) {
              activeTrack.durationSeconds = realDuration;
            }
          }
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(Math.round(data.info.currentTime));
          }
        }

        // 2. Playback State Changes
        const state =
          data.event === 'onStateChange'
            ? data.info
            : data.info && typeof data.info.playerState === 'number'
            ? data.info.playerState
            : undefined;

        if (state !== undefined) {
          // 1: playing, 2: paused, 0: ended
          if (state === 1) {
            setIsPlaying(true);
            sendYouTubeCommand('getDuration');
            sendYouTubeCommand('getCurrentTime');
          } else if (state === 2) {
            setIsPlaying(false);
          } else if (state === 0) {
            nextTrack();
          }
        }
      } catch {
        // Ignore non-YouTube messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playlist, activeTrack]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    audio.onended = () => {
      nextTrack();
    };

    audio.onerror = () => {
      if (!audio.currentSrc && !audio.src) return;
      if (activeTrack && activeTrack.provider === 'ORIGINAL' && activeTrack.sourceUrl) {
        console.warn('[Agomoni Audio] Source error on track:', activeTrack.title);
      }
    };

    audioRef.current = audio;

    return () => {
      audio.onerror = null;
      audio.onended = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      audio.pause();
      audio.removeAttribute('src');
    };
  }, [activeTrack]);

  // Query YouTube for exact real time & duration every second while playing
  useEffect(() => {
    if (!isPlaying || activeTrack?.provider !== 'YOUTUBE_EMBED') return;

    initYouTubeListening();

    const interval = setInterval(() => {
      sendYouTubeCommand('getCurrentTime');
      sendYouTubeCommand('getDuration');

      setCurrentTime((prev) => {
        const trackDuration = duration || activeTrack.durationSeconds || 0;
        if (trackDuration > 0 && prev >= trackDuration) {
          nextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, duration]);

  const playTrack = (track: MusicTrack, playlistContext?: MusicTrack[], openModal: boolean = false) => {
    setActiveTrack(track);
    setIsMiniPlayerVisible(true);
    setCurrentTime(0);

    // Immediately set duration to this specific track's duration if available
    if (track.durationSeconds && track.durationSeconds > 0) {
      setDuration(track.durationSeconds);
    } else {
      setDuration(0);
    }

    if (playlistContext && playlistContext.length > 0) {
      setPlaylist(playlistContext);
    }

    if (openModal) {
      setIsFullPlayerOpen(true);
    }

    if (track.provider === 'YOUTUBE_EMBED') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(true);
      setTimeout(() => {
        sendYouTubeCommand('playVideo');
      }, 400);
      return;
    }

    if (track.provider === 'ORIGINAL' && track.sourceUrl) {
      if (audioRef.current) {
        audioRef.current.src = track.sourceUrl;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay waiting for user gesture is normal browser behavior
            setIsPlaying(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (!activeTrack) {
      if (playlist.length > 0) {
        const duggaElo = playlist.find((t) => t.title.toLowerCase().includes('dugga elo')) || playlist[0];
        playTrack(duggaElo, playlist, false);
      } else {
        playTrack(DEFAULT_DUGGA_ELO_TRACK, [DEFAULT_DUGGA_ELO_TRACK], false);
      }
      return;
    }
    setIsMiniPlayerVisible(true);

    if (activeTrack.provider === 'YOUTUBE_EMBED') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current && activeTrack.sourceUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== activeTrack.sourceUrl) {
          audioRef.current.src = activeTrack.sourceUrl;
        }
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => {
            console.warn('Audio playback error', e);
            setIsPlaying(false);
          });
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    sendYouTubeCommand('pauseVideo');
    setIsPlaying(false);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    sendYouTubeCommand('stopVideo');
    setIsPlaying(false);
    setIsMiniPlayerVisible(false);
    setIsFullPlayerOpen(false);
  };

  const pauseForEmergency = () => {
    pause();
  };

  const nextTrack = () => {
    if (playlist.length === 0 || !activeTrack) return;
    const currentIndex = playlist.findIndex((t) => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const prevTrack = () => {
    if (playlist.length === 0 || !activeTrack) return;
    const currentIndex = playlist.findIndex((t) => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current && activeTrack?.provider === 'ORIGINAL') {
      audioRef.current.currentTime = seconds;
    } else if (activeTrack?.provider === 'YOUTUBE_EMBED') {
      sendYouTubeCommand('seekTo', [seconds, true]);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    sendYouTubeCommand('setVolume', [Math.round(vol * 100)]);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        activeTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMiniPlayerVisible,
        isFullPlayerOpen,
        playlist,
        playTrack,
        togglePlay,
        pause,
        stopMusic,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        setIsFullPlayerOpen,
        setIsMiniPlayerVisible,
        pauseForEmergency,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
