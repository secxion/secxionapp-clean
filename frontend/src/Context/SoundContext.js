import React, { createContext, useContext, useEffect, useState } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load initial state from localStorage, default to true
    const storedValue = localStorage.getItem('soundEnabled');
    return storedValue === null ? true : storedValue === 'true';
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', newValue);
      return newValue;
    });
  };

  // Optional: keep localStorage in sync if value changes elsewhere
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled);
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
