import React from 'react';
import CommunityFeed from '../Components/CommunityFeed';
import CreatePostCard from '../Components/CreatePostCard';

const Buzz = () => {
  return (
    <div className="premium-bg relative min-h-screen w-full overflow-hidden pb-20 pt-[var(--total-content-offset)]">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-2 sm:px-4">
        <div className="border-b border-white/10 bg-brand-dark-elevated/40 backdrop-blur-xl">
          <CreatePostCard />
        </div>

        <div className="flex-grow overflow-y-auto">
          <CommunityFeed />
        </div>
      </div>
    </div>
  );
};

export default Buzz;
