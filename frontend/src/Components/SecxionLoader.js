import React from 'react';
import SecxionLogo from "../app/slogo.png";

const SecxionLoader = ({ size = "medium", message = "" }) => {
  const logoSize = size === "small" ? "w-12 h-12" : size === "medium" ? "w-16 h-16" : "w-20 h-20";
  const containerHeight = size === "small" ? "min-h-[200px]" : size === "medium" ? "min-h-[300px]" : "min-h-screen";

  return (
    <div className={`${containerHeight} bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center justify-center px-4`}>
      <div className="relative">
        {/* Logo container with subtle glow */}
        <div className="relative mb-8">
          <img
            src={SecxionLogo}
            alt="Secxion Logo"
            className={`${logoSize} object-contain relative z-10 animate-pulse`}
          />
        </div>

        {/* Loading message */}
        <p className="text-yellow-400 text-lg font-semibold text-center mb-8 animate-pulse">
          {message}
        </p>

        {/* Gradient progress bar */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-purple-500 via-yellow-400 to-purple-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute -top-10 -left-10 w-4 h-4 bg-yellow-400/30 rounded-full animate-float-1"></div>
        <div className="absolute -top-5 -right-8 w-3 h-3 bg-purple-500/30 rounded-full animate-float-2"></div>
        <div className="absolute -bottom-8 -left-6 w-2 h-2 bg-yellow-400/40 rounded-full animate-float-3"></div>
        <div className="absolute -bottom-5 -right-10 w-5 h-5 bg-purple-500/20 rounded-full animate-float-4"></div>
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
