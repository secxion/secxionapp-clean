import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import AddBankAccountForm from './AddBankAccountForm';
import { FaWallet, FaEye, FaEyeSlash } from 'react-icons/fa';

const PaymentRequestForm = ({
  fetchWalletBalance,
  walletBalance,
  openAddBankAccount,
  setOpenAddBankAccount,
  onClose,
  isDialog = false,
}) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [errorBankAccounts, setErrorBankAccounts] = useState('');
  const [showAddBankForm, setShowAddBankForm] = useState(false);

  const MIN_REQUEST_AMOUNT = 1000;

  const fetchBankAccounts = useCallback(async () => {
    if (!user?._id && !user?.id) return;

    setIsLoadingBankAccounts(true);
    setErrorBankAccounts('');
    try {
      const response = await fetch(SummaryApi.getBankAccounts.url, {
        method: SummaryApi.getBankAccounts.method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setBankAccounts(data.data);
      } else {
        setErrorBankAccounts(data.message || 'Failed to fetch bank accounts.');
      }
    } catch (err) {
      setErrorBankAccounts(
        'An unexpected error occurred while fetching bank accounts.',
      );
    } finally {
      setIsLoadingBankAccounts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBankAccounts();
    }
  }, [user, fetchBankAccounts]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formatted);
    setError('');
  };

  const handleWithdrawAll = () => {
    if (walletBalance !== null) {
      setAmount(walletBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setError('');
    }
  };

  const handlePaymentMethodChange = (e) => {
    const selected = e.target.value;
    setPaymentMethod(selected);
    if (selected === 'Ethereum') navigate('/eth');
  };

  const handleBankAccountChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setShowAddBankForm(true);
    } else {
      setSelectedBankAccount(value);
    }
  };

  const handleAddBankSuccess = () => {
    setShowAddBankForm(false);
    fetchBankAccounts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const parsedAmount = parseFloat(amount.replace(/,/g, ''));

    if (!parsedAmount || parsedAmount < MIN_REQUEST_AMOUNT) {
      setError(
        `Minimum request amount is ₦${MIN_REQUEST_AMOUNT.toLocaleString()}`,
      );
      setLoading(false);
      return;
    }

    if (parsedAmount > walletBalance) {
      setError(
        `Amount exceeds your wallet balance of ₦${walletBalance.toLocaleString()}`,
      );
      setLoading(false);
      return;
    }

    if (!selectedBankAccount) {
      setError('Please select a bank account.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(SummaryApi.createPayment.url, {
        method: SummaryApi.createPayment.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parsedAmount,
          paymentMethod,
          bankAccountId: selectedBankAccount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Payment request submitted!');
        setSuccessMessage(data.message);
        setAmount('');
        setSelectedBankAccount('');

        if (fetchWalletBalance) {
          fetchWalletBalance();
        }

        if (isDialog && onClose) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setError(data.message || 'Payment request failed.');
        toast.error(data.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      toast.error('Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${isDialog ? 'p-6' : 'mb-20 mx-auto px-4 mt-24 max-w-2xl'}`}
    >
      {showAddBankForm ? (
        <AddBankAccountForm
          onCancel={() => setShowAddBankForm(false)}
          onSuccess={handleAddBankSuccess}
        />
      ) : (
        <div
          className={`${isDialog ? 'space-y-6' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 shadow-2xl rounded-2xl p-8 space-y-8 border border-yellow-600/30 backdrop-blur-sm'}`}
        >
          {/* Enhanced Header - only show if not in dialog mode */}
          {!isDialog && (
            <div className="text-center border-b border-gray-700 pb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                  <FaWallet className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Withdraw Funds
                </h2>
              </div>
              <p className="text-gray-400">
                Request a withdrawal to your bank account
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="amount"
                className="block font-medium text-yellow-400 mb-2"
              >
                Amount to Withdraw
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                  ₦
                </span>
                <input
                  id="amount"
                  type="text"
                  className="w-full pl-10 pr-20 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm transition-all duration-200"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <button
                  type="button"
                  onClick={handleWithdrawAll}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                >
                  Max
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Minimum: ₦{MIN_REQUEST_AMOUNT.toLocaleString()}
              </p>
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-yellow-400 font-medium mb-2"
              >
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm transition-all duration-200"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Ethereum">Ethereum</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="bankAccount"
                className="block text-yellow-400 font-medium mb-2"
              >
                Bank Account
              </label>
              <select
                id="bankAccount"
                value={selectedBankAccount}
                onChange={handleBankAccountChange}
                className="w-full py-3 px-3 text-white bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm rounded-lg transition-all duration-200"
              >
                <option value="">Select a bank account</option>
                {isLoadingBankAccounts ? (
                  <option disabled>Loading...</option>
                ) : errorBankAccounts ? (
                  <option disabled>{errorBankAccounts}</option>
                ) : (
                  <>
                    {bankAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.accountNumber} ({account.bankName}) -{' '}
                        {account.accountHolderName}
                      </option>
                    ))}
                    <option value="add_new">+ Add New Bank Account</option>
                  </>
                )}
              </select>
            </div>

            <div className={`flex gap-4 ${isDialog ? 'pt-4' : ''}`}>
              {isDialog && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || isLoadingBankAccounts}
                className={`${isDialog ? 'flex-1' : 'w-full'} flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 py-3 rounded-lg shadow-lg font-semibold transition-all duration-200 ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-900"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0116 0h-2a6 6 0 00-12 0H4z"
                    />
                  </svg>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentRequestForm;
