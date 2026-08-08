import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import SecxionSpinner from './SecxionSpinner';
import { motion } from 'framer-motion';
import { FaTimes, FaUniversity } from 'react-icons/fa';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const AddBankAccountForm = ({ onCancel, onSuccess }) => {
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [form, setForm] = useState({ accountNumber: '', bankCode: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (codeSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [codeSent, resendTimer]);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const res = await fetch(SummaryApi.bankList.url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || 'Failed to load banks');
        setBanks(data.data);
      } catch (err) {
        setError(
          toUserSafeMessage(
            err,
            'We could not load the bank list. Please try again.',
          ),
        );
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setResolvedAccountName('');
    setSuccessMsg('');
    setError('');
    setCodeSent(false);
    setVerificationCode('');
  };

  useEffect(() => {
    const resolveAccount = async () => {
      if (form.accountNumber.length === 10 && form.bankCode) {
        setLoadingResolve(true);
        try {
          const res = await fetch(SummaryApi.resolveBankAccount.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              account_number: form.accountNumber,
              bank_code: form.bankCode,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message);
          setResolvedAccountName(data.data.account_name);
          setShowConfirmModal(true);
        } catch (err) {
          setError(
            toUserSafeMessage(
              err,
              'We could not verify this account. Check the details and try again.',
            ),
          );
        } finally {
          setLoadingResolve(false);
        }
      }
    };

    resolveAccount();
  }, [form.accountNumber, form.bankCode]);

  const sendVerificationCode = async () => {
    if (sendingCode) return; // Prevent multiple clicks
    setError('');
    setSendingCode(true);
    try {
      const res = await fetch(SummaryApi.sendBankCode.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCodeSent(true);
      setResendTimer(60); // Start countdown
      setShowConfirmModal(false); // Close modal after sending code
      setSuccessMsg('Verification code sent. Check your email.');
    } catch (err) {
      setError(
        toUserSafeMessage(
          err,
          'We could not send the verification code. Please try again.',
        ),
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!verificationCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setSubmitLoading(true);
    try {
      const selectedBank = banks.find((b) => b.code === form.bankCode);
      const res = await fetch(SummaryApi.verifyAddBank.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountNumber: form.accountNumber,
          bankCode: form.bankCode,
          bankName: selectedBank?.name || '',
          accountHolderName: resolvedAccountName,
          code: verificationCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setSuccessMsg('Bank account added successfully.');
      setForm({ accountNumber: '', bankCode: '' });
      setResolvedAccountName('');
      setVerificationCode('');
      setShowConfirmModal(false);
      setCodeSent(false);

      // Call success callback if provided
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } catch (err) {
      setError(
        toUserSafeMessage(
          err,
          'We could not add this bank account. Check the code and try again.',
        ),
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-8 sm:p-10 bg-black/20 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="p-3 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 shadow-brand-gold">
            <FaUniversity className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
              New Account Verification
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Add a verified withdrawal destination
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center">
              {error}
            </p>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center">
              {successMsg}
            </p>
          </div>
        )}

        <div className="space-y-8">
          <div className="group">
            <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors">
              Select Bank
            </label>
            <select
              name="bankCode"
              value={form.bankCode}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 text-white p-5 rounded-2xl focus:border-brand-gold/50 outline-none appearance-none transition-all text-sm font-medium"
              required
            >
              <option value="" className="bg-brand-dark-base">
                -- SELECT BANK --
              </option>
              {banks.map((bank, index) => (
                <option
                  key={`${bank.code}-${index}`}
                  value={bank.code}
                  className="bg-brand-dark-base"
                >
                  {bank.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors">
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 text-white p-5 rounded-2xl focus:border-brand-gold/50 outline-none transition-all font-mono text-xl tracking-widest placeholder-gray-800"
                placeholder="0000000000"
                required
                maxLength={10}
              />
              {loadingResolve && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-brand-gold border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

          {resolvedAccountName && (
            <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-2xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center mb-1">
                Resolved Account Name
              </p>
              <p className="text-sm font-black text-brand-gold uppercase tracking-tight text-center font-spaceGrotesk">
                {resolvedAccountName}
              </p>
            </div>
          )}

          {codeSent && (
            <div className="mt-8 pt-8 border-t border-white/5 group">
              <label className="block text-[10px] font-black font-spaceGrotesk text-emerald-400 uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full bg-black/20 border border-white/10 p-5 rounded-2xl text-center text-white font-mono text-2xl tracking-[0.5em] focus:border-emerald-400/50 outline-none transition-all"
              />
              <div className="text-[10px] mt-4 text-gray-600 font-black uppercase tracking-widest text-center">
                {resendTimer > 0 ? (
                  <>RESEND AVAILABLE IN {resendTimer}S</>
                ) : sendingCode ? (
                  <span className="text-gray-500">TRANSMITTING...</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                    className="text-brand-gold hover:text-white transition-colors"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-12">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-5 border border-white/10 text-gray-500 rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
          >
            Cancel
          </button>
          {codeSent && (
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-5 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'VERIFYING...' : 'Verify & Add Account'}
            </button>
          )}
        </div>
      </form>

      {/* Modal Confirmation */}
      {showConfirmModal && resolvedAccountName && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="glass-card p-10 rounded-3xl border-brand-gold/30 shadow-brand-gold max-w-sm w-full text-center">
            <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk mb-8">
              Confirm Identity
            </h3>
            <div className="mb-10 py-8 px-6 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">
                Account detected as:
              </p>
              <p className="text-lg font-black text-white font-spaceGrotesk uppercase tracking-tight">
                {resolvedAccountName}
              </p>
            </div>

            <button
              onClick={sendVerificationCode}
              disabled={sendingCode}
              className="w-full py-5 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold transition-all active:scale-95 disabled:opacity-30"
            >
              {sendingCode ? 'TRANSMITTING...' : 'Send Verification Code'}
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="mt-6 text-[10px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors font-spaceGrotesk"
            >
              [ Revise Details ]
            </button>
          </div>
        </div>
      )}

      {/* Close Button - Fixed Position */}
      <motion.button
        onClick={onCancel}
        className="fixed top-14 right-6 z-[10000] rounded-full border-2 border-white/20 bg-red-600/90 p-3 text-white shadow-2xl transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-label="Close add bank account form"
      >
        <FaTimes className="w-6 h-6" />
      </motion.button>
    </>
  );
};

export default AddBankAccountForm;
