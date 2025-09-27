import React from "react";


const Dashboard = () => {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex flex-col items-center justify-center px-4 py-10 sm:px-8"
      role="main"
      aria-label="Dashboard Main Content"
    >
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-yellow-300" id="dashboard-heading">
          Dashboard
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-gray-200">Welcome to the Dashboard!</p>
      </div>
    </main>
  );
};

export default Dashboard;
