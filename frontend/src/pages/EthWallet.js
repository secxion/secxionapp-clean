import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  QrCodeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { emitTransactionActivity } from '../utils/transactionEvents';
import { createIdempotencyKey } from '../utils/idempotency';
import BackButton from '../Components/BackButton';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const COUNTDOWN_DURATION = 600;
const LOCAL_STORAGE_KEY = 'ethWithdrawalCountdownEnd';
const LOCAL_STORAGE_STATUS_KEY = 'ethWithdrawalStatus';
const LOCAL_STORAGE_MESSAGE_KEY = 'ethWithdrawalSuccessMessage';
const LOCAL_STORAGE_REQUEST_ID_KEY = 'ethWithdrawalRequestId';
const LOCAL_STORAGE_ACKNOWLEDGED_REQUEST_ID_KEY =
  'ethWithdrawalAcknowledgedRequestId';
const MAX_ADDRESS_HISTORY = 3;
const LIVE_REFRESH_INTERVAL_MS = 60000;

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

const WithdrawalLimitDialog = ({ message, onClose, onCompleteKyc }) => {
  useEffect(() => {
    if (!message) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="withdrawal-limit-title"
        aria-describedby="withdrawal-limit-message"
        className="w-full max-w-md rounded-lg border border-red-500/40 bg-brand-dark-elevated p-6 text-white shadow-2xl sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/15 p-2 text-red-400">
              <ExclamationCircleIcon className="h-6 w-6" />
            </div>
            <h2
              id="withdrawal-limit-title"
              className="font-spaceGrotesk text-lg font-black uppercase tracking-tight"
            >
              Verification Required
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close withdrawal limit dialog"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <p
          id="withdrawal-limit-message"
          className="text-sm leading-7 text-gray-300"
        >
          {message}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-brand-dark-base px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onCompleteKyc}
            autoFocus
            className="rounded-lg border border-brand-gold bg-brand-gold px-5 py-3 text-xs font-black uppercase tracking-widest text-brand-dark-base transition-colors hover:bg-brand-gold-light"
          >
            Complete KYC
          </button>
        </div>
      </div>
    </div>
  );
};

const SERVICE_FEE_PERCENT = 1.5; // default service fee if context doesn't provide one

