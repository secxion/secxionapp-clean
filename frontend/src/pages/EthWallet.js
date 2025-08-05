import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useSelector } from "react-redux";
import QrScanner from "react-qr-scanner";
import { EthContext } from "../Context/EthContext";
import SummaryApi from "../common";
import {
  CurrencyDollarIcon,
  FireIcon,
  CreditCardIcon,
  CubeTransparentIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon,
  QrCodeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const COUNTDOWN_DURATION = 600;
const LOCAL_STORAGE_KEY = "ethWithdrawalCountdownEnd";
const LOCAL_STORAGE_STATUS_KEY = "ethWithdrawalStatus";
const LOCAL_STORAGE_MESSAGE_KEY = "ethWithdrawalSuccessMessage";
const MAX_ADDRESS_HISTORY = 3;

const Notification = ({ type, message, onDismiss }) => {
  if (!message) return null;

  let bgColor, textColor, IconComponent;
  switch (type) {
    case "error":
      bgColor = "bg-red-500";
      textColor = "text-white";
      IconComponent = ExclamationCircleIcon;
      break;
    case "success":
      bgColor = "bg-green-500";
      textColor = "text-white";
      IconComponent = CheckCircleIcon;
      break;
    case "info":
      bgColor = "bg-blue-500";
      textColor = "text-white";
      IconComponent = InformationCircleIcon;
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      textColor = "text-yellow-900"; // Darker text for better contrast on yellow
      IconComponent = ExclamationCircleIcon; // Or ExclamationTriangleIcon
      break;
    default:
      bgColor = "bg-gray-700";
      textColor = "text-white";
      IconComponent = InformationCircleIcon;
  }

  return (
    <div className={`${bgColor} ${textColor} p-4 mb-4 rounded-md shadow-lg flex items-center justify-between animate-fadeIn`}>
      <div className="flex items-center">
        {IconComponent && <IconComponent className="h-6 w-6 mr-3 flex-shrink-0" />}
        <span className="text-sm">{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors">
          <XCircleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
const EthWallet = () => {
  const { user } = useSelector((state) => state.user);
  const {
    ethRate,
    gasFee,
    nairaBalance,
    ethBalance,
    fetchEthRate,
    fetchGasFee,
    fetchWalletBalance,
  } = useContext(EthContext);

  const [ethAddress, setEthAddress] = useState("");
  const [addressHistory, setAddressHistory] = useState([]);
  const [nairaWithdrawAmount, setNairaWithdrawAmount] = useState("");
  const [displayEthEquivalent, setDisplayEthEquivalent] = useState("0.000000");
  const [displayEthToSend, setDisplayEthToSend] = useState("0.000000");
  const [exactEthEquivalent, setExactEthEquivalent] = useState(null);
  const [exactEthToSend, setExactEthToSend] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" }); // type: 'error', 'success', 'info', 'warning'

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);
  const [rejectedNotice, setRejectedNotice] = useState("");


    // --- Refs ---
  const countdownRef = useRef(null);
  const statusIntervalRef = useRef(null);

  // --- Helper Functions ---
  const clearNotification = useCallback(() => setNotification({ type: "", message: "" }), []);

  const showNotification = useCallback((type, message, duration = 7000) => {
    setNotification({ type, message });
    if (duration && type !== 'info') { // Persistent info notifications might be desired for some cases
      setTimeout(clearNotification, duration);
    }
  }, [clearNotification]);


  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });


  const refreshWalletDataInternal = useCallback(async () => {
    try {
      await Promise.all([
        fetchEthRate(),
        fetchWalletBalance(user._id || user.id)
      ]);
      setLastUpdated(formatTime(new Date()));
    } catch (error) {
      showNotification("error", "Unable to refresh wallet data. Please try again.", 5000);
      console.error("refreshWalletData error:", error);
    }
  }, [fetchEthRate, fetchWalletBalance, user, showNotification]);



  const refreshWalletData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true); else setIsInitialLoading(true);
    // Do not clear notification on auto-refresh, only on manual or initial.
    if (isManualRefresh || isInitialLoading) clearNotification(); 
    
    await refreshWalletDataInternal();
    
    if (isManualRefresh) setIsRefreshing(false); else setIsInitialLoading(false);
  }, [refreshWalletDataInternal, clearNotification, isInitialLoading]);

    const refreshGasFeeData = useCallback(async () => {
    try {
      await fetchGasFee();
    } catch (error) {
      console.error("refreshGasFee error:", error);
      showNotification("warning", "Could not update gas fee estimate. Calculations might use a stale value.", 3000);
    }
  }, [fetchGasFee, showNotification]);

  const refreshGasFee = async () => {
    try {
      await fetchGasFee();
    } catch (error) {
      console.error("refreshGasFee error:", error);
    }
  };

  const resetLocalStorageIfNoRequests = async () => {
    try {
      const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && (!data.status || data.status === "")) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_STATUS_KEY);
        localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
        setCountdown(0);
        setWithdrawalStatus(null);
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("Error checking withdrawal reset status:", err);
    }
  };

  useEffect(() => {
    const storedEndTimestamp = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedStatus = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
    const storedMessage = localStorage.getItem(LOCAL_STORAGE_MESSAGE_KEY);

    if (storedEndTimestamp) {
      const endTime = parseInt(storedEndTimestamp, 10);
      const now = Date.now();
      if (endTime > now) {
        const remainingSeconds = Math.floor((endTime - now) / 1000);
        setCountdown(remainingSeconds);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    if (storedStatus) {
      setWithdrawalStatus(storedStatus);
    }

    if (storedMessage) {
      setSuccessMessage(storedMessage);
    }

    refreshWalletData();
    refreshGasFee();
    resetLocalStorageIfNoRequests();

    const checkInitialWithdrawalStatus = async () => {
      try {
        const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
  const normalizedStatus = data.status.toLowerCase();

  if (["paid", "processed"].includes(normalizedStatus)) {
    setWithdrawalStatus("paid");
    setSuccessMessage(`Transaction Successful! Your last withdrawal is ${normalizedStatus}.`);
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "paid");
    localStorage.setItem(LOCAL_STORAGE_MESSAGE_KEY, `Transaction Successful! Your last withdrawal is ${normalizedStatus}.`);
    setCountdown(0);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else if (normalizedStatus === "pending") {
    setWithdrawalStatus("pending");
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "pending");
    setRejectedNotice("");
  } else if (normalizedStatus === "rejected") {
    setWithdrawalStatus("rejected");
    setSuccessMessage("");
    setRejectedNotice("Last pending transaction was rejected. Please try again or contact support.");
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "rejected");
    localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    setWithdrawalStatus(normalizedStatus);
  }
}

      } catch (err) {
        console.error("Error checking initial withdrawal status:", err);
      }
    };

    checkInitialWithdrawalStatus();
    const interval = setInterval(refreshWalletData, 900000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
 if (withdrawalStatus === "pending" || withdrawalStatus === "rejected") {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    statusIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
          const normalizedStatus = data.status.toLowerCase();
          if (["paid", "processed"].includes(normalizedStatus)) {
            setWithdrawalStatus("paid");
            setSuccessMessage(`Transaction Successful! Your withdrawal is ${normalizedStatus}.`);
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "paid");
            localStorage.setItem(LOCAL_STORAGE_MESSAGE_KEY, `Transaction Successful! Your withdrawal is ${normalizedStatus}.`);
            setCountdown(0);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            clearInterval(countdownRef.current);
            clearInterval(statusIntervalRef.current);
          } else if (normalizedStatus === "pending") {
            setWithdrawalStatus("pending");
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "pending");
            setRejectedNotice("");
          } else if (normalizedStatus === "rejected") {
            setWithdrawalStatus("rejected");
            setSuccessMessage("");
            setRejectedNotice("Last pending transaction was rejected. Please try again or contact support.");
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "rejected");
            localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
            setCountdown(0);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            clearInterval(countdownRef.current);
            clearInterval(statusIntervalRef.current);
          } else {
            setWithdrawalStatus(normalizedStatus);
          }
        }
      } catch (err) {
        console.error("Failed to fetch withdrawal status");
      }
    }, 3000);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(statusIntervalRef.current);
    };
  }
}, [countdown, withdrawalStatus]);


 useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("eth_addresses") || "[]");
  const userSpecific = stored.filter(
    (addr) => addr.userId === user._id || addr.userId === user.id
  );
  setAddressHistory(userSpecific.map((a) => a.address).slice(0, MAX_ADDRESS_HISTORY));
}, [user]);


  useEffect(() => {
    const naira = parseFloat(nairaWithdrawAmount);
    const rate = parseFloat(ethRate);
    const fee = parseFloat(gasFee);

    if (naira > 0 && rate > 0) {
      const ethAmount = naira / rate;
      const ethAfterFee = ethAmount - fee;
      setExactEthEquivalent(ethAmount);
      setExactEthToSend(ethAfterFee > 0 ? ethAfterFee : 0);
      setDisplayEthEquivalent(ethAmount.toFixed(6));
      setDisplayEthToSend(ethAfterFee > 0 ? ethAfterFee.toFixed(6) : "0.000000");
    } else {
      setDisplayEthEquivalent("0.000000");
      setDisplayEthToSend("0.000000");
      setExactEthEquivalent(null);
      setExactEthToSend(null);
    }
  }, [nairaWithdrawAmount, ethRate, gasFee]);

