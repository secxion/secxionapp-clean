import React from 'react';
export default function BrandAccent() {
  return (
    <div className="fixed top-0 left-0 w-full h-2 z-[100] pointer-events-none">
      <div className="w-full h-full animate-brand-shimmer bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-700 opacity-70"></div>
      <style jsx>{`
        @keyframes brand-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .animate-brand-shimmer {
          background-size: 200% 100%;
          animation: brand-shimmer 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
