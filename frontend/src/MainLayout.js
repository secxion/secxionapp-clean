import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../src/Components/Header';
import Net from '../src/Components/Net';
import SidePanel from '../src/Components/SidePanel';
import GlobalToastContainer from './Components/GlobalToastContainer';
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
      {/* Global Toast Container - Single instance for entire app */}
      <GlobalToastContainer />
    </div>
  );
}

export default MainLayout;
