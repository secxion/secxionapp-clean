import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentRequestForm from '../Components/PaymentRequestForm';
import BankAccountList from '../Components/BankAccountList';
import { useSelector } from 'react-redux';
import TransactionHistory from '../Components/TransactionHistory';
import {
  FaWallet,
  FaHistory,
  FaUniversity,
  FaBars,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import SidePanel from '../Components/SidePanel';
import LiveScript from '../Components/LiveScript';
import SummaryApi from '../common';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SecxionLogo from '../app/slogo.png';
import SecxionSpinner from '../Components/SecxionSpinner';
import BackButton from '../Components/BackButton';

const WalletDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('wallet');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [errorBalance, setErrorBalance] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [openAddBankAccount, setOpenAddBankAccount] = useState(false);
  const [userLoadTimeout, setUserLoadTimeout] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLiveScriptOpen, setIsLiveScriptOpen] = useState(false);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id && !user?._id) {
      console.warn('User not loaded, skipping wallet balance fetch');
      setIsLoadingBalance(false);
      return;
    }

    setIsLoadingBalance(true);
    setErrorBalance('');

    const controller = new AbortController();
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      console.error(`Request timeout after ${elapsed}ms`);
      controller.abort();
    }, 15000); // 15 second timeout

    try {
      const url = SummaryApi.getWalletBalance.url;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response:`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setWalletBalance(data.balance);
      } else {
        setErrorBalance(data.message || 'Failed to fetch wallet balance.');
      }
    } catch (err) {
      const totalTime = Date.now() - startTime;
      if (err.name === 'AbortError') {
        setErrorBalance('Request timeout. Please try again later.');
        console.error(`Wallet balance request timed out after ${totalTime}ms`);
      } else {
        setErrorBalance(
          'An unexpected error occurred while fetching wallet balance.',
        );
        console.error('Error fetching wallet balance:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingBalance(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user, fetchWalletBalance]);

  // Timeout if user doesn't load within 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) {
        setUserLoadTimeout(true);
        setIsLoadingBalance(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [user]);

  // Redirect to login if user doesn't exist after timeout
  useEffect(() => {
    if (userLoadTimeout && !user) {
      const timeout = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [userLoadTimeout, user, navigate]);

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'wallet':
        return <FaWallet className="w-5 h-5" />;
      case 'accounts':
        return <FaUniversity className="w-5 h-5" />;
      case 'history':
        return <FaHistory className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'wallet':
        return 'Wallet';
      case 'accounts':
        return 'Bank Accounts';
      case 'history':
        return 'Transaction History';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div
            className="min-h-screen p-4 md:p-12 lg:p-20"
            style={{ paddingBottom: '6rem' }}
          >
            <div className="w-full space-y-12">
              {/* Sturdy Balance Display */}
              <div className="relative text-center py-20">
                <div className="relative z-10 space-y-8">
                  <div className="relative inline-block group">
                    <p className="text-5xl md:text-7xl lg:text-9xl font-black text-emerald-400 font-spaceGrotesk tracking-tighter transition-all duration-500">
                      {showBalance
                        ? `₦${(walletBalance || 0).toLocaleString()}`
                        : '••••••••'}
                    </p>
                    <div className="mt-12 flex items-center justify-center gap-6">
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-500 hover:text-brand-gold transition-all duration-300"
                        title={showBalance ? 'Hide balance' : 'Show balance'}
                      >
                        {showBalance ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={fetchWalletBalance}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-500 hover:text-brand-gold transition-all duration-300"
                        title="Refresh balance"
                      >
                        <FaSyncAlt
                          className={`w-5 h-5 ${isLoadingBalance ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {errorBalance && (
                    <div className="max-w-md mx-auto p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                        {errorBalance}
                      </p>
                      <button
                        onClick={fetchWalletBalance}
                        className="mt-3 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Retry Sync
                      </button>
                    </div>
                  )}

                  <div className="pt-16">
                    <button
                      onClick={() => setShowPaymentDialog(true)}
                      className="inline-flex items-center px-16 py-6 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base rounded-2xl font-black font-spaceGrotesk text-sm uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(212,175,55,0.2)] transition-all duration-300 active:scale-95"
                    >
                      <FaPlus className="w-4 h-4 mr-3" />
                      Request Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="min-h-screen p-4 md:p-12 lg:p-20">
            <div className="w-full">
              <div className="border-b border-white/10 pb-8 mb-10 flex items-center space-x-6">
                <div className="p-4 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 shadow-brand-gold">
                  <FaUniversity className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
                    Bank Accounts
                  </h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Verified Withdrawal Destinations
                  </p>
                </div>
              </div>
              <div className="py-4">
                <BankAccountList />
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="min-h-screen p-4 md:p-12 lg:p-20">
            <div className="w-full">
              <TransactionHistory />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Guard: wait for user to load
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center">
          {userLoadTimeout ? (
            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 mb-4">Failed to load user data</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <SecxionSpinner size="large" message="Loading wallet..." />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-bg relative overflow-hidden">
      {/* Static Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-grid-16"></div>
      </div>

      {/* Enhanced Header */}
      <header className="fixed top-[var(--net-height)] left-0 right-0 z-50 bg-brand-dark-base/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex min-w-0 items-center gap-2 md:justify-between">
            <div className="flex min-w-0 flex-none items-center gap-2 md:gap-8">
              <button
                onClick={toggleSidePanel}
                className="inline-flex h-11 w-11 min-w-11 max-w-11 shrink-0 basis-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-0 text-gray-400 transition-colors hover:bg-white/10 hover:text-brand-gold md:hidden"
                aria-label="Open menu"
              >
                <FaBars className="h-5 w-5 shrink-0" />
              </button>

              <BackButton
                iconOnly
                fallbackTo="/home"
                ariaLabel="Back to home"
                className="min-w-11 max-w-11 basis-11 rounded-xl border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-brand-gold"
              />

              {/* Desktop Logo */}
              <Link
                to="/home"
                className="hidden md:flex items-center group transition-all duration-300"
                title="Go to Home"
              >
                <img
                  src={SecxionLogo}
                  alt="Secxion Logo"
                  className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Desktop Tab Info */}
              <div className="hidden md:flex items-center space-x-6 border-l border-white/10 pl-8">
                <div className="p-3 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 text-brand-gold">
                  {getTabIcon(activeTab)}
                </div>
                <div>
                  <h1 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-tight">
                    {getTabTitle(activeTab)}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-emerald-400"></div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Display Short Toggle */}
            <div className="ml-auto flex min-w-0 items-center md:gap-6">
              {activeTab !== 'wallet' && (
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="group flex h-11 min-w-0 max-w-[11rem] shrink items-center rounded-xl border border-white/10 bg-white/5 px-3 py-0 transition-colors hover:border-brand-gold/30 md:max-w-none md:px-6"
                  title={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  <div className="flex min-w-0 items-center gap-2 md:gap-4">
                    <FaWallet
                      className={`h-3.5 w-3.5 shrink-0 ${showBalance ? 'text-brand-gold' : 'text-gray-500'}`}
                    />
                    <span className="min-w-0 truncate text-sm font-black tracking-tight text-emerald-400 font-spaceGrotesk">
                      {showBalance
                        ? `₦${(walletBalance || 0).toLocaleString()}`
                        : '••••••••'}
                    </span>
                    {showBalance ? (
                      <FaEyeSlash className="h-3 w-3 shrink-0 text-gray-500 group-hover:text-white" />
                    ) : (
                      <FaEye className="h-3 w-3 shrink-0 text-gray-500 group-hover:text-white" />
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Side Panel */}
      <SidePanel
        open={isSidePanelOpen}
        setOpen={setIsSidePanelOpen}
        onOpenLiveScript={() => setIsLiveScriptOpen(true)}
      />

      {/* LiveScript Modal */}
      <LiveScript
        isOpen={isLiveScriptOpen}
        onClose={() => setIsLiveScriptOpen(false)}
      />

      {/* Main Content */}
      <main
        className="pt-32 pb-32 md:pb-20 relative z-10"
        style={{
          paddingBottom: 'max(8rem, calc(5rem + env(safe-area-inset-bottom)))',
        }}
      >
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>

      {/* Payment Request Dialog */}
      <AnimatePresence>
        {showPaymentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                    <FaWallet className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Payment Request
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Withdraw funds to your bank account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <PaymentRequestForm
                  fetchWalletBalance={fetchWalletBalance}
                  walletBalance={walletBalance}
                  openAddBankAccount={openAddBankAccount}
                  setOpenAddBankAccount={setOpenAddBankAccount}
                  onClose={() => setShowPaymentDialog(false)}
                  isDialog={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Footer Navigation */}
      <footer
        className="fixed bottom-0 left-0 right-0 bg-brand-dark-base/90 backdrop-blur-2xl border-t border-white/5 shadow-2xl z-40"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-around py-4 items-center px-4 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'wallet'
                ? 'text-brand-gold scale-110'
                : 'text-gray-500 hover:text-gray-300'
            } focus:outline-none`}
          >
            <FaWallet className="text-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest font-spaceGrotesk">
              Wallet
            </span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'accounts'
                ? 'text-brand-gold scale-110'
                : 'text-gray-500 hover:text-gray-300'
            } focus:outline-none`}
          >
            <FaUniversity className="text-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest font-spaceGrotesk">
              Accounts
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'history'
                ? 'text-brand-gold scale-110'
                : 'text-gray-500 hover:text-gray-300'
            } focus:outline-none`}
          >
            <FaHistory className="text-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest font-spaceGrotesk">
              History
            </span>
          </button>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-grid-16 {
          background-size: 16px 16px;
        }

        .bg-grid-slate-100/[0.02] {
          background-image: radial-gradient(
            circle,
            rgba(148, 163, 184, 0.02) 1px,
            transparent 1px
          );
        }
      `}</style>
    </div>
  );
};

export default WalletDashboard;
