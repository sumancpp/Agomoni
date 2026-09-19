import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { ALL_CURATED_TRACKS } from '../data/curatedPlaylists';

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
  const [duration, setDuration] = useState<number>(150);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<MusicTrack[]>(ALL_CURATED_TRACKS as MusicTrack[]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrackRef = useRef<MusicTrack | null>(activeTrack);
  const playlistRef = useRef<MusicTrack[]>(playlist);
  const currentTimeRef = useRef<number>(currentTime);
  const durationRef = useRef<number>(duration);
  const isPlayingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Pre-load and merge all festive tracks on mount so the playlist queue is immediately available
  useEffect(() => {
    apiFetch('/api/v1/music/playlists')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.playlists) && data.playlists.length > 0) {
          const apiTracks: MusicTrack[] = data.playlists.flatMap((p: any) => p.tracks);
          const trackMap = new Map<string, MusicTrack>();

          // Pre-populate with all 111 curated tracks
          (ALL_CURATED_TRACKS as MusicTrack[]).forEach((t) => {
            const key = t.embedUrl || t.title.toLowerCase().trim();
            trackMap.set(key, t);
          });

          // Overlay remote API tracks
          apiTracks.forEach((t: MusicTrack) => {
            const key = t.embedUrl || t.title.toLowerCase().trim();
            trackMap.set(key, { ...trackMap.get(key), ...t });
          });

          const mergedTracks = Array.from(trackMap.values());
          mergedTracks.sort((a, b) => {
            const aIsDugga = a.title.toLowerCase().includes('dugga elo');
            const bIsDugga = b.title.toLowerCase().includes('dugga elo');
            if (aIsDugga && !bIsDugga) return -1;
            if (!aIsDugga && bIsDugga) return 1;
            return 0;
          });
          setPlaylist(mergedTracks);
          playlistRef.current = mergedTracks;
        }
      })
      .catch(() => {});
  }, []);

  const handleNextTrack = () => {
    const currentList = playlistRef.current;
    const currentTrack = activeTrackRef.current;
    if (currentList.length === 0 || !currentTrack) return;
    const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % currentList.length;
    playTrack(currentList[nextIndex], currentList);
  };

  const handlePrevTrack = () => {
    const currentList = playlistRef.current;
    const currentTrack = activeTrackRef.current;
    if (currentList.length === 0 || !currentTrack) return;
    const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    playTrack(currentList[prevIndex], currentList);
  };

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
            durationRef.current = realDuration;
            if (activeTrackRef.current && (!activeTrackRef.current.durationSeconds || activeTrackRef.current.durationSeconds !== realDuration)) {
              activeTrackRef.current.durationSeconds = realDuration;
            }
          }
          if (typeof data.info.currentTime === 'number') {
            const realSec = Math.floor(data.info.currentTime);
            setCurrentTime(realSec);
            currentTimeRef.current = realSec;
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
            isPlayingRef.current = true;
            sendYouTubeCommand('getDuration');
            sendYouTubeCommand('getCurrentTime');
          } else if (state === 2) {
            setIsPlaying(false);
            isPlayingRef.current = false;
          } else if (state === 0) {
            // Track naturally completed on YouTube
            handleNextTrack();
          }
        }
      } catch {
        // Ignore non-YouTube messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;

    audio.ontimeupdate = () => {
      const sec = Math.floor(audio.currentTime);
      setCurrentTime(sec);
      currentTimeRef.current = sec;
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const dur = Math.round(audio.duration);
        setDuration(dur);
        durationRef.current = dur;
      }
    };

    audio.onended = () => {
      handleNextTrack();
    };

    audio.onerror = () => {
      if (!audio.currentSrc && !audio.src) return;
      if (activeTrackRef.current && activeTrackRef.current.provider === 'ORIGINAL' && activeTrackRef.current.sourceUrl) {
        console.warn('[Agomoni Audio] Source error on track:', activeTrackRef.current.title);
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
  }, [activeTrack?.id]);

  // Query YouTube for exact real time & duration every second while playing
  useEffect(() => {
    if (!isPlaying || activeTrack?.provider !== 'YOUTUBE_EMBED') return;

    initYouTubeListening();

    const interval = setInterval(() => {
      sendYouTubeCommand('getCurrentTime');
      sendYouTubeCommand('getDuration');

      // Progress forward smoothly between YouTube sync events,
      // but cap at duration so the progress bar never runs past the track end!
      setCurrentTime((prev) => {
        const trackDuration = durationRef.current || activeTrackRef.current?.durationSeconds || 0;
        const nextTime = prev + 1;
        // NEVER artificially skip tracks here — track transitions are handled strictly by YouTube's onStateChange (state === 0)
        if (trackDuration > 0 && nextTime >= trackDuration) {
          return trackDuration;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, activeTrack?.id]);

  const playTrack = (track: MusicTrack, playlistContext?: MusicTrack[], openModal: boolean = false) => {
    // If clicking the track that is already active
    if (activeTrackRef.current && activeTrackRef.current.id === track.id) {
      if (!isPlayingRef.current) {
        togglePlay();
      }
      if (openModal) {
        setIsFullPlayerOpen(true);
      }
      return;
    }

    setActiveTrack(track);
    activeTrackRef.current = track;
    setIsMiniPlayerVisible(true);
    setCurrentTime(0);
    currentTimeRef.current = 0;

    const trackDur = track.durationSeconds && track.durationSeconds > 0 ? track.durationSeconds : 180;
    setDuration(trackDur);
    durationRef.current = trackDur;

    if (playlistContext && playlistContext.length > 0) {
      setPlaylist(playlistContext);
      playlistRef.current = playlistContext;
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
      isPlayingRef.current = true;
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
            isPlayingRef.current = true;
          })
          .catch(() => {
            setIsPlaying(false);
            isPlayingRef.current = false;
          });
      }
    }
  };

  const togglePlay = () => {
    const currentTrack = activeTrackRef.current;
    if (!currentTrack) {
      const list = playlistRef.current;
      if (list.length > 0) {
        const duggaElo = list.find((t) => t.title.toLowerCase().includes('dugga elo')) || list[0];
        playTrack(duggaElo, list, false);
      } else {
        playTrack(DEFAULT_DUGGA_ELO_TRACK, [DEFAULT_DUGGA_ELO_TRACK], false);
      }
      return;
    }
    setIsMiniPlayerVisible(true);

    if (currentTrack.provider === 'YOUTUBE_EMBED') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (isPlayingRef.current) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        sendYouTubeCommand('playVideo');
        if (currentTimeRef.current > 0) {
          sendYouTubeCommand('seekTo', [currentTimeRef.current, true]);
        }
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
      return;
    }

    if (audioRef.current && currentTrack.sourceUrl) {
      if (isPlayingRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        if (audioRef.current.src !== currentTrack.sourceUrl) {
          audioRef.current.src = currentTrack.sourceUrl;
        }
        if (currentTimeRef.current > 0) {
          audioRef.current.currentTime = currentTimeRef.current;
        }
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
          })
          .catch((e) => {
            console.warn('Audio playback error', e);
            setIsPlaying(false);
            isPlayingRef.current = false;
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
    isPlayingRef.current = false;
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    sendYouTubeCommand('stopVideo');
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setActiveTrack(null);
    activeTrackRef.current = null;
    setIsMiniPlayerVisible(false);
    setIsFullPlayerOpen(false);
  };

  const pauseForEmergency = () => {
    pause();
  };

  const nextTrack = () => {
    handleNextTrack();
  };

  const prevTrack = () => {
    handlePrevTrack();
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    currentTimeRef.current = seconds;
    if (audioRef.current && activeTrackRef.current?.provider === 'ORIGINAL') {
      audioRef.current.currentTime = seconds;
    } else if (activeTrackRef.current?.provider === 'YOUTUBE_EMBED') {
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
