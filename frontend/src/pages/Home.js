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
import LastMarketStatus from '../Components/LastMarketStatus';
import Hero from '../Components/Hero';
import {
  getCachedTransactionHistory,
  setCachedTransactionHistory,
  getCachedWalletBalance,
  setCachedWalletBalance,
} from '../utils/walletCache';
import { TRANSACTION_ACTIVITY_EVENT } from '../utils/transactionEvents';

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

const LAST_MARKET_ACTIVITY_STORAGE_KEY = 'home:last-market-activity:visibility';

const getLastMarketActivityPreference = (userId) => {
  if (!userId) return null;

  try {
    const raw = localStorage.getItem(
      `${LAST_MARKET_ACTIVITY_STORAGE_KEY}:${userId}`,
    );

    if (raw === 'hidden') return false;
    if (raw === 'visible') return true;
  } catch (err) {
    console.warn('Unable to read Last Market Activity preference:', err);
  }

  return null;
};

const saveLastMarketActivityPreference = (userId, isVisible) => {
  if (!userId) return;

  try {
    localStorage.setItem(
      `${LAST_MARKET_ACTIVITY_STORAGE_KEY}:${userId}`,
      isVisible ? 'visible' : 'hidden',
    );
  } catch (err) {
    console.warn('Unable to save Last Market Activity preference:', err);
  }
};

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  // Removed unused: isLoadingBalance, errorBalance
  const [showBalance, setShowBalance] = useState(false);
  const [showLastMarketActivity, setShowLastMarketActivity] = useState(true);
  const [transactions, setTransactions] = useState([]);
  // Removed unused: loadingTransactions, errorTransactions, setStatusFilter, setVisibleTransactions, setShowAll
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const userId = user?.id || user?._id;

  const handleNavigation = (path) => navigate(path);

  const fetchWalletBalance = useCallback(
    async ({ force = false } = {}) => {
      if (!userId) return;

      if (!force) {
        const cachedBalance = getCachedWalletBalance(userId);
        if (typeof cachedBalance === 'number') {
          setWalletBalance(cachedBalance);
          return;
        }
      }

      try {
        const response = await fetch(SummaryApi.getWalletBalance.url, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          const nextBalance = data.balance || 0;
          setWalletBalance(nextBalance);
          setCachedWalletBalance(userId, nextBalance);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [userId],
  );

  const fetchTransactions = useCallback(
    async ({ force = false } = {}) => {
      if (!userId) return;

      if (!force) {
        const cachedTransactions = getCachedTransactionHistory(userId);
        if (Array.isArray(cachedTransactions)) {
          setTransactions(cachedTransactions);
          return;
        }
      }

      try {
        let url = `${SummaryApi.transactions.url}?userId=${userId}`;
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
          setCachedTransactionHistory(userId, data.transactions);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [userId],
  );

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setLastUpdated(null);
    try {
      await Promise.all([
        fetchWalletBalance({ force: true }),
        fetchTransactions({ force: true }),
      ]);
      setLastUpdated(new Date().toLocaleTimeString([], { hour12: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchWalletBalance, fetchTransactions]);

  useEffect(() => {
    if (userId) {
      fetchWalletBalance();
      fetchTransactions();
    }
  }, [userId, fetchWalletBalance, fetchTransactions]);

  useEffect(() => {
    if (!userId) return;

    const onTransactionActivity = async () => {
      try {
        await Promise.all([
          fetchWalletBalance({ force: true }),
          fetchTransactions({ force: true }),
        ]);
        setLastUpdated(new Date().toLocaleTimeString([], { hour12: false }));
      } catch (err) {
        console.error('Failed to sync Home after transaction activity:', err);
      }
    };

    window.addEventListener(TRANSACTION_ACTIVITY_EVENT, onTransactionActivity);
    return () => {
      window.removeEventListener(
        TRANSACTION_ACTIVITY_EVENT,
        onTransactionActivity,
      );
    };
  }, [userId, fetchWalletBalance, fetchTransactions]);

  useEffect(() => {
    const savedPreference = getLastMarketActivityPreference(userId);
    if (savedPreference !== null) {
      setShowLastMarketActivity(savedPreference);
      return;
    }

    setShowLastMarketActivity(true);
  }, [userId]);

  const handleLastMarketActivityToggle = () => {
    setShowLastMarketActivity((prev) => {
      const next = !prev;
      saveLastMarketActivityPreference(userId, next);
      return next;
    });
  };

  const portfolioValue = walletBalance;
  // Removed unused portfolioGrowth

  // Filter transactions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTransactions = transactions.filter((t) => {
    const txDate = new Date(t.createdAt || t.date);
    return txDate >= sevenDaysAgo;
  });

  const quickStats = [
    {
      label: 'Portfolio Value',
      value: `₦${portfolioValue.toLocaleString()}`,
      // Remove change and positive for Portfolio Value
    },
    {
      label: 'Recent Transactions',
      value: `${recentTransactions.length}`,
      change: 'last 7 days',
      positive: recentTransactions.length > 0,
    },
  ];

  const getStatusColor = (status) =>
    ({
      pending: 'border-brand-gold/20 bg-brand-gold/5 text-brand-gold',
      'approved-processing': 'border-sky-500/20 bg-sky-500/5 text-sky-400',
      completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
      rejected: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
    })[status] || 'border-white/10 bg-white/5 text-gray-500';

  // Show up to 3 transactions by default (no showAll toggle)
  const displayedTransactions = transactions.slice(0, 3);

  return (
    <main
      className="premium-bg relative min-h-screen w-full overflow-x-hidden pb-16 pt-[var(--total-content-offset)]"
      role="main"
      aria-label="Home Page Main Content"
    >
      {/* Hero */}
      <Hero className="" />

      {/* Stats */}
      <section
        className="max-w-7xl mx-auto mt-10 mb-8 px-2 sm:px-4"
        aria-labelledby="account-overview-heading"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 sm:gap-6">
          <h2
            id="account-overview-heading"
            className="text-2xl sm:text-3xl font-black font-spaceGrotesk text-white uppercase tracking-tighter"
          >
            Account Overview
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-brand-gold transition-all duration-300"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <Eye className="w-5 h-5" aria-hidden="true" />
              ) : (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-brand-gold transition-all duration-300 disabled:opacity-30"
              aria-label="Refresh account data"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.04] hover:border-brand-gold/20"
            >
              <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                {stat.label}
              </p>
              <p className="text-4xl sm:text-5xl font-black font-spaceGrotesk text-white tracking-tighter mb-1">
                {showBalance ? stat.value : '••••••••'}
              </p>
              {stat.change && (
                <div
                  className={`mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {stat.positive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}{' '}
                  <span>{stat.change}</span>
                </div>
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

      {/* Last Market Status */}
      <section
        className="max-w-7xl mx-auto mb-8 px-2 sm:px-4"
        aria-label="Last Market Status"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black font-spaceGrotesk text-white uppercase tracking-tight">
            Last Market Activity
          </h2>
          <button
            type="button"
            onClick={handleLastMarketActivityToggle}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/10 hover:text-white"
            aria-expanded={showLastMarketActivity}
            aria-controls="last-market-activity-content"
            aria-label={
              showLastMarketActivity
                ? 'Hide last market activity'
                : 'Show last market activity'
            }
          >
            {showLastMarketActivity ? 'Hide' : 'Open'}
          </button>
        </div>

        <div id="last-market-activity-content">
          {showLastMarketActivity ? (
            <LastMarketStatus />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Last Market Activity is hidden.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Access */}
      <section
        className="max-w-7xl mx-auto mb-12 px-2 sm:px-4"
        aria-labelledby="quick-access-heading"
      >
        <h2
          id="quick-access-heading"
          className="text-xl sm:text-2xl font-black font-spaceGrotesk text-white uppercase tracking-tight mb-8"
        >
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation(item.path)}
              className="bg-white/5 border border-white/5 rounded-3xl p-8 text-left flex items-center gap-6 transition-all duration-300 hover:bg-white/10 hover:border-brand-gold/30 group"
              aria-label={item.label + ' - ' + item.description}
            >
              <div
                className="p-4 rounded-2xl bg-brand-gold/5 text-brand-gold border border-brand-gold/10 group-hover:bg-brand-gold group-hover:text-brand-dark-base transition-all duration-300"
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-white font-black text-lg font-spaceGrotesk uppercase tracking-tight">
                  {item.label}
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section
        className="max-w-7xl mx-auto mb-12 px-2 sm:px-4"
        aria-labelledby="recent-transactions-heading"
      >
        <h2
          id="recent-transactions-heading"
          className="text-xl sm:text-2xl font-black font-spaceGrotesk text-white uppercase tracking-tight mb-8"
        >
          Recent Transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600 italic uppercase text-[10px] font-black tracking-widest text-center py-10">
            No recent activity detected.
          </p>
        ) : (
          <div className="space-y-3">
            {displayedTransactions.map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] hover:border-brand-gold/20"
                tabIndex={0}
                aria-label={`Transaction ${txn.type} ${txn._id?.slice(-6)}, amount ${txn.amount}, status ${txn.status}`}
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex p-3 rounded-xl bg-brand-gold/5 text-brand-gold border border-brand-gold/10">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-black font-spaceGrotesk uppercase tracking-tight">
                      {txn.type}{' '}
                      <span className="text-gray-600 text-xs font-mono">
                        #{txn._id?.slice(-6).toUpperCase()}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                      {new Date(txn.createdAt)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-black font-spaceGrotesk ${txn.amount > 0 ? 'text-emerald-400' : 'text-rose-400'} text-xl tracking-tighter`}
                  >
                    {txn.amount > 0 ? '+' : '-'}₦
                    {Math.abs(txn.amount).toLocaleString()}
                  </p>
                  <span
                    className={`mt-2 inline-block text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border ${getStatusColor(txn.status)}`}
                    aria-label={`Status: ${txn.status}`}
                  >
                    {txn.status === 'approved-processing'
                      ? 'PROCESSING'
                      : txn.status.toUpperCase()}
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
