import React from 'react';
import SecxionLogo from '../Assets/optimized/secxion-logo-112.png';

const SecxionLoader = ({ size = 'medium', message = '' }) => {
  const logoSize =
    size === 'small'
      ? 'w-12 h-12'
      : size === 'medium'
        ? 'w-16 h-16'
        : 'w-20 h-20';
  const containerHeight =
    size === 'small'
      ? 'min-h-[200px]'
      : size === 'medium'
        ? 'min-h-[300px]'
        : 'min-h-screen';

  return (
    <div
      className={`${containerHeight} premium-bg flex flex-col items-center justify-center px-4`}
    >
      <div className="relative">
        {/* Logo container with subtle glow */}
        <div className="relative mb-12">
          <img
            src={SecxionLogo}
            alt="Secxion Logo"
            className={`${logoSize} object-contain relative z-10 animate-pulse shadow-brand-gold`}
          />
        </div>

        {/* Loading message */}
        <p className="text-brand-gold text-xs font-black uppercase tracking-[0.4em] text-center mb-10 animate-pulse font-spaceGrotesk">
          {message || 'System Initializing'}
        </p>

        {/* Gradient progress bar */}
        <div className="w-64 max-w-xs mx-auto">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-brand-gold to-transparent rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute -top-12 -left-12 w-4 h-4 bg-brand-gold/10 rounded-full animate-float-1 blur-sm"></div>
        <div className="absolute -top-6 -right-10 w-3 h-3 bg-white/5 rounded-full animate-float-2 blur-xs"></div>
        <div className="absolute -bottom-10 -left-8 w-2 h-2 bg-brand-gold/20 rounded-full animate-float-3"></div>
      </div>

      <style>
        {`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            transform: translateX(100%);
            background-position: 0% 50%;
          }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-15px) rotate(-180deg); opacity: 1; }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-10px) rotate(90deg); opacity: 1; }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-25px) rotate(-90deg); opacity: 1; }
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
          background-size: 200% 200%;
        }
        
        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 2.5s ease-in-out infinite 0.5s;
        }
        
        .animate-float-3 {
          animation: float-3 3.5s ease-in-out infinite 1s;
        }
        
        .animate-float-4 {
          animation: float-4 2.8s ease-in-out infinite 1.5s;
        }
      `}
      </style>
    </div>
  );
};

export default SecxionLoader;
