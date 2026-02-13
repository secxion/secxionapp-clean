import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import QrScanner from 'react-qr-scanner';
import { EthContext } from '../Context/EthContext';
import SummaryApi from '../common';
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
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const COUNTDOWN_DURATION = 600;
const LOCAL_STORAGE_KEY = 'ethWithdrawalCountdownEnd';
const LOCAL_STORAGE_STATUS_KEY = 'ethWithdrawalStatus';
const LOCAL_STORAGE_MESSAGE_KEY = 'ethWithdrawalSuccessMessage';
const MAX_ADDRESS_HISTORY = 3;

const Notification = ({ type, message, onDismiss }) => {
  if (!message) return null;

  let bgColor, textColor, IconComponent;
  switch (type) {
    case 'error':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      IconComponent = ExclamationCircleIcon;
      break;
    case 'success':
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      IconComponent = CheckCircleIcon;
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      IconComponent = InformationCircleIcon;
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-yellow-900';
      IconComponent = ExclamationCircleIcon;
      break;
    default:
      bgColor = 'bg-gray-700';
      textColor = 'text-white';
      IconComponent = InformationCircleIcon;
  }

  return (
    <div
      className={`${bgColor} ${textColor} p-4 mb-4 rounded-md shadow-lg flex items-center justify-between animate-fadeIn`}
    >
      <div className="flex items-center">
        {IconComponent && (
          <IconComponent className="h-6 w-6 mr-3 flex-shrink-0" />
        )}
        <span className="text-sm">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors"
          aria-label="dismiss notification"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const SERVICE_FEE_PERCENT = 1.5; // default service fee if context doesn't provide one

const EthWallet = () => {
  const { user } = useSelector((state) => state.user || {});
  const {
    ethRate,
    gasFee,
    nairaBalance,
    ethBalance,
    fetchEthRate,
    fetchGasFee,
    fetchWalletBalance,
    serviceFeePercent = SERVICE_FEE_PERCENT,
  } = useContext(EthContext);

  const [ethAddress, setEthAddress] = useState('');
  const [addressHistory, setAddressHistory] = useState([]);
  const [nairaWithdrawAmount, setNairaWithdrawAmount] = useState('');
  const [displayEthEquivalent, setDisplayEthEquivalent] = useState('0.000000');
  const [displayEthToSend, setDisplayEthToSend] = useState('0.000000');
  const [exactEthEquivalent, setExactEthEquivalent] = useState(null);
  const [exactEthToSend, setExactEthToSend] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);
  const [rejectedNotice, setRejectedNotice] = useState('');

  // Refs for intervals
  const countdownRef = useRef(null);
  const statusIntervalRef = useRef(null);

  // notification helpers
  const clearNotification = useCallback(
    () => setNotification({ type: '', message: '' }),
    [],
  );
  const showNotification = useCallback(
    (type, message, duration = 7000) => {
      setNotification({ type, message });
      if (duration && type !== 'info') setTimeout(clearNotification, duration);
    },
    [clearNotification],
  );

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

  // refresh wallet data (rate + balance)
  const refreshWalletDataInternal = useCallback(async () => {
    try {
      await Promise.all([
        fetchEthRate && fetchEthRate(),
        fetchWalletBalance && fetchWalletBalance(user?._id || user?.id),
      ]);
      setLastUpdated(formatTime(new Date()));
    } catch (error) {
      showNotification(
        'error',
        'Unable to refresh wallet data. Please try again.',
        5000,
      );
      console.error('refreshWalletData error:', error);
    }
  }, [fetchEthRate, fetchWalletBalance, user, showNotification]);

  const refreshWalletData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsInitialLoading(true);
      if (isManualRefresh || isInitialLoading) clearNotification();

      await refreshWalletDataInternal();

      if (isManualRefresh) setIsRefreshing(false);
      else setIsInitialLoading(false);
    },
    [refreshWalletDataInternal, clearNotification, isInitialLoading],
  );

  // refresh gas fee data
  const refreshGasFeeData = useCallback(async () => {
    try {
      if (fetchGasFee) await fetchGasFee();
    } catch (error) {
      console.error('refreshGasFee error:', error);
      showNotification(
        'warning',
        'Could not update gas fee estimate. Calculations might use a stale value.',
        3000,
      );
    }
  }, [fetchGasFee, showNotification]);

  const refreshGasFee = async () => {
    try {
      if (fetchGasFee) await fetchGasFee();
    } catch (error) {
      console.error('refreshGasFee error:', error);
    }
  };

  // Reset localStorage if no requests exist on server
  const resetLocalStorageIfNoRequests = async () => {
    try {
      const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && (!data.status || data.status === '')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_STATUS_KEY);
        localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
        setCountdown(0);
        setWithdrawalStatus(null);
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Error checking withdrawal reset status:', err);
    }
  };

  // initial mount: restore local state, refresh data, check status
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

    // fetch fresh data
    refreshWalletData();
    refreshGasFee();
    resetLocalStorageIfNoRequests();

    // check current withdrawal status from server and normalize
    const checkInitialWithdrawalStatus = async () => {
      try {
        const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.status) {
          const normalizedStatus = data.status.toLowerCase();

          if (['paid', 'processed'].includes(normalizedStatus)) {
            setWithdrawalStatus('paid');
            setSuccessMessage(
              `Transaction Successful! Your last withdrawal is ${normalizedStatus}.`,
            );
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'paid');
            localStorage.setItem(
              LOCAL_STORAGE_MESSAGE_KEY,
              `Transaction Successful! Your last withdrawal is ${normalizedStatus}.`,
            );
            setCountdown(0);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else if (normalizedStatus === 'pending') {
            setWithdrawalStatus('pending');
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'pending');
            setRejectedNotice('');
          } else if (normalizedStatus === 'rejected') {
            setWithdrawalStatus('rejected');
            setSuccessMessage('');
            setRejectedNotice(
              'Last pending transaction was rejected. Please try again or contact support.',
            );
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'rejected');
            localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else {
            setWithdrawalStatus(normalizedStatus);
          }
        }
      } catch (err) {
        console.error('Error checking initial withdrawal status:', err);
      }
    };

    checkInitialWithdrawalStatus();

    const interval = setInterval(refreshWalletData, 900000); // 15m
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Poll server for status when there's a pending/rejected withdrawal; manage countdown
  useEffect(() => {
    if (withdrawalStatus === 'pending' || withdrawalStatus === 'rejected') {
      // start countdown interval if one isn't running
      if (!countdownRef.current) {
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // poll withdrawal status from server
      if (!statusIntervalRef.current) {
        statusIntervalRef.current = setInterval(async () => {
          try {
            const res = await fetch(`${SummaryApi.withdrawalStatus.url}`, {
              method: 'GET',
              credentials: 'include',
            });
            const data = await res.json();
            if (res.ok && data.status) {
              const normalizedStatus = data.status.toLowerCase();
              if (['paid', 'processed'].includes(normalizedStatus)) {
                setWithdrawalStatus('paid');
                setSuccessMessage(
                  `Transaction Successful! Your withdrawal is ${normalizedStatus}.`,
                );
                localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'paid');
                localStorage.setItem(
                  LOCAL_STORAGE_MESSAGE_KEY,
                  `Transaction Successful! Your withdrawal is ${normalizedStatus}.`,
                );
                setCountdown(0);
                localStorage.removeItem(LOCAL_STORAGE_KEY);

                // clear intervals
                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
                if (statusIntervalRef.current) {
                  clearInterval(statusIntervalRef.current);
                  statusIntervalRef.current = null;
                }
              } else if (normalizedStatus === 'pending') {
                setWithdrawalStatus('pending');
                localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'pending');
                setRejectedNotice('');
              } else if (normalizedStatus === 'rejected') {
                setWithdrawalStatus('rejected');
                setSuccessMessage('');
                setRejectedNotice(
                  'Last pending transaction was rejected. Please try again or contact support.',
                );
                localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'rejected');
                localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
                setCountdown(0);
                localStorage.removeItem(LOCAL_STORAGE_KEY);

                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
                if (statusIntervalRef.current) {
                  clearInterval(statusIntervalRef.current);
                  statusIntervalRef.current = null;
                }
              } else {
                setWithdrawalStatus(normalizedStatus);
              }
            }
          } catch (err) {
            console.error('Failed to fetch withdrawal status', err);
          }
        }, 3000);
      }

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      };
    }
  }, [withdrawalStatus, countdown]);

  // Calculate ETH equivalent and net to send when dependencies change
  useEffect(() => {
    const naira = parseFloat(nairaWithdrawAmount);
    const rate = parseFloat(ethRate) || 0;
    const fee = parseFloat(gasFee) || 0; // gasFee should be ETH already (from your EthContext)
    const svcPercent = parseFloat(serviceFeePercent) || SERVICE_FEE_PERCENT;
    const serviceFeeRate = svcPercent / 100;

    if (naira > 0 && rate > 0) {
      const ethAmount = naira / rate;
      const serviceFee = ethAmount * serviceFeeRate;
      const ethAfterFee = ethAmount - fee - serviceFee;

      setExactEthEquivalent(ethAmount);
      setExactEthToSend(ethAfterFee > 0 ? ethAfterFee : 0);
      // Full precision display - no artificial rounding
      setDisplayEthEquivalent(ethAmount.toPrecision(10));
      setDisplayEthToSend(ethAfterFee > 0 ? ethAfterFee.toPrecision(10) : '0');
    } else {
      setDisplayEthEquivalent('0');
      setDisplayEthToSend('0');
      setExactEthEquivalent(null);
      setExactEthToSend(null);
    }
  }, [nairaWithdrawAmount, ethRate, gasFee, serviceFeePercent]);

  const handleWithdrawRequest = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setRejectedNotice('');

    if (withdrawalStatus === 'pending') {
      setErrorMessage('Please wait, your last transaction is still pending.');
      return;
    }

    if (
      !ethAddress.trim() ||
      !nairaWithdrawAmount ||
      isNaN(nairaWithdrawAmount) ||
      parseFloat(nairaWithdrawAmount) <= 0
    ) {
      setErrorMessage('Please enter a valid ETH address and amount.');
      return;
    }

    setWithdrawLoading(true);
    try {
      // payload includes service fee info and computed eth amounts for server-side enforcement
      const payload = {
        ethRecipientAddress: ethAddress,
        nairaRequestedAmount: parseFloat(nairaWithdrawAmount),
        ethCalculatedAmount: exactEthEquivalent,
        ethNetAmountToSend: exactEthToSend,
        serviceFeePercent: serviceFeePercent,
      };

      const res = await fetch(SummaryApi.ethWithdrawal.url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed.');

      setSuccessMessage('Withdrawal submitted and processing.');
      setWithdrawalStatus('pending');

      const countdownEnd = Date.now() + COUNTDOWN_DURATION * 1000;
      localStorage.setItem(LOCAL_STORAGE_KEY, countdownEnd.toString());
      localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'pending');
      localStorage.setItem(
        LOCAL_STORAGE_MESSAGE_KEY,
        'Withdrawal submitted and processing.',
      );
      setCountdown(COUNTDOWN_DURATION);

      // update recent address history
      const existing = JSON.parse(
        localStorage.getItem('eth_addresses') || '[]',
      );
      const userId = user?._id || user?.id;
      const filtered = existing.filter(
        (entry) => entry.userId === userId && entry.address !== ethAddress,
      );
      const updated = [{ userId, address: ethAddress }, ...filtered].slice(
        0,
        MAX_ADDRESS_HISTORY,
      );
      setAddressHistory(updated.map((entry) => entry.address));
      localStorage.setItem('eth_addresses', JSON.stringify(updated));
    } catch (error) {
      setErrorMessage(error.message || 'Error submitting withdrawal.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // QR scan success handler
  const handleScanSuccess = useCallback(
    (data) => {
      if (data?.text) {
        let scannedAddress = data.text;
        // support "ethereum:0x..." URIs with optional query params
        if (scannedAddress.toLowerCase().startsWith('ethereum:')) {
          scannedAddress = scannedAddress.split(':')[1]?.split('?')[0] || '';
        }

        // basic ETH address check
        if (/^(0x)?[0-9a-fA-F]{40}$/.test(scannedAddress)) {
          setEthAddress(scannedAddress);
          setScannerVisible(false);
          showNotification(
            'success',
            'ETH address scanned successfully.',
            3000,
          );
        } else {
          showNotification(
            'error',
            'Invalid QR code: Not a valid ETH address.',
            4000,
          );
        }
      }
    },
    [showNotification],
  );

  const handleScanError = useCallback(
    (err) => {
      console.error('QR Scanner Error:', err);
      showNotification(
        'error',
        'QR Scanner error. Try again or enter address manually.',
        4000,
      );
      setScannerVisible(false);
    },
    [showNotification],
  );

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

  // small helper to dismiss error/success
  const dismissError = () => setErrorMessage('');
  const dismissSuccess = () => setSuccessMessage('');

  // derived values to display safely - full precision, no rounding
  const gasFeeFloat = parseFloat(gasFee) || 0;
  const gasFeeDisplay = gasFee || '0'; // Use raw string value from context
  const svcPercent = parseFloat(serviceFeePercent) || SERVICE_FEE_PERCENT;
  const svcAmountDisplay = exactEthEquivalent
    ? (exactEthEquivalent * (svcPercent / 100)).toPrecision(10)
    : '0';

  return (
    <div className="p-10 max-w-full mt-16 mx-auto sm:p-6 md:p-8 max-w-2xl sm:mt-16 text-gray-200 bg-gray-800 shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          Ethereum Wallet
        </h2>
        <button
          onClick={() => refreshWalletData(true)}
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-full hover:bg-gray-700"
          disabled={isRefreshing || withdrawLoading}
          title="Refresh Wallet Data"
        >
          <ArrowPathIcon
            className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* transient notifications */}
      <Notification
        type={notification.type}
        message={notification.message}
        onDismiss={clearNotification}
      />
      {errorMessage && (
        <Notification
          type="error"
          message={errorMessage}
          onDismiss={dismissError}
        />
      )}
      {successMessage && (
        <Notification
          type="success"
          message={successMessage}
          onDismiss={dismissSuccess}
        />
      )}

      {/* Wallet Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        {[
          {
            Icon: CurrencyDollarIcon,
            label: 'ETH Rate (NGN)',
            value: ethRate
              ? `₦${parseFloat(ethRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '...',
            color: 'text-green-400',
          },
          {
            Icon: FireIcon,
            label: 'Est. Gas Fee (ETH)',
            value: `${gasFeeDisplay} ETH`,
            color: 'text-red-400',
          },
          {
            Icon: CreditCardIcon,
            label: 'Naira Balance',
            value:
              nairaBalance !== null && nairaBalance !== undefined
                ? `₦${parseFloat(nairaBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '...',
            color: 'text-yellow-300',
          },
          {
            Icon: CubeTransparentIcon,
            label: 'ETH Balance',
            value:
              ethBalance !== null && ethBalance !== undefined
                ? `${parseFloat(ethBalance).toFixed(6)} ETH`
                : '...',
            color: 'text-blue-400',
          },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="flex items-start space-x-3">
            <Icon className={`h-6 w-6 ${color} mt-1 flex-shrink-0`} />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-semibold ${color}`}>
                {isInitialLoading ? 'Loading...' : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {renderCountdown()}

      {/* Withdrawal Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleWithdrawRequest();
        }}
        className="space-y-6"
      >
        {/* ETH Address Input */}
        <div>
          <label
            htmlFor="ethAddress"
            className="block mb-1.5 text-sm font-medium text-gray-300"
          >
            Recipient ETH Address
          </label>
          <div className="relative flex items-center">
            <input
              id="ethAddress"
              type="text"
              value={ethAddress}
              onChange={(e) => setEthAddress(e.target.value)}
              placeholder="Enter or scan 0x..."
              className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500"
              disabled={
                countdown > 0 ||
                withdrawLoading ||
                withdrawalStatus === 'pending'
              }
              aria-label="Recipient ETH Address"
            />
            <button
              type="button"
              onClick={() => setScannerVisible((prev) => !prev)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-600 transition-colors"
              title={scannerVisible ? 'Hide QR Scanner' : 'Scan QR Code'}
              disabled={
                countdown > 0 ||
                withdrawLoading ||
                withdrawalStatus === 'pending'
              }
              aria-label={
                scannerVisible
                  ? 'Hide QR Scanner'
                  : 'Scan QR Code for ETH Address'
              }
            >
              {scannerVisible ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <QrCodeIcon className="h-5 w-5" />
              )}
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
                  disabled={
                    countdown > 0 ||
                    withdrawLoading ||
                    withdrawalStatus === 'pending'
                  }
                  title={`Use address: ${addr}`}
                >
                  {`${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* QR Scanner */}
        {scannerVisible &&
          !withdrawLoading &&
          countdown <= 0 &&
          withdrawalStatus !== 'pending' && (
            <div className="my-4 p-3 bg-gray-700 rounded-lg shadow-md">
              <QrScanner
                delay={300}
                constraints={{ video: { facingMode: 'environment' } }}
                style={{ width: '100%', borderRadius: 8, maxHeight: 300 }}
                onScan={handleScanSuccess}
                onError={handleScanError}
              />
              <p className="text-xs text-center text-gray-400 mt-2">
                Point your camera at an ETH address QR code.
              </p>
            </div>
          )}

        {/* Naira amount */}
        <div>
          <label
            htmlFor="nairaAmount"
            className="block mb-1.5 text-sm font-medium text-gray-300"
          >
            Amount to Withdraw (NGN)
          </label>
          <input
            id="nairaAmount"
            type="number"
            value={nairaWithdrawAmount}
            onChange={(e) => setNairaWithdrawAmount(e.target.value)}
            placeholder="e.g., 50000"
            min="1"
            step="any"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500"
            disabled={
              countdown > 0 || withdrawLoading || withdrawalStatus === 'pending'
            }
            aria-label="Amount to Withdraw in Naira"
          />
        </div>

        {/* Fee breakdown */}
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-3 text-sm border border-gray-700">
          <p className="flex justify-between items-center text-gray-300">
            <span>Est. ETH Equivalent:</span>
            <span className="font-medium text-blue-300">
              {displayEthEquivalent} ETH
            </span>
          </p>
          <p className="flex justify-between items-center text-gray-300">
            <span>Network Gas Fee:</span>
            <span className="font-medium text-red-300">
              {gasFeeDisplay} ETH
            </span>
          </p>
          <p className="flex justify-between items-center text-gray-300">
            <span>Service Fee ({svcPercent}%):</span>
            <span className="font-medium text-yellow-300">
              {svcAmountDisplay} ETH
            </span>
          </p>
          <p className="flex justify-between items-center text-gray-300">
            <span>Net ETH to Send:</span>
            <span className="font-medium text-green-300">
              {displayEthToSend} ETH
            </span>
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          disabled={
            withdrawLoading ||
            countdown > 0 ||
            withdrawalStatus === 'pending' ||
            isInitialLoading ||
            !nairaWithdrawAmount ||
            parseFloat(nairaWithdrawAmount) <= 0 ||
            !ethAddress ||
            (exactEthToSend !== null && exactEthToSend <= 0)
          }
        >
          {withdrawLoading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <CreditCardIcon className="h-5 w-5" />
          )}
          <span>
            {withdrawLoading
              ? 'Processing...'
              : countdown > 0 || withdrawalStatus === 'pending'
                ? 'Request Pending'
                : 'Request ETH Withdrawal'}
          </span>
        </button>
      </form>

      {lastUpdated && (
        <p className="mt-8 text-xs text-gray-500 text-center">
          <ClockIcon className="h-3.5 w-3.5 inline mr-1 align-middle" /> Wallet
          data last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
};

export default EthWallet;
