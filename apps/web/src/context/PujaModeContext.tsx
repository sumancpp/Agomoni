import React, { createContext, useContext, useState, useEffect } from 'react';

interface PujaModeContextType {
  isPujaMode: boolean;
  togglePujaMode: () => void;
  enterPujaMode: () => void;
  exitPujaMode: () => void;
}

const PujaModeContext = createContext<PujaModeContextType | undefined>(undefined);

export const PujaModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPujaMode, setIsPujaMode] = useState<boolean>(() => {
    return localStorage.getItem('agomoni_puja_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('agomoni_puja_mode', String(isPujaMode));
    if (isPujaMode) {
      document.documentElement.classList.add('puja-mode-active');
    } else {
      document.documentElement.classList.remove('puja-mode-active');
    }
  }, [isPujaMode]);

  const togglePujaMode = () => setIsPujaMode((prev) => !prev);
  const enterPujaMode = () => setIsPujaMode(true);
  const exitPujaMode = () => setIsPujaMode(false);

  return (
    <PujaModeContext.Provider value={{ isPujaMode, togglePujaMode, enterPujaMode, exitPujaMode }}>
      {children}
    </PujaModeContext.Provider>
  );
};

export const usePujaMode = () => {
  const context = useContext(PujaModeContext);
  if (!context) {
    throw new Error('usePujaMode must be used within a PujaModeProvider');
  }
  return context;
};
