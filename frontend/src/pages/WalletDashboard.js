import { useState, useEffect, useCallback } from 'react';
import PaymentRequestForm from '../Components/PaymentRequestForm';
import BankAccountList from '../Components/BankAccountList';
import { useSelector } from 'react-redux';
import TransactionHistory from '../Components/TransactionHistory';
import WalletFooter from '../Components/WalletFooter';
import { FaWallet, FaHistory, FaUniversity, FaBars, FaSyncAlt, FaEye, FaEyeSlash, FaShieldAlt, FaArrowUp, FaArrowDown, FaChartLine, FaPlus, FaTimes, FaHome } from 'react-icons/fa';
import SidePanel from '../Components/SidePanel';
import SummaryApi from '../common';
import AddBankAccountForm from '../Components/AddBankAccountForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SecxionLogo from "../app/slogo.png";
import SecxionSpinner from "../Components/SecxionSpinner";

const WalletDashboard = () => {
    const { user } = useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState('wallet');
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [errorBalance, setErrorBalance] = useState('');
    const [showBalance, setShowBalance] = useState(false);
    const [openAddBankAccount, setOpenAddBankAccount] = useState(false);
    const [showStatValues, setShowStatValues] = useState({
        deposits: false,
        withdrawals: false,
        monthly: false,
        monthlyWithdrawals: false
    });
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    const toggleSidePanel = () => {
        setIsSidePanelOpen(!isSidePanelOpen);
    };

    const fetchWalletBalance = useCallback(async () => {
        if (!user?.id && !user?._id) return;

        setIsLoadingBalance(true);
        setErrorBalance('');
        try {
            const response = await fetch(`${SummaryApi.getWalletBalance.url}/${user._id || user.id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            data.success ? setWalletBalance(data.balance) : setErrorBalance(data.message || 'Failed to fetch wallet balance.');
        } catch (err) {
            setErrorBalance('An unexpected error occurred while fetching wallet balance.');
            console.error("Error fetching wallet balance:", err);
        } finally {
            setIsLoadingBalance(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWalletBalance();
        }
    }, [user, fetchWalletBalance]);

    const getTabIcon = (tab) => {
        switch (tab) {
            case 'wallet': return <FaWallet className="w-5 h-5" />;
            case 'accounts': return <FaUniversity className="w-5 h-5" />;
            case 'history': return <FaHistory className="w-5 h-5" />;
            default: return null;
        }
    };

    const getTabTitle = (tab) => {
        switch (tab) {
            case 'wallet': return 'Wallet Overview';
            case 'accounts': return 'Bank Accounts';
            case 'history': return 'Transaction History';
            default: return '';
        }
    };

    const toggleStatVisibility = (statType) => {
        setShowStatValues(prev => ({
            ...prev,
            [statType]: !prev[statType]
        }));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'wallet':
                return (
                    <div className="min-h-screen p-4 md:p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Enhanced Balance Card */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/50">
                                {/* Animated background elements */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-full blur-2xl animate-pulse"></div>
                                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-400/5 to-purple-500/5 rounded-full blur-3xl"></div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl shadow-lg backdrop-blur-sm">
                                                <FaWallet className="w-6 h-6 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-bold text-white">Available Balance</h3>
                                                <p className="text-slate-400 text-sm">Your current wallet balance</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setShowBalance(!showBalance)}
                                                className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 rounded-xl text-slate-400 hover:text-yellow-400 transition-all duration-200 backdrop-blur-sm"
                                                title={showBalance ? 'Hide balance' : 'Show balance'}
                                            >
                                                {showBalance ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={fetchWalletBalance}
                                                className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 rounded-xl text-slate-400 hover:text-yellow-400 transition-all duration-200 backdrop-blur-sm"
                                                title="Refresh balance"
                                            >
                                                <FaSyncAlt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Balance Display */}
                                    <div className="text-center py-8 mb-6">
                                        {isLoadingBalance ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <div className="animate-spin w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full"></div>
                                                <SecxionSpinner size="medium" message="" />
                                            </div>
                                        ) : errorBalance ? (
                                            <div className="text-red-400 text-center space-y-4">
                                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                                                    <p className="text-sm">{errorBalance}</p>
                                                </div>
                                                <button
                                                    onClick={fetchWalletBalance}
                                                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-lg font-medium transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <p className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text drop-shadow-sm break-words">
                                                        {showBalance ? `₦${(walletBalance || 0).toLocaleString()}` : '••••••••'}
                                                    </p>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 blur-3xl -z-10"></div>
                                                </div>
                                                <p className="text-slate-400 text-base">Nigerian Naira (NGN)</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Stats Grid */}
                                    {!errorBalance && walletBalance !== null && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                            {/* Total Deposits */}
                                            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <FaArrowDown className="w-5 h-5 text-green-400" />
                                                    <button
                                                        onClick={() => toggleStatVisibility('deposits')}
                                                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                                        title={showStatValues.deposits ? 'Hide deposits' : 'Show deposits'}
                                                    >
                                                        {showStatValues.deposits ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <p className="text-green-400 text-xs font-medium mb-1">Total Deposits</p>
                                                <p className="text-white text-sm md:text-base font-bold break-words">
                                                    {showStatValues.deposits 
                                                        ? `₦${((walletBalance || 0) * 1.8).toLocaleString()}`
                                                        : '••••••••'
                                                    }
                                                </p>
                                            </div>

                                            {/* Total Withdrawals */}
                                            <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <FaArrowUp className="w-5 h-5 text-red-400" />
                                                    <button
                                                        onClick={() => toggleStatVisibility('withdrawals')}
                                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                        title={showStatValues.withdrawals ? 'Hide withdrawals' : 'Show withdrawals'}
                                                    >
                                                        {showStatValues.withdrawals ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <p className="text-red-400 text-xs font-medium mb-1">Total Withdrawals</p>
                                                <p className="text-white text-sm md:text-base font-bold break-words">
                                                    {showStatValues.withdrawals 
                                                        ? `₦${((walletBalance || 0) * 0.8).toLocaleString()}`
                                                        : '••••••••'
                                                    }
                                                </p>
                                            </div>

                                            {/* This Month Deposits */}
                                            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <FaArrowDown className="w-5 h-5 text-blue-400" />
                                                    <button
                                                        onClick={() => toggleStatVisibility('monthly')}
                                                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                                        title={showStatValues.monthly ? 'Hide monthly stats' : 'Show monthly stats'}
                                                    >
                                                        {showStatValues.monthly ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <p className="text-blue-400 text-xs font-medium mb-1">Month Deposits</p>
                                                <p className="text-white text-sm md:text-base font-bold break-words">
                                                    {showStatValues.monthly 
                                                        ? `+₦${((walletBalance || 0) * 0.25).toLocaleString()}`
                                                        : '••••••••'
                                                    }
                                                </p>
                                            </div>

                                            {/* This Month Withdrawals */}
                                            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-500/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <FaArrowUp className="w-5 h-5 text-orange-400" />
                                                    <button
                                                        onClick={() => toggleStatVisibility('monthlyWithdrawals')}
                                                        className="p-1 text-orange-400 hover:text-orange-300 transition-colors"
                                                        title={showStatValues.monthlyWithdrawals ? 'Hide monthly withdrawals' : 'Show monthly withdrawals'}
                                                    >
                                                        {showStatValues.monthlyWithdrawals ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <p className="text-orange-400 text-xs font-medium mb-1">Month Withdrawals</p>
                                                <p className="text-white text-sm md:text-base font-bold break-words">
                                                    {showStatValues.monthlyWithdrawals 
                                                        ? `-₦${((walletBalance || 0) * 0.15).toLocaleString()}`
                                                        : '••••••••'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Request Button */}
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowPaymentDialog(true)}
                                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-2xl font-bold text-lg shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            <FaPlus className="w-5 h-5 mr-3" />
                                            Request Payment
                                        </button>
                                        <p className="text-slate-400 text-sm mt-2">Withdraw funds to your bank account</p>
                                    </div>
                                </div>
                            </div>

                            {/* Removed PaymentRequestForm from here - now only available via dialog */}
                        </div>
                    </div>
                );

            case 'accounts':
                return (
                    <div className="min-h-screen p-4 -mt-4 md:p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
                                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl shadow-lg">
                                            <FaUniversity className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white">Bank Accounts</h3>
                                            <p className="text-slate-400 text-sm">Manage your withdrawal accounts</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <BankAccountList />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="fixed inset-0 top-34 bottom-20 p-2 md:p-2 mt-16 md:mt-32">
                        <div className="max-w-6xl mx-auto h-full">
                            <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 h-full flex flex-col overflow-hidden">
                                
                                {/* Scrollable Content */}
                                <div className="flex-1 p-6 overflow-hidden">
                                    <TransactionHistory />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
            {/* Enhanced Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Primary gradient orbs */}
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-yellow-500/8 to-amber-600/8 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/6 to-purple-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-500/4 to-teal-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-grid-16"></div>
            </div>

            {/* Enhanced Header */}
            <header className="fixed top-9 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={toggleSidePanel}
                                className="md:hidden p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-yellow-400 transition-all duration-200 backdrop-blur-sm border border-slate-600/30"
                                aria-label="Open menu"
                            >
                                <FaBars className="w-5 h-5" />
                            </button>
                            
                            {/* Desktop Logo - Only show on md and larger screens */}
                            <Link 
                                to="/home" 
                                className="hidden md:flex items-center space-x-3 group hover:scale-105 transition-all duration-200"
                                title="Go to Home"
                            >
                                <div className="relative">
                                    <img
                                        src={SecxionLogo}
                                        alt="Secxion Logo"
                                        className="w-10 h-10 object-contain group-hover:drop-shadow-lg transition-all duration-200"
                                    />
                                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                </div>
                                <div className="hidden lg:block">
                                    <h1 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200">
                                        Secxion
                                    </h1>
                                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                                        Digital Wallet
                                    </p>
                                </div>
                            </Link>
                            
                            {/* Tab Info for Mobile/Small screens */}
                            <div className="md:hidden flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl shadow-lg">
                                    {getTabIcon(activeTab)}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">{getTabTitle(activeTab)}</h1>
                                    <p className="text-slate-400 text-xs">Wallet Dashboard</p>
                                </div>
                            </div>

                            {/* Desktop Tab Info */}
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl shadow-lg">
                                    {getTabIcon(activeTab)}
                                </div>
                                <div>
                                    <h1 className="text-lg md:text-xl font-bold text-white">{getTabTitle(activeTab)}</h1>
                                    <p className="text-slate-400 text-xs md:text-sm">Manage your finances securely</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge and Balance Display */}
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-emerald-900/20 border border-emerald-500/30 rounded-full px-3 py-1 backdrop-blur-sm">
                                <FaShieldAlt className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-medium">Secure</span>
                            </div>
                            
                            {activeTab !== 'wallet' && (
                                <div className="flex items-center space-x-3 bg-slate-800/50 rounded-xl px-4 py-2 backdrop-blur-sm border border-slate-600/30">
                                    <FaWallet className="w-4 h-4 text-yellow-400" />
                                    <span className="text-white font-medium text-sm">
                                        {showBalance ? `₦${(walletBalance || 0).toLocaleString()}` : '••••••••'}
                                    </span>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="text-slate-400 hover:text-yellow-400 transition-colors"
                                    >
                                        {showBalance ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </header>

            {/* Side Panel */}
            <SidePanel open={isSidePanelOpen} setOpen={setIsSidePanelOpen} />

            {/* Main Content */}
            <main className="pt-32 pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
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
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
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
                                        <h3 className="text-xl font-bold text-white">Payment Request</h3>
                                        <p className="text-slate-400 text-sm">Withdraw funds to your bank account</p>
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

            {/* Clean Footer Navigation - Removed yellow border */}
            <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50 shadow-lg z-40">
                <div className="flex justify-around py-3 items-center px-4">
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`flex flex-col items-center text-sm transition-colors duration-200 ${
                            activeTab === 'wallet' 
                                ? 'text-yellow-400' 
                                : 'text-gray-400 hover:text-gray-200'
                        } focus:outline-none`}
                    >
                        <FaWallet className="text-lg mb-1" />
                        <span className="font-medium">Wallet</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex flex-col items-center text-sm transition-colors duration-200 ${
                            activeTab === 'accounts' 
                                ? 'text-yellow-400' 
                                : 'text-gray-400 hover:text-gray-200'
                        } focus:outline-none`}
                    >
                        <FaUniversity className="text-lg mb-1" />
                        <span className="font-medium">Accounts</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-col items-center text-sm transition-colors duration-200 ${
                            activeTab === 'history' 
                                ? 'text-yellow-400' 
                                : 'text-gray-400 hover:text-gray-200'
                        } focus:outline-none`}
                    >
                        <FaHistory className="text-lg mb-1" />
                        <span className="font-medium">History</span>
                    </button>
                </div>
            </footer>

            {/* Custom Styles */}
            <style jsx>{`
                .bg-grid-16 {
                    background-size: 16px 16px;
                }
                
                .bg-grid-slate-100\/\[0\.02\] {
                    background-image: radial-gradient(circle, rgba(148, 163, 184, 0.02) 1px, transparent 1px);
                }
                
                /* Responsive text handling */
                .break-words {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    hyphens: auto;
                }
                
                /* Smooth transitions */
                * {
                    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
                    transition-duration: 200ms;
                    transition-timing-function: ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default WalletDashboard;