const handleWithdrawRequest = async () => {
  setErrorMessage("");
  setSuccessMessage("");
  setRejectedNotice("");

  if (withdrawalStatus === "pending") {
    setErrorMessage("Please wait, your last transaction is still pending.");
    return;
  }

  if (!ethAddress.trim() || !nairaWithdrawAmount || isNaN(nairaWithdrawAmount) || parseFloat(nairaWithdrawAmount) <= 0) {
    setErrorMessage("Please enter a valid ETH address and amount.");
    return;
  }

  setWithdrawLoading(true);
  try {
    const payload = {
      ethRecipientAddress: ethAddress,
      nairaRequestedAmount: parseFloat(nairaWithdrawAmount),
      ethCalculatedAmount: exactEthEquivalent,
      ethNetAmountToSend: exactEthToSend,
    };

    const res = await fetch(SummaryApi.ethWithdrawal.url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Withdrawal failed.");

    setSuccessMessage("Withdrawal submitted and processing.");
    setWithdrawalStatus("pending");

    const countdownEnd = Date.now() + COUNTDOWN_DURATION * 1000;
    localStorage.setItem(LOCAL_STORAGE_KEY, countdownEnd.toString());
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, "pending");
    localStorage.setItem(LOCAL_STORAGE_MESSAGE_KEY, "Withdrawal submitted and processing.");
    setCountdown(COUNTDOWN_DURATION);

    const existing = JSON.parse(localStorage.getItem("eth_addresses") || "[]");
    const userId = user._id || user.id;
    const filtered = existing.filter((entry) => entry.userId === userId && entry.address !== ethAddress);
    const updated = [{ userId, address: ethAddress }, ...filtered].slice(0, MAX_ADDRESS_HISTORY);
    setAddressHistory(updated.map((entry) => entry.address));
    localStorage.setItem("eth_addresses", JSON.stringify(updated));
  } catch (error) {
    setErrorMessage(error.message || "Error submitting withdrawal.");
  } finally {
    setWithdrawLoading(false);
  }
};

  const handleScanSuccess = useCallback((data) => {
    if (data?.text) {
      let scannedAddress = data.text;
      if (scannedAddress.startsWith("ethereum:")) { // Handle URI scheme
        scannedAddress = scannedAddress.split(":")[1]?.split("?")[0] || ""; // Extract address part
      }
      if (/^(0x)?[0-9a-fA-F]{40}$/.test(scannedAddress)) {
        setEthAddress(scannedAddress);
        setScannerVisible(false);
        showNotification("success", "ETH Address scanned successfully.", 3000);
      } else {
        showNotification("error", "Invalid QR code: Not a valid ETH address.", 4000);
      }
    }
  }, [showNotification]);

  const handleScanError = useCallback((err) => {
    console.error("QR Scanner Error:", err);
    showNotification("error", "QR Scanner error. Try again or enter address manually.", 4000);
    setScannerVisible(false); // Hide scanner on error to prevent broken UI
  }, [showNotification]);

 const renderCountdown = () => {
  if (countdown <= 0) return null;
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  return (
    <div className="mt-3 text-yellow-600 font-semibold">
      Processing: {mins}m {secs}s
    </div>
  );
};

