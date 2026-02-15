// src/components/DarkModeToggle.js
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../Context/DarkModeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        fixed right-0 z-[10000] p-3 rounded-full
        transition duration-300 ease-in-out hover:scale-105
        border-2 top-0 text-sm font-sm
        ${
          darkMode
            ? 'bg-gray-900 border-blue-400 shadow-[0_0_10px_#0ff,0_0_20px_#0ff,0_0_30px_#00f]'
            : 'bg-white border-yellow-300 shadow-[0_0_10px_#ff0,0_0_20px_#ff0,0_0_30px_#ffa500]'
        }
      `}
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        <Sun className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_5px_#ff0]" />
      ) : (
        <Moon className="w-6 h-6 text-blue-600 drop-shadow-[0_0_5px_#0ff]" />
      )}
    </button>
  );
};

export default DarkModeToggle;
