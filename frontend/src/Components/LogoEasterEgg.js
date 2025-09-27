import React, { useState } from 'react';
import SecxionLogo from '../app/slogo.png';
export default function LogoEasterEgg() {
  const [count, setCount] = useState(0);
  const [showEgg, setShowEgg] = useState(false);
  const handleClick = () => {
    setCount((c) => {
      if (c + 1 >= 5) {
        setShowEgg(true);
        setTimeout(() => setShowEgg(false), 3000);
        return 0;
      }
      return c + 1;
    });
  };
  return (
    <div className="relative">
      <img
        src={SecxionLogo}
        alt="Secxion Logo"
        className="w-14 h-14 cursor-pointer"
        onClick={handleClick}
      />
      {showEgg && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 px-4 py-2 bg-yellow-700 text-white rounded-xl shadow-lg animate-bounce z-50">
          🎉 Secxion Secret Unlocked!
        </div>
      )}
    </div>
  );
}
