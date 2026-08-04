import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import TransactionCard from './TransactionCard';
import SummaryApi from '../common';
import {
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaSearch,
  FaTimes,
  FaChevronUp,
  FaDownload,
  FaSyncAlt,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SecxionSpinner from './SecxionSpinner';
import { exportTransactionsToCSV } from '../utils/csvExport';

const TransactionHistory = () => {
  const { user } = useSelector((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleTransactions, setVisibleTransactions] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);

  // Auto scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop } = scrollContainerRef.current;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auto scroll to top function
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const fetchTransactions = useCallback(
    async (currentStatusFilter) => {
      if (!user?.id && !user?._id) {
        console.warn('User not found in Redux. Cannot fetch transactions.');
        setErrorTransactions('User authentication details not found.');
        return;
      }

      setLoadingTransactions(true);
      setErrorTransactions('');
      try {
        let url = `${SummaryApi.transactions.url}`;
        const userId = user?.id || user?._id;
        url += `?userId=${userId}`;

        if (currentStatusFilter && currentStatusFilter !== 'all') {
          url += `&status=${currentStatusFilter}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        } else {
          setErrorTransactions(data.message || 'Failed to fetch transactions.');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setErrorTransactions(
          'An unexpected error occurred while fetching transactions.',
        );
      } finally {
        setLoadingTransactions(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchTransactions(statusFilter);
    setVisibleTransactions(6);
    setShowAll(false);
  }, [statusFilter, fetchTransactions]);

  const handleFilterChange = (statusText) => {
    const statusValue = statusText.toLowerCase().replace(/ /g, '-');
    setStatusFilter(statusValue);
    setIsFilterOpen(false);
  };

  const handleViewMore = () => {
    setShowAll(true);
    setVisibleTransactions(transactions.length);
  };

  const handleCloseViewMore = () => {
    setShowAll(false);
    setVisibleTransactions(6);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      transaction._id?.toLowerCase().includes(query) ||
      transaction.amount?.toString().includes(query) ||
      transaction.status?.toLowerCase().includes(query) ||
      transaction.bankAccountDetails?.accountNumber?.includes(query) ||
      transaction.bankAccountDetails?.bankName?.toLowerCase().includes(query)
    );
  });

  const displayedTransactions = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, visibleTransactions);

  const menuItems = [
    { label: 'All', value: 'all', color: 'blue' },
    { label: 'Pending', value: 'pending', color: 'yellow' },
    { label: 'Processing', value: 'approved-processing', color: 'orange' },
    { label: 'Rejected', value: 'rejected', color: 'red' },
    { label: 'Completed', value: 'completed', color: 'green' },
  ];

  if (loadingTransactions) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SecxionSpinner size="large" message="Loading transaction history..." />
      </div>
    );
  }

  if (errorTransactions) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
          <FaHistory className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error Loading Transactions
          </h3>
          <p className="text-red-200 text-sm mb-4">{errorTransactions}</p>
          <button
            onClick={() => fetchTransactions(statusFilter)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col premium-bg">
      {/* Fixed Header Section */}
      <div className="relative z-10 mb-6 flex-shrink-0 p-4 md:p-8">
        <h2 className="text-[10px] font-black mb-8 text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk">
          Transaction History
        </h2>
        {/* Mobile-First Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <FaSearch className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full rounded-2xl bg-black/20 border border-white/10 py-4 pl-11 pr-10 text-sm font-medium text-white placeholder-gray-700 transition-all focus:border-brand-gold/50 outline-none font-spaceGrotesk"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                title="Clear search"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={toggleFilter}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-gray-300 transition-all active:scale-95"
          >
            <span className="flex items-center text-[10px] font-black uppercase tracking-widest font-spaceGrotesk">
              <FaFilter className="mr-3 w-3.5 h-3.5 text-brand-gold" />
              Filter
            </span>
            <span className="text-[10px] font-black text-brand-gold font-spaceGrotesk">
              {menuItems
                .find((item) => item.value === statusFilter)
                ?.label.toUpperCase() || 'ALL'}
            </span>
          </button>
        </div>

        {/* Enhanced Filter Tabs */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide pb-2">
                  <div className="flex gap-3 min-w-max px-1">
                    {menuItems.map((item) => {
                      const isActive = statusFilter === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleFilterChange(item.label)}
                          className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                            isActive
                              ? 'bg-brand-gold text-brand-dark-base border-brand-gold shadow-brand-gold'
                              : 'bg-white/5 text-gray-500 hover:text-gray-200 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="mt-8 flex flex-col gap-4 justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600 md:flex-row md:items-center">
          <span>
            Showing {displayedTransactions.length} of{' '}
            {filteredTransactions.length} results
          </span>
          <div className="flex gap-6">
            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions)}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors"
              title="Download Data"
            >
              <FaDownload className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fetchTransactions(statusFilter)}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors"
            >
              <FaSyncAlt className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto pr-1 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Transaction List */}
          <AnimatePresence mode="wait">
            {displayedTransactions.length > 0 ? (
              <motion.div
                className="space-y-1 px-4 md:px-8 pb-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {displayedTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction._id}
                    transaction={transaction}
                  />
                ))}

                {filteredTransactions.length > visibleTransactions && (
                  <div className="flex justify-center py-12">
                    {!showAll ? (
                      <button
                        onClick={handleViewMore}
                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-brand-gold border border-brand-gold/20 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95"
                      >
                        View More ({filteredTransactions.length})
                      </button>
                    ) : (
                      <button
                        onClick={handleCloseViewMore}
                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-gray-500 border border-white/10 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-20 h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-6 opacity-20 filter grayscale">
                  📋
                </div>
                <h3 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-widest mb-2">
                  No records found
                </h3>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                  History is currently empty.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 p-3 md:p-4 rounded-full shadow-2xl z-50 border-2 border-yellow-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FaChevronUp className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        /* Enhanced scrollbar styling for horizontal scroll */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #ca8a04 #1e293b;
        }

        .scrollbar-thumb-yellow-600::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #ca8a04, #eab308);
          border-radius: 6px;
          border: 1px solid #374151;
        }

        .scrollbar-track-slate-800::-webkit-scrollbar-track {
          background-color: rgb(30, 41, 59);
          border-radius: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.8);
          border-radius: 4px;
          margin: 0 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #ca8a04, #eab308);
          border-radius: 4px;
          border: 1px solid #374151;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #a16207, #ca8a04);
          box-shadow: 0 0 4px rgba(234, 179, 8, 0.5);
        }

        /* Enhanced scroll behavior */
        .overflow-x-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #eab308 #1e293b;
        }

        /* Mobile scroll hints */
        @media (max-width: 768px) {
          .overflow-x-auto {
            /* Add padding to show scroll indicators */
            padding-left: 8px;
            padding-right: 8px;
          }

          /* Show scroll shadow on mobile */
          .overflow-x-auto::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background: linear-gradient(
              to right,
              rgba(15, 23, 42, 0.9),
              transparent
            );
            pointer-events: none;
            z-index: 1;
          }

          .overflow-x-auto::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background: linear-gradient(
              to left,
              rgba(15, 23, 42, 0.9),
              transparent
            );
            pointer-events: none;
            z-index: 1;
          }
        }

        /* Ensure proper touch targets */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 80px;
          }
        }

        /* Custom pulse animation for indicators */
        @keyframes scroll-hint {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-scroll-hint {
          animation: scroll-hint 2s ease-in-out infinite;
        }

        /* Smooth scrolling for all browsers */
        .overflow-y-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Custom scrollbar for vertical scroll */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.5);
          border-radius: 2px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.7);
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
