import React from 'react';

export default function NFTBadge() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/icons/sexion%20pixx.png"
        alt="Secxion NFT"
        className="w-8 h-8 rounded-full border-2 border-yellow-400 animate-pulse"
      />
      <span className="text-yellow-400 font-bold text-xs">Genesis NFT</span>
    </div>
  );
}
