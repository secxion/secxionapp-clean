import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  User,
  Store,
  Book,
  ClipboardList,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import SummaryApi from '../common';
import HomeFooter from '../Components/HomeFooter';
import NetBlog from '../Components/NetBlog';
import HiRateSlider from '../Components/HiRateSlider';
import LastMarketStatus from '../Components/LastMarketStatus';
import Hero from '../Components/Hero';

const menuItems = [
  {
    label: 'Market',
    path: '/section',
    icon: <Store className="w-8 h-8" />,
    description: 'Explore marketplace',
  },
  {
    label: 'Transaction Record',
    path: '/record',
    icon: <ClipboardList className="w-8 h-8" />,
    description: 'View transaction history',
  },
  {
    label: 'Wallet',
    path: '/mywallet',
    icon: <Wallet className="w-8 h-8" />,
    description: 'Manage your assets',
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <User className="w-8 h-8" />,
    description: 'Account settings',
  },
  {
    label: 'Data Pad',
    path: '/datapad',
    icon: <Book className="w-8 h-8" />,
    description: 'Access your data',
  },
  {
    label: 'Contact Support',
    path: '/report',
    icon: <MessageCircle className="w-8 h-8" />,
    description: 'Get help and support',
  },
];

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  // Removed unused: isLoadingBalance, errorBalance
  const [showBalance, setShowBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);
  // Removed unused: loadingTransactions, errorTransactions, setStatusFilter, setVisibleTransactions, setShowAll
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleNavigation = (path) => navigate(path);

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    try {
      const response = await fetch(SummaryApi.getWalletBalance.url, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    try {
      let url = `${SummaryApi.transactions.url}?userId=${user.id || user._id}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setLastUpdated(null);
    try {
      await Promise.all([fetchWalletBalance(), fetchTransactions()]);
      setLastUpdated(new Date().toLocaleTimeString([], { hour12: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchWalletBalance, fetchTransactions]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchTransactions();
    }
  }, [user, fetchWalletBalance, fetchTransactions]);

  const portfolioValue = walletBalance;
  // Removed unused portfolioGrowth

  const quickStats = [
    {
      label: 'Portfolio Value',
      value: `₦${portfolioValue.toLocaleString()}`,
      // Remove change and positive for Portfolio Value
    },
    {
      label: 'Recent Transactions',
      value: `${transactions.length}`,
      change: `${transactions.length} total`,
      positive: transactions.length > 0,
    },
  ];

  const getStatusColor = (status) =>
    ({
      pending: 'bg-yellow-600/20 text-yellow-400',
      'approved-processing': 'bg-yellow-600/30 text-yellow-300',
      completed: 'bg-green-600/20 text-green-400',
      rejected: 'bg-red-600/20 text-red-400',
    })[status] || 'bg-gray-700 text-gray-300';

  // Show up to 3 transactions by default (no showAll toggle)
  const displayedTransactions = transactions.slice(0, 3);

  return (
    <main
      className="bg-gray-950 min-h-screen w-full pt-28 pb-20 relative overflow-x-hidden"
      role="main"
      aria-label="Home Page Main Content"
    >
      {/* Hero */}
      <Hero />

      {/* Stats */}
      <section
        className="max-w-7xl mx-auto mt-10 mb-8 px-2 sm:px-4"
        aria-labelledby="account-overview-heading"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 sm:gap-6">
          <h2
            id="account-overview-heading"
            className="text-2xl sm:text-3xl font-bold text-yellow-300"
          >
            Account Overview
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-3 sm:p-2 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <Eye className="w-6 h-6 sm:w-5 sm:h-5" aria-hidden="true" />
              ) : (
                <EyeOff className="w-6 h-6 sm:w-5 sm:h-5" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="p-3 sm:p-2 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              aria-label="Refresh account data"
            >
              <RefreshCw
                className={`w-6 h-6 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-xl p-5 sm:p-6 shadow hover:shadow-lg transition min-h-[110px] flex flex-col justify-center"
            >
              <p className="text-gray-400 text-base sm:text-sm mb-1">
                {stat.label}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-1">
                {showBalance ? stat.value : '••••••'}
              </p>
              {stat.change && (
                <p
                  className={`text-base sm:text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}
                >
                  {stat.positive ? (
                    <TrendingUp className="inline w-5 h-5 sm:w-4 sm:h-4" />
                  ) : (
                    <TrendingDown className="inline w-5 h-5 sm:w-4 sm:h-4" />
                  )}{' '}
                  {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            Last updated: {lastUpdated}
          </p>
        )}
      </section>

      {/* High Rate Slider */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-label="High Rate Slider"
      >
        <HiRateSlider />
      </section>

      {/* Last Market Status */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-label="Last Market Status"
      >
        <LastMarketStatus />
      </section>

      {/* Quick Access */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-labelledby="quick-access-heading"
      >
        <h2
          id="quick-access-heading"
          className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-4 sm:mb-6"
        >
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => handleNavigation(item.path)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-5 sm:p-6 hover:border-yellow-400 active:bg-gray-800 transition cursor-pointer text-left min-h-[72px] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label={item.label + ' - ' + item.description}
              tabIndex={0}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="p-3 sm:p-4 rounded-lg bg-gray-800 text-yellow-400 flex items-center justify-center min-w-[44px] min-h-[44px]"
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium text-base sm:text-lg">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-labelledby="recent-transactions-heading"
      >
        <h2
          id="recent-transactions-heading"
          className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-3 sm:mb-4"
        >
          Recent Transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {displayedTransactions.map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-900 border border-gray-700 p-3 sm:p-4 rounded-lg min-h-[56px] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                tabIndex={0}
                aria-label={`Transaction ${txn.type} ${txn._id?.slice(-6)}, amount ${txn.amount}, status ${txn.status}`}
              >
                <div>
                  <p className="text-white font-medium text-base sm:text-lg">
                    {txn.type} #{txn._id?.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'} text-base sm:text-lg`}
                  >
                    {txn.amount > 0 ? '+' : '-'}₦
                    {Math.abs(txn.amount).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}
                    aria-label={`Status: ${txn.status}`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blog */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-label="Blog Section"
      >
        <NetBlog />
      </section>

      {/* Footer */}
      <HomeFooter />
    </main>
  );
};

export default Home;
