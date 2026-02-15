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
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 relative z-10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-700/50 shadow-xl mb-6">
        {/* Mobile-First Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, amount, status, account..."
              className="w-full bg-slate-700/60 border border-slate-600 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/30 transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Searches: ID • Amount • Status • Account Number • Bank Name •
            Description
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={toggleFilter}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
          >
            <span className="flex items-center">
              <FaFilter className="mr-2 w-4 h-4" />
              Filter by Status
            </span>
            <span className="text-sm text-yellow-400">
              {menuItems.find((item) => item.value === statusFilter)?.label ||
                'All'}
            </span>
          </button>
        </div>

        {/* Enhanced Filter Tabs with More Obvious Horizontal Scroll */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {/* Enhanced Horizontal Scrollable Filter Container */}
              <div className="relative">
                {/* Left scroll indicator */}
                <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10 md:hidden flex items-center justify-start pl-1">
                  <div className="w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
                </div>

                {/* Right scroll indicator */}
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10 md:hidden flex items-center justify-end pr-1">
                  <div className="w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
                </div>

                {/* Scrollable container with enhanced styling */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-slate-800 pb-2">
                  <div className="flex gap-2 md:gap-3 min-w-max px-1">
                    {menuItems.map((item, index) => {
                      const isActive = statusFilter === item.value;
                      return (
                        <motion.button
                          key={item.value}
                          onClick={() => handleFilterChange(item.label)}
                          className={`flex-shrink-0 px-4 py-2 md:px-4 md:py-2 rounded-xl font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap border-2 ${
                            isActive
                              ? 'bg-yellow-600 text-gray-900 shadow-lg border-yellow-500'
                              : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white border-slate-600 hover:border-yellow-500/50'
                          }`}
                          style={{
                            minWidth: '80px',
                          }}
                        >
                          <span>{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between text-xs md:text-sm text-gray-400 gap-2">
          <span>
            Showing {displayedTransactions.length} of{' '}
            {filteredTransactions.length} transactions
            {searchQuery && ` (filtered from ${transactions.length} total)`}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions)}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
              title="Download transactions as CSV"
            >
              <FaDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fetchTransactions(statusFilter)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Transaction List - Mobile Optimized */}
          <AnimatePresence mode="wait">
            {displayedTransactions.length > 0 ? (
              <motion.div
                className="space-y-3 md:space-y-4 px-1 pb-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {displayedTransactions.map((transaction) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <TransactionCard transaction={transaction} />
                  </motion.div>
                ))}

                {/* View More/Less Controls - Inside scrollable area */}
                {filteredTransactions.length > visibleTransactions && (
                  <div className="flex justify-center px-4 py-6">
                    <AnimatePresence mode="wait">
                      {!showAll ? (
                        <motion.button
                          key="view-more"
                          onClick={handleViewMore}
                          className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-xl font-semibold shadow-lg transition-colors duration-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <FaEye className="mr-2" />
                          <span className="hidden md:inline">
                            View All {filteredTransactions.length} Transactions
                          </span>
                          <span className="md:hidden">
                            View All ({filteredTransactions.length})
                          </span>
                        </motion.button>
                      ) : (
                        <motion.button
                          key="show-less"
                          onClick={handleCloseViewMore}
                          className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-xl font-semibold shadow-lg transition-colors duration-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <FaEyeSlash className="mr-2" />
                          Show Less
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center h-full px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 text-center max-w-md mx-auto">
                  <FaHistory className="w-12 md:w-16 h-12 md:h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-2">
                    {searchQuery
                      ? 'No matching transactions'
                      : 'No transactions found'}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm md:text-base">
                    {searchQuery
                      ? 'Try adjusting your search terms or filters'
                      : 'Your transaction history will appear here once you make your first withdrawal request'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-lg transition-colors text-sm md:text-base"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
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
