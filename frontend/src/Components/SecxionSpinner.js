import React from 'react';
import SecxionLogo from '../app/slogo.png';

const SecxionSpinner = ({ size = 'medium', message = '' }) => {
  const spinnerSize =
    size === 'small'
      ? 'w-8 h-8'
      : size === 'medium'
        ? 'w-12 h-12'
        : 'w-16 h-16';
  const logoSize =
    size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Spinning ring */}
        <div className={`${spinnerSize} relative`}>
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-yellow-400 rounded-full animate-spin"></div>
        </div>

        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={SecxionLogo}
            alt="Secxion"
            className={`${logoSize} object-contain animate-pulse`}
          />
        </div>
      </div>

      {message && (
        <p className="mt-4 text-yellow-400 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default SecxionSpinner;
