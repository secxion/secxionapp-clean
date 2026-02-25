import React, { useEffect, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaBoxOpen, 
  FaNewspaper, 
  FaChartLine, 
  FaEthereum,
  FaFlag,
  FaStore,
  FaComments,
  FaTerminal,
  FaArrowRight,
  FaLock,
  FaCoins
} from 'react-icons/fa';
import summaryApi, { authFetch } from '../common/index.js';

const AdminDashboard = () => {
  // Get department from localStorage for access control
  const department = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('adminDepartment')) || null;
    } catch {
      return null;
    }
  }, []);

  // Check if user is SUPER admin
  const isSuperAdmin = department?.name === 'Super Admin' || !department;

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    blogs: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats for SUPER admin
    if (isSuperAdmin) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch basic counts - these can be expanded based on available APIs
      const [usersRes, productsRes, blogsRes] = await Promise.all([
        authFetch(summaryApi.allUser.url).catch(() => null),
        authFetch(summaryApi.allProduct.url).catch(() => null),
        authFetch(summaryApi.getBlogs.url).catch(() => null)
      ]);

      const users = usersRes ? await usersRes.json().catch(() => []) : [];
      const products = productsRes ? await productsRes.json().catch(() => ({ data: [] })) : { data: [] };
      const blogs = blogsRes ? await blogsRes.json().catch(() => []) : [];

      setStats({
        users: Array.isArray(users) ? users.length : users?.data?.length || 0,
        products: Array.isArray(products) ? products.length : products?.data?.length || 0,
        blogs: Array.isArray(blogs) ? blogs.length : blogs?.blogs?.length || 0,
        reports: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const allQuickLinks = [
    { to: '/all-users', route: 'all-users', label: 'Manage Users', icon: FaUsers, color: 'bg-blue-500' },
    { to: '/all-products', route: 'all-products', label: 'Manage Products', icon: FaBoxOpen, color: 'bg-green-500' },
    { to: '/system-blog', route: 'system-blog', label: 'Blog Management', icon: FaNewspaper, color: 'bg-yellow-500' },
    { to: '/eth-requests', route: 'eth-requests', label: 'ETH Withdrawals', icon: FaEthereum, color: 'bg-purple-500' },
    { to: '/users-market', route: 'users-market', label: 'Users Market', icon: FaStore, color: 'bg-pink-500' },
    { to: '/earnings', route: 'earnings', label: 'Platform Earnings', icon: FaCoins, color: 'bg-green-600' },
    { to: '/admin-report', route: 'admin-report', label: 'Reports', icon: FaFlag, color: 'bg-red-500' },
    { to: '/community-feeds', route: 'community-feeds', label: 'Community', icon: FaComments, color: 'bg-indigo-500' },
    { to: '/livescript', route: 'livescript', label: 'Live Script', icon: FaTerminal, color: 'bg-cyan-500' },
  ];

  // Filter quick links based on department permissions
  const quickLinks = useMemo(() => {
    if (!department?.allowedRoutes) return allQuickLinks;
    return allQuickLinks.filter(link => department.allowedRoutes.includes(link.route));
  }, [department]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-gray-400 text-xs sm:text-sm truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
        <div className={`${color} p-3 sm:p-4 rounded-xl shrink-0`}>
          <Icon className="text-xl sm:text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Stats Grid - SUPER ADMIN ONLY */}
      {isSuperAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total Users" value={stats.users} icon={FaUsers} color="bg-blue-500" />
          <StatCard title="Products" value={stats.products} icon={FaBoxOpen} color="bg-green-500" />
          <StatCard title="Blog Posts" value={stats.blogs} icon={FaNewspaper} color="bg-yellow-500" />
          <StatCard title="Reports" value={stats.reports} icon={FaFlag} color="bg-red-500" />
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-yellow-500 transition-all hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98]"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                <div className={`${link.color} p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <link.icon className="text-lg sm:text-xl text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">{link.label}</p>
                </div>
                <FaArrowRight className="hidden sm:block text-gray-500 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status - SUPER ADMIN ONLY */}
      {isSuperAdmin && (
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">System Status</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span>Backend API: Connected</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
              <span>Database: Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Department Info for non-SUPER admins */}
      {!isSuperAdmin && (
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
              <FaLock className="text-yellow-500 text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-white truncate">{department?.name}</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Department Access</p>
            </div>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm">
            You have access to your department's section only. Use the Quick Actions above or sidebar to navigate.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
