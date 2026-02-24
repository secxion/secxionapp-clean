import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProvider } from './Context/index.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// Pages
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import BlogManagement from './pages/BlogManagement.jsx';
import AllUsers from './pages/AllUsers.jsx';
import AllProducts from './pages/AllProducts.jsx';
import AdminRPR from './pages/AdminRPR.jsx';
import AdminEthWithdrawals from './pages/AdminEthWithdrawals.jsx';
import AdminGetAllData from './pages/AdminGetAllData.jsx';
import AdminAnonymousReports from './pages/AdminAnonymousReports.jsx';
import AdminReports from './pages/AdminReports.jsx';
import AdminCommunity from './pages/AdminCommunity.jsx';
import AdminLiveScript from './pages/AdminLiveScript.jsx';
import UsersMarket from './pages/UsersMarket.jsx';
import './index.css';


const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ContextProvider>
        <BrowserRouter>
        <Routes>
          {/* Login Page - No sidebar/layout */}
          <Route path="/" element={<AdminLogin />} />
          
          {/* Admin Panel with sidebar layout */}
          <Route element={<AdminPanel />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="all-users" element={<AllUsers />} />
            <Route path="all-products" element={<AllProducts />} />
            <Route path="admin-rpr" element={<AdminRPR />} />
            <Route path="eth-requests" element={<AdminEthWithdrawals />} />
            <Route path="users-market" element={<UsersMarket />} />
            <Route path="users-datapad" element={<AdminGetAllData />} />
            <Route path="system-blog" element={<BlogManagement />} />
            <Route path="admin-report" element={<AdminReports />} />
            <Route path="anonymous-report" element={<AdminAnonymousReports />} />
            <Route path="community-feeds" element={<AdminCommunity />} />
            <Route path="livescript" element={<AdminLiveScript />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          <ToastContainer position="top-right" theme="dark" />
        </BrowserRouter>
      </ContextProvider>
    </Provider>
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
