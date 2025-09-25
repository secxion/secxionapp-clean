import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import SummaryApi from "../common";
import HomeFooter from "../Components/HomeFooter";
import NetBlog from "../Components/NetBlog";
import HiRateSlider from "../Components/HiRateSlider";
import LastMarketStatus from "../Components/LastMarketStatus";
import Hero from "../Components/Hero";

const menuItems = [
  { label: "Market", path: "/section", icon: <Store className="w-8 h-8" />, description: "Explore marketplace" },
  { label: "Transaction Record", path: "/record", icon: <ClipboardList className="w-8 h-8" />, description: "View transaction history" },
  { label: "Wallet", path: "/mywallet", icon: <Wallet className="w-8 h-8" />, description: "Manage your assets" },
  { label: "Profile", path: "/profile", icon: <User className="w-8 h-8" />, description: "Account settings" },
  { label: "Data Pad", path: "/datapad", icon: <Book className="w-8 h-8" />, description: "Access your data" },
  { label: "Contact Support", path: "/report", icon: <MessageCircle className="w-8 h-8" />, description: "Get help and support" },
];

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleTransactions, setVisibleTransactions] = useState(3);
  const [showAll, setShowAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleNavigation = (path) => navigate(path);

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    setIsLoadingBalance(true);
    setErrorBalance("");
    try {
      const response = await fetch(`${SummaryApi.getWalletBalance.url}/${user._id || user.id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) setWalletBalance(data.balance || 0);
      else setErrorBalance(data.message || "Failed to fetch wallet balance.");
    } catch (err) {
      setErrorBalance("Error fetching wallet balance.");
      console.error(err);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(
    async (currentStatusFilter) => {
      if (!user?.id && !user?._id) return;
      setLoadingTransactions(true);
      setErrorTransactions("");
      try {
        let url = `${SummaryApi.transactions.url}?userId=${user.id || user._id}`;
        if (currentStatusFilter !== "all") url += `&status=${currentStatusFilter}`;
        const response = await fetch(url, { method: "GET", credentials: "include" });
        const data = await response.json();
        if (data.success && data.transactions) setTransactions(data.transactions);
        else setErrorTransactions(data.message || "Failed to fetch transactions.");
      } catch (err) {
        setErrorTransactions("Error loading transactions.");
        console.error(err);
      } finally {
        setLoadingTransactions(false);
      }
    },
    [user]
  );

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setLastUpdated(null);
    try {
      await Promise.all([fetchWalletBalance(), fetchTransactions(statusFilter)]);
      setLastUpdated(new Date().toLocaleTimeString([], { hour12: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchWalletBalance, fetchTransactions, statusFilter]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchTransactions(statusFilter);
    }
  }, [user, fetchWalletBalance, fetchTransactions, statusFilter]);

  const portfolioValue = walletBalance;
  const portfolioGrowth = 0; // Placeholder

  const quickStats = [
    {
      label: "Portfolio Value",
      value: `₦${portfolioValue.toLocaleString()}`,
      change: `${portfolioGrowth > 0 ? "+" : ""}${portfolioGrowth.toFixed(1)}%`,
      positive: portfolioGrowth >= 0,
    },
    {
      label: "Recent Transactions",
      value: `${transactions.length}`,
      change: `${transactions.length} total`,
      positive: transactions.length > 0,
    },
  ];

  const getStatusColor = (status) =>
    ({
      pending: "bg-yellow-600/20 text-yellow-400",
      "approved-processing": "bg-yellow-600/30 text-yellow-300",
      completed: "bg-green-600/20 text-green-400",
      rejected: "bg-red-600/20 text-red-400",
    }[status] || "bg-gray-700 text-gray-300");

  const displayedTransactions = showAll ? transactions : transactions.slice(0, visibleTransactions);

  return (
    <div className="bg-gray-950 min-h-screen w-full pt-32 pb-16 relative overflow-hidden">
      {/* Hero */}
      <Hero />

      {/* Stats */}
      <section className="max-w-7xl mx-auto mt-16 mb-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <h2 className="text-2xl font-bold text-yellow-300">Account Overview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-yellow-400 transition"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-yellow-400 transition"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow hover:shadow-lg transition">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-yellow-300 mb-1">
                {showBalance ? stat.value : "••••••"}
              </p>
              <p className={`text-sm ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                {stat.positive ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}{" "}
                {stat.change}
              </p>
            </div>
          ))}
        </div>
        {lastUpdated && <p className="text-xs text-gray-500 mt-2 text-right">Last updated: {lastUpdated}</p>}
      </section>

      {/* High Rate Slider */}
      <section className="max-w-7xl mx-auto mb-10 px-4">
        <HiRateSlider />
      </section>

      {/* Last Market Status */}
      <section className="max-w-7xl mx-auto mb-10 px-4">
        <LastMarketStatus />
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto mb-10 px-4">
        <h2 className="text-xl font-semibold text-yellow-300 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              onClick={() => handleNavigation(item.path)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-yellow-400 transition cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-800 text-yellow-400">{item.icon}</div>
                <div>
                  <h3 className="text-white font-medium">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className="max-w-7xl mx-auto mb-10 px-4">
        <h2 className="text-xl font-semibold text-yellow-300 mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <div className="space-y-3">
            {displayedTransactions.map((txn, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <div>
                  <p className="text-white font-medium">{txn.type} #{txn._id?.slice(-6)}</p>
                  <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {txn.amount > 0 ? "+" : "-"}₦{Math.abs(txn.amount).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blog */}
      <section className="max-w-7xl mx-auto mb-10 px-4">
        <NetBlog />
      </section>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
};

export default Home;
