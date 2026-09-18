import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { PujaModeProvider } from './context/PujaModeContext';

import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import PujaDatePage from './pages/PujaDatePage';
import ChatPage from './pages/ChatPage';
import LostFoundPage from './pages/LostFoundPage';
import MemoryPage from './pages/MemoryPage';
import SharedMemoryPage from './pages/SharedMemoryPage';
import EmergencyPage from './pages/EmergencyPage';
import MusicPage from './pages/MusicPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import LegalPage from './pages/LegalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <MusicPlayerProvider>
              <PujaModeProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/puja-date" element={<PujaDatePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:conversationId" element={<ChatPage />} />
                    <Route path="/lost-found" element={<LostFoundPage />} />
                    <Route path="/memories" element={<MemoryPage />} />
                    <Route path="/memory/shared/:token" element={<SharedMemoryPage />} />
                    <Route path="/memories/shared/:token" element={<SharedMemoryPage />} />
                    <Route path="/emergency" element={<EmergencyPage />} />
                    <Route path="/songs" element={<MusicPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </PujaModeProvider>
          </MusicPlayerProvider>
        </SocketProvider>
      </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
