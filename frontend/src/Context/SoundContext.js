import React, { createContext, useContext, useEffect, useState } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load initial state from localStorage, default to true
    const storedValue = localStorage.getItem('soundEnabled');
    return storedValue === null ? true : storedValue === 'true';
  });

  const [volume, setVolume] = useState(() => {
    // Load initial volume from localStorage, default to 0.7
    const storedValue = localStorage.getItem('soundVolume');
    return storedValue === null ? 0.7 : parseFloat(storedValue);
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', newValue);
      return newValue;
    });
  };

  const updateVolume = (newVolume) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    localStorage.setItem('soundVolume', clampedVolume);
  };

  // Optional: keep localStorage in sync if value changes elsewhere
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundVolume', volume);
  }, [volume]);

  const value = {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    volume,
    setVolume: updateVolume, // Export as setVolume for compatibility
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
