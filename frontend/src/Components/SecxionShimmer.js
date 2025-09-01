import React from 'react';
import SecxionLogo from "../app/slogo.png";

const SecxionShimmer = ({ type = "card", count = 1 }) => {
  const renderShimmerCard = (index) => (
    <div key={index} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-xl p-6 border border-purple-600/30 shadow-xl">
      {/* Logo header */}
      <div className="flex items-center gap-3 mb-4">
        <img src={SecxionLogo} alt="Secxion" className="w-8 h-8 object-contain opacity-50" />
        <div className="h-4 bg-gradient-to-r from-purple-500/30 to-yellow-400/30 rounded animate-shimmer w-24"></div>
      </div>
      
      {/* Content shimmer */}
      <div className="space-y-3">
        <div className="h-6 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-full"></div>
        <div className="h-4 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-1/2"></div>
      </div>
      
      {/* Bottom shimmer */}
      <div className="mt-6 flex justify-between items-center">
        <div className="h-8 bg-gradient-to-r from-yellow-400/30 to-purple-500/30 rounded animate-shimmer w-20"></div>
        <div className="h-6 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-16"></div>
      </div>
    </div>
  );

  const renderShimmerList = (index) => (
    <div key={index} className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-4 border border-purple-600/20">
      <div className="flex items-center gap-4">
        <img src={SecxionLogo} alt="Secxion" className="w-6 h-6 object-contain opacity-40" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-purple-500/30 to-yellow-400/30 rounded animate-shimmer w-full"></div>
          <div className="h-3 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-2/3"></div>
        </div>
        <div className="h-8 bg-gradient-to-r from-yellow-400/30 to-purple-500/30 rounded animate-shimmer w-16"></div>
      </div>
    </div>
  );

  const renderShimmerGrid = (index) => (
    <div key={index} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-xl overflow-hidden border border-purple-600/30 shadow-lg">
      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-yellow-400/20 animate-shimmer"></div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <img src={SecxionLogo} alt="Secxion" className="w-5 h-5 object-contain opacity-50" />
          <div className="h-4 bg-gradient-to-r from-purple-500/30 to-yellow-400/30 rounded animate-shimmer w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-full"></div>
          <div className="h-3 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded animate-shimmer w-3/4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {type === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }, (_, index) => renderShimmerCard(index))}
        </div>
      )}
      
      {type === "list" && (
        <div className="space-y-4">
          {Array.from({ length: count }, (_, index) => renderShimmerList(index))}
        </div>
      )}
      
      {type === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: count }, (_, index) => renderShimmerGrid(index))}
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SecxionShimmer;
