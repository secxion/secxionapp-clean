import React from 'react';

const Dashboard = () => {
  return (
    <main
      className="min-h-screen premium-bg text-white flex flex-col items-center justify-center px-4 py-10 sm:px-8"
      role="main"
      aria-label="Dashboard Main Content"
    >
      <div className="w-full max-w-md text-center glass-card p-10 rounded-3xl border-white/5 shadow-2xl">
        <h1
          className="text-3xl sm:text-4xl font-black mb-6 neon-gold-text font-spaceGrotesk uppercase tracking-[0.2em]"
          id="dashboard-heading"
        >
          Control Center
        </h1>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent w-full mb-6"></div>
        <p className="mt-2 text-lg sm:text-xl text-gray-400 font-medium tracking-wide">
          Welcome to the Secure Terminal.
        </p>
      </div>
    </main>
  );
};

export default Dashboard;