const EthWallet = () => {
  const navigate = useNavigate();
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

  const [scannerVisible, setScannerVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [withdrawalLimitMessage, setWithdrawalLimitMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);
  const [rejectedNotice, setRejectedNotice] = useState('');

  // Refs for intervals
  const countdownRef = useRef(null);
  const statusIntervalRef = useRef(null);
  const withdrawalIdempotencyKeyRef = useRef('');

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
    async (options = {}) => {
      const { isManualRefresh = false, showInitialLoading = false } = options;

      if (isManualRefresh) setIsRefreshing(true);
      if (showInitialLoading) setIsInitialLoading(true);
      if (isManualRefresh || showInitialLoading) clearNotification();

      await refreshWalletDataInternal();

      if (isManualRefresh) setIsRefreshing(false);
      if (showInitialLoading) setIsInitialLoading(false);
    },
    [refreshWalletDataInternal, clearNotification],
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
        localStorage.removeItem(LOCAL_STORAGE_REQUEST_ID_KEY);
        localStorage.removeItem(LOCAL_STORAGE_ACKNOWLEDGED_REQUEST_ID_KEY);
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
    const storedRequestId = localStorage.getItem(LOCAL_STORAGE_REQUEST_ID_KEY);

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

    if (storedMessage && storedStatus !== 'paid') {
      setSuccessMessage(storedMessage);
    }

    // fetch fresh data
    refreshWalletData({ showInitialLoading: true });
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
            const requestId =
              data.requestId?.toString() ||
              storedRequestId ||
              'legacy-completed-withdrawal';
            const acknowledgedRequestId = localStorage.getItem(
              LOCAL_STORAGE_ACKNOWLEDGED_REQUEST_ID_KEY,
            );
            const message = `Transaction Successful! Your last withdrawal is ${normalizedStatus}.`;

            setWithdrawalStatus('paid');
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'paid');
            localStorage.setItem(LOCAL_STORAGE_REQUEST_ID_KEY, requestId);
            if (requestId !== acknowledgedRequestId) {
              setSuccessMessage(message);
              localStorage.setItem(LOCAL_STORAGE_MESSAGE_KEY, message);
            } else {
              setSuccessMessage('');
              localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
            }
            setCountdown(0);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else if (normalizedStatus === 'pending') {
            setWithdrawalStatus('pending');
            localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'pending');
            setRejectedNotice('');
            showNotification(
              'info',
              'Your previous transfer is still processing. The withdrawal form will unlock when it completes.',
              0,
            );
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

    const walletInterval = setInterval(
      refreshWalletData,
      LIVE_REFRESH_INTERVAL_MS,
    );
    const gasInterval = setInterval(
      refreshGasFeeData,
      LIVE_REFRESH_INTERVAL_MS,
    );

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshWalletData();
        refreshGasFeeData();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(walletInterval);
      clearInterval(gasInterval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
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
                const requestId =
                  data.requestId?.toString() ||
                  localStorage.getItem(LOCAL_STORAGE_REQUEST_ID_KEY) ||
                  'legacy-completed-withdrawal';
                const acknowledgedRequestId = localStorage.getItem(
                  LOCAL_STORAGE_ACKNOWLEDGED_REQUEST_ID_KEY,
                );
                const message = `Transaction Successful! Your withdrawal is ${normalizedStatus}.`;

                setWithdrawalStatus('paid');
                localStorage.setItem(LOCAL_STORAGE_REQUEST_ID_KEY, requestId);
                if (requestId !== acknowledgedRequestId) {
                  setSuccessMessage(message);
                  localStorage.setItem(LOCAL_STORAGE_MESSAGE_KEY, message);
                } else {
                  setSuccessMessage('');
                  localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);
                }
                emitTransactionActivity({
                  source: 'eth-withdrawal',
                  status: 'paid',
                });
                localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, 'paid');
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
                showNotification(
                  'info',
                  'Your previous transfer is still processing. The withdrawal form will unlock when it completes.',
                  0,
                );
              } else if (normalizedStatus === 'rejected') {
                setWithdrawalStatus('rejected');
                setSuccessMessage('');
                setRejectedNotice(
                  'Last pending transaction was rejected. Please try again or contact support.',
                );
                emitTransactionActivity({
                  source: 'eth-withdrawal',
                  status: 'rejected',
                });
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
      // Fixed precision for consistent layout
      setDisplayEthEquivalent(ethAmount.toFixed(8));
      setDisplayEthToSend(
        ethAfterFee > 0 ? ethAfterFee.toFixed(8) : '0.00000000',
      );
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
      if (!withdrawalIdempotencyKeyRef.current) {
        withdrawalIdempotencyKeyRef.current =
          createIdempotencyKey('eth_withdrawal');
      }

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
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': withdrawalIdempotencyKeyRef.current,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        let displayMessage = data.message || 'Withdrawal failed.';

        if (data.code === 'UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_REACHED') {
          const remaining = Number(data.remainingAmount);
          const remainingLine = Number.isFinite(remaining)
            ? ` Your non-KYC available withdrawal is ₦${remaining.toLocaleString()}.`
            : '';

          if (!displayMessage.includes('Your non-KYC available withdrawal')) {
            displayMessage = `${displayMessage}${remainingLine}`.trim();
          }

          setWithdrawalLimitMessage(displayMessage);
          return;
        }

        throw new Error(displayMessage);
      }

      setSuccessMessage('Withdrawal submitted and processing.');
      withdrawalIdempotencyKeyRef.current = '';
      setWithdrawalStatus('pending');
      const requestId = data.data?._id?.toString();
      if (requestId) {
        localStorage.setItem(LOCAL_STORAGE_REQUEST_ID_KEY, requestId);
      }
      emitTransactionActivity({
        source: 'eth-withdrawal',
        status: 'pending',
      });

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
      setErrorMessage(
        toUserSafeMessage(
          error,
          'We could not submit your ETH withdrawal. Please try again.',
        ),
      );
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
          withdrawalIdempotencyKeyRef.current = '';
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
  const dismissSuccess = () => {
    setSuccessMessage('');
    localStorage.removeItem(LOCAL_STORAGE_MESSAGE_KEY);

    if (withdrawalStatus === 'paid') {
      const requestId = localStorage.getItem(LOCAL_STORAGE_REQUEST_ID_KEY);
      if (requestId) {
        localStorage.setItem(
          LOCAL_STORAGE_ACKNOWLEDGED_REQUEST_ID_KEY,
          requestId,
        );
      }
    }
  };

  // derived values to display safely - full precision, no rounding
  const gasFeeDisplay = gasFee ? parseFloat(gasFee).toFixed(8) : '0.00000000';
  const svcPercent = parseFloat(serviceFeePercent) || SERVICE_FEE_PERCENT;
  const svcAmountDisplay = exactEthEquivalent
    ? (exactEthEquivalent * (svcPercent / 100)).toFixed(8)
    : '0.00000000';

  return (
    <div className="mt-28 p-4 sm:p-8 max-w-max mx-auto">
      <WithdrawalLimitDialog
        message={withdrawalLimitMessage}
        onClose={() => setWithdrawalLimitMessage('')}
        onCompleteKyc={() => navigate('/kyc')}
      />

      {/* Static Background only */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-grid-16"></div>
      </div>
      {/* Header Section */}
      <div className="border-b border-white/10 pb-8 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <BackButton fallbackTo="/home" className="mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
            Ethereum Wallet
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Secure Asset Liquidation & Transfer
          </p>
        </div>
        <button
          onClick={() => refreshWalletData({ isManualRefresh: true })}
          className="inline-flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 font-spaceGrotesk"
          disabled={isRefreshing || withdrawLoading}
          title="Refresh Data"
        >
          <ArrowPathIcon
            className={`h-4 w-4 text-brand-gold ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
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
      {rejectedNotice && (
        <Notification
          type="warning"
          message={rejectedNotice}
          onDismiss={() => setRejectedNotice('')}
        />
      )}

      {/* Wallet Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            Icon: CurrencyDollarIcon,
            label: 'Exchange Rate',
            value: ethRate
              ? `₦${parseFloat(ethRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '...',
            color: 'text-emerald-400',
            iconColor: 'bg-emerald-500/10 text-emerald-400',
          },
          {
            Icon: FireIcon,
            label: 'Network Fee',
            value: `${gasFeeDisplay} ETH`,
            color: 'text-red-400',
            iconColor: 'bg-red-500/10 text-red-400',
          },
          {
            Icon: CreditCardIcon,
            label: 'Naira Balance',
            value:
              nairaBalance !== null && nairaBalance !== undefined
                ? `₦${parseFloat(nairaBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '...',
            color: 'text-brand-gold',
            iconColor: 'bg-brand-gold/10 text-brand-gold',
          },
          {
            Icon: CubeTransparentIcon,
            label: 'ETH Balance',
            value:
              ethBalance !== null && ethBalance !== undefined
                ? `${parseFloat(ethBalance).toFixed(8)} ETH`
                : '...',
            color: 'text-sky-400',
            iconColor: 'bg-sky-500/10 text-sky-400',
          },
        ].map(({ Icon, label, value, color, iconColor }) => (
          <div
            key={label}
            className="glass-card rounded-2xl p-6 border-white/5 group hover:border-brand-gold/20 transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-center space-x-5">
              <div
                className={`p-3.5 rounded-xl ${iconColor} border border-white/5 transition-colors`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-spaceGrotesk">
                  {label}
                </p>
                <p
                  className={`text-lg font-black font-spaceGrotesk tracking-tighter ${color} mt-1 truncate`}
                >
                  {isInitialLoading ? '...' : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderCountdown()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 items-start">
        {/* Withdrawal Form */}
        <form
          id="eth-withdrawal-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleWithdrawRequest();
          }}
          className="lg:col-span-2 space-y-10"
        >
          <div className="space-y-8">
            <div className="group">
              <label
                htmlFor="ethAddress"
                className="block mb-4 text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.3em] group-focus-within:text-white transition-colors"
              >
                Recipient Wallet Address
              </label>
              <div className="relative flex items-center">
                <input
                  id="ethAddress"
                  type="text"
                  value={ethAddress}
                  onChange={(e) => {
                    withdrawalIdempotencyKeyRef.current = '';
                    setEthAddress(e.target.value);
                  }}
                  placeholder="0x..."
                  className="w-full pl-6 pr-14 py-5 rounded-2xl bg-black/20 text-white border border-white/10 focus:border-brand-gold/50 outline-none transition-all font-mono text-sm placeholder-gray-800"
                  disabled={
                    countdown > 0 ||
                    withdrawLoading ||
                    withdrawalStatus === 'pending'
                  }
                />
                <button
                  type="button"
                  onClick={() => setScannerVisible((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2.5 text-gray-500 hover:text-brand-gold transition-all active:scale-90"
                  disabled={
                    countdown > 0 ||
                    withdrawLoading ||
                    withdrawalStatus === 'pending'
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
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest py-1">
                    Recent:
                  </span>
                  {addressHistory.map((addr, index) => (
                    <button
                      type="button"
                      key={index}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-brand-gold transition-all"
                      onClick={() => {
                        withdrawalIdempotencyKeyRef.current = '';
                        setEthAddress(addr);
                      }}
                      disabled={
                        countdown > 0 ||
                        withdrawLoading ||
                        withdrawalStatus === 'pending'
                      }
                    >
                      {`${addr.substring(0, 8)}...${addr.substring(addr.length - 4)}`}
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
                <div className="my-8 overflow-hidden rounded-3xl border border-brand-gold/20 shadow-brand-gold">
                  <QrScanner
                    delay={300}
                    constraints={{ video: { facingMode: 'environment' } }}
                    style={{ width: '100%', maxHeight: 300 }}
                    onScan={handleScanSuccess}
                    onError={handleScanError}
                  />
                  <p className="p-4 bg-brand-gold/5 text-center text-[10px] font-black text-brand-gold uppercase tracking-widest border-t border-brand-gold/10">
                    Scanning for active address...
                  </p>
                </div>
              )}

            <div className="group">
              <label
                htmlFor="nairaAmount"
                className="block mb-4 text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.3em] group-focus-within:text-white transition-colors"
              >
                Withdrawal Amount (NGN)
              </label>
              <input
                id="nairaAmount"
                type="number"
                value={nairaWithdrawAmount}
                onChange={(e) => {
                  withdrawalIdempotencyKeyRef.current = '';
                  setNairaWithdrawAmount(e.target.value);
                }}
                placeholder="0.00"
                min="1"
                step="any"
                className="w-full px-6 py-5 rounded-2xl bg-black/20 text-white border border-white/10 focus:border-brand-gold/50 outline-none transition-all font-mono text-xl placeholder-gray-800"
                disabled={
                  countdown > 0 ||
                  withdrawLoading ||
                  withdrawalStatus === 'pending'
                }
              />
            </div>
          </div>
        </form>

        {/* Summary Sidebar */}
        <div className="space-y-8">
          <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
            <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk mb-10 text-center">
              Transaction Summary
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Gross Equivalent
                </span>
                <span className="text-white font-mono text-xs text-right">
                  {displayEthEquivalent} ETH
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Network Fee
                </span>
                <span className="text-red-400 font-mono text-xs text-right">
                  -{gasFeeDisplay} ETH
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Service Fee ({svcPercent}%)
                </span>
                <span className="text-brand-gold font-mono text-xs text-right">
                  -{svcAmountDisplay} ETH
                </span>
              </div>
              <div className="h-px bg-white/5 my-4"></div>
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-spaceGrotesk">
                  Net Withdrawal Amount
                </span>
                <span
                  className="text-emerald-400 text-2xl font-black font-spaceGrotesk tracking-tighter truncate"
                  title={exactEthToSend?.toString()}
                >
                  {displayEthToSend} <span className="text-sm">ETH</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            form="eth-withdrawal-form"
            className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base font-black font-spaceGrotesk text-sm uppercase tracking-[0.3em] py-6 rounded-2xl shadow-[0_10px_40px_rgba(212,175,55,0.2)] transition-all duration-500 transform active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group relative overflow-hidden"
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
            <div className="relative z-10 flex items-center justify-center gap-3">
              {withdrawLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CubeTransparentIcon className="h-5 w-5" />
                  <span>Request Transfer</span>
                </>
              )}
            </div>
          </button>

          <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <InformationCircleIcon className="w-4 h-4 text-brand-gold opacity-50" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Withdrawal Policy
              </span>
            </div>
            <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase tracking-tight">
              Transfers are processed within the blockchain sequence. Ensure
              recipient address is accurate before submission.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-center gap-3 border-t border-white/5 pt-8">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#4ade80]"></div>
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] font-spaceGrotesk">
          Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
};

export default EthWallet;
