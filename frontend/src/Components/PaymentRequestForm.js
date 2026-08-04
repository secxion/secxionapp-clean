import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import AddBankAccountForm from './AddBankAccountForm';
import { FaWallet, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

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
          className={`${isDialog ? 'space-y-6' : 'glass-card rounded-[28px] border border-white/10 bg-brand-dark-elevated/70 p-8 shadow-2xl backdrop-blur-xl space-y-8'}`}
        >
          {/* Header - only show if not in dialog mode */}
          {!isDialog && (
            <div className="text-center border-b border-white/10 pb-10">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-4 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 shadow-brand-gold">
                  <FaWallet className="w-6 h-6 text-brand-gold" />
                </div>
                <h2 className="text-3xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
                  Naira Withdrawal
                </h2>
              </div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                Secure Bank Transfer Request
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
            <div className="group">
              <label
                htmlFor="amount"
                className="block text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
              >
                Amount to Withdraw (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 font-black font-spaceGrotesk text-lg">
                  ₦
                </span>
                <input
                  id="amount"
                  type="text"
                  className="w-full pl-12 pr-24 py-5 bg-black/20 border border-white/10 rounded-2xl text-white font-mono text-xl placeholder-gray-800 focus:border-brand-gold/50 outline-none transition-all"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <button
                  type="button"
                  onClick={handleWithdrawAll}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-xl border border-brand-gold/20 transition-all"
                >
                  Max
                </button>
              </div>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-3 px-1">
                Minimum Sequence: ₦{MIN_REQUEST_AMOUNT.toLocaleString()}
              </p>
            </div>

            <div className="group">
              <label
                htmlFor="paymentMethod"
                className="block text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
              >
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white text-sm font-medium focus:border-brand-gold/50 outline-none appearance-none transition-all"
              >
                <option value="Bank Transfer" className="bg-brand-dark-base">
                  Bank Transfer
                </option>
                <option value="Ethereum" className="bg-brand-dark-base">
                  Ethereum
                </option>
              </select>
            </div>

            <div className="group">
              <label
                htmlFor="bankAccount"
                className="block text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
              >
                Bank Account
              </label>
              <select
                id="bankAccount"
                value={selectedBankAccount}
                onChange={handleBankAccountChange}
                className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white text-sm font-medium focus:border-brand-gold/50 outline-none appearance-none transition-all"
              >
                <option value="" className="bg-brand-dark-base">
                  Select a bank account
                </option>
                {isLoadingBankAccounts ? (
                  <option disabled>Loading...</option>
                ) : errorBankAccounts ? (
                  <option disabled>{errorBankAccounts}</option>
                ) : (
                  <>
                    {bankAccounts.map((account) => (
                      <option
                        key={account._id}
                        value={account._id}
                        className="bg-brand-dark-base"
                      >
                        {account.accountNumber} ({account.bankName}) -{' '}
                        {account.accountHolderName}
                      </option>
                    ))}
                    <option value="add_new" className="bg-brand-dark-base">
                      + Add New Bank Account
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className={`flex gap-6 ${isDialog ? 'pt-6' : ''}`}>
              {isDialog && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center gap-3 px-8 py-5 border border-white/10 text-gray-400 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || isLoadingBankAccounts}
                className={`flex-1 flex justify-center items-center gap-3 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base py-5 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold transition-all duration-300 ${
                  loading ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-brand-dark-base border-t-transparent rounded-full" />
                ) : (
                  'Confirm Withdrawal'
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
