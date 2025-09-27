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
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default MainLayout;
