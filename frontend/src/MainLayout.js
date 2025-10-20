import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../src/Components/Header';
import Net from '../src/Components/Net';
import SidePanel from '../src/Components/SidePanel';
import { ToastContainer } from 'react-toastify';
import Loader from './Loader';

function MainLayout() {
  return (
    <div className="global-container">
      <Net />
      <main className="main-content">
        {/* Header with all subcomponents */}
        <Suspense fallback={<Loader />}>
          <Header />
        </Suspense>
        {/* Page content via react-router Outlet */}
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <SidePanel /> {/* Mobile menu panel */}
      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName={() =>
          'neon-toast px-7 py-5 text-white flex items-center border border-cyan-400/60 shadow-2xl'
        }
        bodyClassName={() =>
          'text-base font-semibold tracking-wide flex items-center relative z-10'
        }
        progressClassName={() => 'bg-cyan-400/80 h-1 rounded-b-xl'}
        icon={false}
        closeButton={true}
        style={{ zIndex: 9999 }}
        toastContent={({ children }) => (
          <div className="relative">
            <span className="neon-toast-bg-anim" />
            <span className="relative z-10">{children}</span>
          </div>
        )}
      />
    </div>
  );
}

export default MainLayout;
