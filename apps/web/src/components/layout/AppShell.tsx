import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PujaCanvas from '../puja-mode/PujaCanvas';
import MiniMusicPlayer from '../music/MiniMusicPlayer';
import FullMusicPlayerModal from '../music/FullMusicPlayerModal';
import SplashScreen from '../common/SplashScreen';
import { PwaManager } from '../pwa/PwaManager';
import { useMusicPlayer, initYouTubeListening } from '../../context/MusicPlayerContext';

export const AppShell: React.FC = () => {
  const { activeTrack, isPlaying } = useMusicPlayer();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className={`min-h-screen flex flex-col bg-transparent text-cream-100 relative selection:bg-sindoor-700 selection:text-white ${isChatPage ? 'h-screen h-[100dvh] overflow-hidden' : ''}`}>
      {/* PWA Lifecycle Manager (Updates and Non-intrusive Install Prompts) */}
      <PwaManager />

      {/* Festive Splash Screen Overlay on Initial Entry */}
      <SplashScreen />

      {/* Immersive Puja Mode particle canvas */}
      <PujaCanvas />

      {/* Global Navbar */}
      <div className="relative z-20 flex-shrink-0" data-global-nav>
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 min-h-0 relative z-10 ${isChatPage ? 'overflow-hidden flex flex-col h-[calc(100vh-4rem)] h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)]' : 'pb-28 md:pb-12 lg:pb-0'}`}>
        <Outlet />
      </main>

      {/* Persistent Global Floating Mini Music Player */}
      <MiniMusicPlayer />

      {/* Expandable Full Music Player Modal */}
      <FullMusicPlayerModal />

      {/* Persistent Background Audio Service for YouTube Embeds (Only mounts when playing) */}
      {activeTrack && isPlaying && activeTrack.provider === 'YOUTUBE_EMBED' && activeTrack.embedUrl && (
        <div
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <iframe
            id="agomoni-youtube-iframe"
            key={activeTrack.id}
            src={
              activeTrack.embedUrl.includes('?')
                ? `${activeTrack.embedUrl}&enablejsapi=1&autoplay=1`
                : `${activeTrack.embedUrl}?enablejsapi=1&autoplay=1`
            }
            title={activeTrack.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              setTimeout(() => {
                initYouTubeListening();
              }, 600);
            }}
          />
        </div>
      )}

      {/* Mobile App Bottom Navigation Bar */}
      {!isChatPage && <BottomNav />}

      {/* Footer */}
      {!isChatPage && (
        <div className="relative z-10" data-global-footer>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default AppShell;