return (
    <div className="p-10 max-w-full mt-16 mx-auto  sm:p-6 md:p-8 max-w-2xl sm:mt-16 mx-auto text-gray-200 bg-gray-800 shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">Ethereum Wallet</h2>
        <button
            onClick={() => refreshWalletData(true)}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-full hover:bg-gray-700"
            disabled={isRefreshing || withdrawLoading}
            title="Refresh Wallet Data"
        >
            <ArrowPathIcon className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification Area */}
      <Notification type={notification.type} message={notification.message} onDismiss={clearNotification} />

      {/* Wallet Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        {[
          { Icon: CurrencyDollarIcon, label: "ETH Rate (NGN)", value: `₦${parseFloat(ethRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '...'}`, color: "text-green-400" },
          { Icon: FireIcon, label: "Est. Gas Fee (ETH)", value: `${parseFloat(gasFee).toFixed(6) || '...'} ETH`, color: "text-red-400" },
          { Icon: CreditCardIcon, label: "Naira Balance", value: `₦${parseFloat(nairaBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '...'}`, color: "text-yellow-300" },
          { Icon: CubeTransparentIcon, label: "ETH Balance", value: `${parseFloat(ethBalance).toFixed(6) || '...'} ETH`, color: "text-blue-400" },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="flex items-start space-x-3">
            <Icon className={`h-6 w-6 ${color} mt-1 flex-shrink-0`} />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-semibold ${color}`}>{isInitialLoading ? 'Loading...' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {renderCountdown()}
      
      {/* Withdrawal Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleWithdrawRequest(); }} className="space-y-6">
          {/* ETH Address Input */}
          <div>
            <label htmlFor="ethAddress" className="block mb-1.5 text-sm font-medium text-gray-300">Recipient ETH Address</label>
            <div className="relative flex items-center">
              <input
                id="ethAddress"
                type="text"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                placeholder="Enter or scan 0x..."
                className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500"
                disabled={countdown > 0 || withdrawLoading || withdrawalStatus === 'pending'}
                aria-label="Recipient ETH Address"
              />
               <button
                type="button"
                onClick={() => setScannerVisible((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-600 transition-colors"
                title={scannerVisible ? "Hide QR Scanner" : "Scan QR Code"}
                disabled={countdown > 0 || withdrawLoading || withdrawalStatus === 'pending'}
                aria-label={scannerVisible ? "Hide QR Scanner" : "Scan QR Code for ETH Address"}
              >
                {scannerVisible ? <EyeSlashIcon className="h-5 w-5" /> : <QrCodeIcon className="h-5 w-5" />}
              </button>
            </div>
            {addressHistory.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-gray-400">Recent:</span>
                {addressHistory.map((addr, index) => (
                  <button
                    type="button"
                    key={index}
                    className="ml-2 text-xs text-blue-400 hover:text-blue-300 hover:underline focus:outline-none disabled:text-gray-500 disabled:no-underline"
                    onClick={() => setEthAddress(addr)}
                    disabled={countdown > 0 || withdrawLoading || withdrawalStatus === 'pending'}
                    title={`Use address: ${addr}`}
                  >
                    {`${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {scannerVisible && !withdrawLoading && countdown <= 0 && withdrawalStatus !== 'pending' && (
            <div className="my-4 p-3 bg-gray-700 rounded-lg shadow-md">
              <QrScanner
                delay={300}
                constraints={{ video: { facingMode: "environment" } }} // Prefer back camera
                style={{ width: "100%", borderRadius: "8px", maxHeight: "300px" }}
                onScan={handleScanSuccess}
                onError={handleScanError}
              />
              <p className="text-xs text-center text-gray-400 mt-2">Point your camera at an ETH address QR code.</p>
            </div>
          )}

          <div>
            <label htmlFor="nairaAmount" className="block mb-1.5 text-sm font-medium text-gray-300">Amount to Withdraw (NGN)</label>
            <input
              id="nairaAmount"
              type="number"
              value={nairaWithdrawAmount}
              onChange={(e) => setNairaWithdrawAmount(e.target.value)}
              placeholder="e.g., 50000"
              min="1"
              step="any" 
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500"
              disabled={countdown > 0 || withdrawLoading || withdrawalStatus === 'pending'}
              aria-label="Amount to Withdraw in Naira"
            />
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg space-y-3 text-sm border border-gray-700">
            <p className="flex justify-between items-center text-gray-300">
              <span>Est. ETH Equivalent:</span>
              <span className="font-medium text-blue-300">{displayEthEquivalent} ETH</span>
            </p>
            <p className="flex justify-between items-center text-gray-300">
              <span>Est. ETH to Send (after fee):</span>
              <span className="font-medium text-green-300">{displayEthToSend} ETH</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            disabled={withdrawLoading || countdown > 0 || withdrawalStatus === 'pending' || isInitialLoading || !nairaWithdrawAmount || parseFloat(nairaWithdrawAmount) <= 0 || !ethAddress || exactEthToSend <= 0}
          >
            {withdrawLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CreditCardIcon className="h-5 w-5" /> // Or an ETH specific icon if available
            )}
            <span>
              {withdrawLoading
                ? "Processing..."
                : countdown > 0 || withdrawalStatus === 'pending'
                ? "Request Pending"
                : "Request ETH Withdrawal"}
            </span>
          </button>
      </form>
      
      {lastUpdated && (
        <p className="mt-8 text-xs text-gray-500 text-center">
          <ClockIcon className="h-3.5 w-3.5 inline mr-1 align-middle" /> 
          Wallet data last updated: {lastUpdated}
        </p>
      )}
    </div>  
  );
};


export default EthWallet;
