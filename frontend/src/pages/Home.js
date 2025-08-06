import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import giftCardImages from "../helper/heroimages";
import HomeFooter from "../Components/HomeFooter";
import NetBlog from "../Components/NetBlog";
import HiRateSlider from "../Components/HiRateSlider";
import LastMarketStatus from "../Components/LastMarketStatus";

const menuItems = [
  {
    label: "Market",
    path: "/section",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <Store className="w-10 h-10 text-yellow-700" />,
    description: "Explore marketplace",
  },
  {
    label: "Transaction Record",
    path: "/record",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <ClipboardList className="w-10 h-10 text-yellow-700" />,
    description: "View transaction history",
  },
  {
    label: "Wallet",
    path: "/mywallet",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <Wallet className="w-10 h-10 text-yellow-700" />,
    description: "Manage your assets",
  },
  {
    label: "Profile",
    path: "/profile",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <User className="w-10 h-10 text-yellow-700" />,
    description: "Account settings",
  },
  {
    label: "Data Pad",
    path: "/datapad",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <Book className="w-10 h-10 text-yellow-700" />,
    description: "Access your data",
  },
  {
    label: "Contact Support",
    path: "/report",
    color: "bg-yellow-100 hover:bg-yellow-200 border-4 border-yellow-500", // Border made bolder
    icon: <MessageCircle className="w-10 h-10 text-yellow-700" />,
    description: "Get help and support",
  },
];

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const menuSectionRef = useRef(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages] = useState(giftCardImages);

  const [searchTerm, setSearchTerm] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState("");
  const [showBalance, setShowBalance] = useState(false); // ⬅️ Start hidden
  const [ethBalance, setEthBalance] = useState(0);
  const [ethRate, setEthRate] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleTransactions, setVisibleTransactions] = useState(3);
  const [showAll, setShowAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const currentImage = heroImages[currentImageIndex];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    setIsLoadingBalance(true);
    setErrorBalance("");
    try {
      const response = await fetch(
        `${SummaryApi.getWalletBalance.url}/${user._id || user.id}`,
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setWalletBalance(data.balance || 0);
      } else {
        setErrorBalance(data.message || "Failed to fetch wallet balance.");
      }
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
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        } else {
          setErrorTransactions(data.message || "Failed to fetch transactions.");
        }
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
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
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

  const portfolioValue = walletBalance + ethBalance * ethRate;
  const portfolioGrowth =
    walletBalance > 0
      ? ((portfolioValue - walletBalance) / walletBalance) * 100
      : 0;
  const recentTransactionCount = transactions.filter((t) => {
    const date = new Date(t.createdAt || t.timestamp);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return date >= dayAgo;
  }).length;

  const quickStats = [
    {
      label: "Portfolio Value",
      value: `₦${portfolioValue.toLocaleString()}`,
      change: `${portfolioGrowth > 0 ? "+" : ""}${portfolioGrowth.toFixed(1)}%`,
      positive: portfolioGrowth >= 0,
    },
    {
      label: "Recent Transactions",
      value: `${recentTransactionCount}`,
      change: `${transactions.length} total`,
      positive: recentTransactionCount > 0,
    },
  ];

  const formatTransactionStatus = (status) =>
    ({
      pending: "Pending",
      "approved-processing": "Processing",
      completed: "Completed",
      rejected: "Rejected",
    }[status] || status);

  const getStatusColor = (status) =>
    ({
      pending: "bg-yellow-200 text-yellow-900",
      "approved-processing": "bg-yellow-300 text-yellow-900",
      completed: "bg-green-200 text-green-800",
      rejected: "bg-red-200 text-red-800",
    }[status] || "bg-gray-100 text-gray-800");

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedTransactions = showAll
    ? transactions
    : transactions.slice(0, visibleTransactions);

  return (
    <div className="bg-white mb-16 mt-36  w-full px-4 space-y-16">
            <div>
              <div>
                <HiRateSlider />
              </div>
             
      {/* Hero */}
      <header
        className="relative h-[60vh] bg-center mt-20  sm:mt-20 md:mt-24 lg:mt-24 border-yellow-800 border-4 bg-cover flex items-center justify-center"
        style={{ backgroundImage: `url(${currentImage.url})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center ">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/section"
              className="inline-block bg-yellow-400 text-black border-2 border-yellow-600 px-6 py-3 uppercase font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 glossy-text" // Applied glossy-text
            >
              Explore Market
            </Link>
          </motion.div>
        </div>
      </header>
</div>
            
        
      {/* Stats */}
      <section className="bg-white max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black glossy-heading">Account Overview</h2> {/* Applied glossy-heading */}
          </div>
          <div className="flex items-center gap-3">
            {/* 👁 Toggle Visibility */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              title={showBalance ? "Hide Balance" : "Show Balance"}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {showBalance ? <Eye className="w-5 h-5 text-gray-700" /> : <EyeOff className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white border-4 border-yellow-500 rounded-xl p-6 shadow hover:shadow-lg" // Border made bolder
            >
              <p className="text-gray-600 text-sm glossy-text">{stat.label}</p> {/* Applied glossy-text */}
              <p className="text-3xl font-bold text-black glossy-heading"> {/* Applied glossy-heading */}
                {showBalance ? stat.value : "••••••"}
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  stat.positive ? "text-green-600" : "text-red-600"
                } glossy-text`} // Applied glossy-text
              >
                {stat.positive ? (
                  <TrendingUp className="inline w-4 h-4" />
                ) : (
                  <TrendingDown className="inline w-4 h-4" />
                )}{" "}
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </section>

      <LastMarketStatus />

      {/* Menu */}
      <section className="bg-white max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-6 glossy-heading">Quick Access</h2> {/* Applied glossy-heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => handleNavigation(item.path)}
              className={`${item.color} p-6 rounded-xl cursor-pointer transition hover:-translate-y-1`}
            >
              <div className="text-center">
                <div className="mb-2">{item.icon}</div>
                <h3 className="text-lg font-semibold text-black glossy-text"> {/* Applied glossy-text */}
                  {item.label}
                </h3>
                <p className="text-sm text-gray-700 glossy-text">{item.description}</p> {/* Applied glossy-text */}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className="bg-white max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-4 glossy-heading">Recent Transactions</h2> {/* Applied glossy-heading */}
        {transactions.length === 0 ? (
          <p className="text-gray-500 glossy-text">No transactions found.</p> // Applied glossy-text
        ) : (
          <div className="space-y-4">
            {displayedTransactions.map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-yellow-50 border-4 border-yellow-500 p-4 rounded-lg shadow-sm" // Border made bolder
              >
                <div>
                  <p className="font-medium text-black glossy-text"> {/* Applied glossy-text */}
                    {txn.type} #{txn._id?.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-600 glossy-text"> {/* Applied glossy-text */}
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      txn.amount > 0 ? "text-green-600" : "text-red-600"
                    } glossy-text`} // Applied glossy-text
                  >
                    {txn.amount > 0 ? "+" : "-"}₦
                    {Math.abs(txn.amount).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      txn.status
                    )} glossy-text`} // Applied glossy-text
                  >
                    {formatTransactionStatus(txn.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blog */}
      <section className="bg-white glossy-text">
        <NetBlog />
      </section>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
};

export default Home;