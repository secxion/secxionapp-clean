import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import SecxionSpinner from './SecxionSpinner';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

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
        setError(err.message);
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
          setError(err.message);
        } finally {
          setLoadingResolve(false);
        }
      }
    };

    resolveAccount();
  }, [form.accountNumber, form.bankCode]);

  const sendVerificationCode = async () => {
    setError('');
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
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-white border border-gray-200 -mt-2 rounded-lg shadow-md"
      >
        <h2 className="text-md font-semibold mb-2 -mt-2">Add Bank Account</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

        <label className="block mb-2 -mt-2">
          <span className="text-gray-700">Select Bank</span>
          <select
            name="bankCode"
            value={form.bankCode}
            onChange={handleChange}
            className="w-full border text-black px-3 py-2 mt-1 rounded focus:ring-green-500 focus:border-green-500 shadow-sm"
            required
          >
            <option value="">-- Select Bank --</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Account Number</span>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className="w-full border text-black px-3 py-2 mt-1 rounded focus:ring-green-500 focus:border-green-500 shadow-sm"
            required
            maxLength={10}
          />
          {loadingResolve && (
            <p className="text-sm text-gray-500 mt-1">
              <SecxionSpinner size="small" message="" />
            </p>
          )}
        </label>

        {resolvedAccountName && (
          <p className="text-sm text-green-700 mb-2">
            Resolved Name: {resolvedAccountName}
          </p>
        )}

        {codeSent && (
          <div className="mt-4">
            <label className="block mb-2 font-medium text-gray-700">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full border px-3 py-2 rounded text-center focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
            <div className="text-sm mt-2 text-gray-600">
              {resendTimer > 0 ? (
                <>Resend available in {resendTimer}s</>
              ) : (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  className="text-blue-600 hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
          {codeSent && (
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {submitLoading ? 'Submitting...' : 'Add Bank Account'}
            </button>
          )}
        </div>
      </form>

      {/* Modal Confirmation */}
      {showConfirmModal && resolvedAccountName && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Confirm Account Name</h3>
            <p className="text-gray-700 mb-4">
              Account Name:{' '}
              <span className="font-medium text-green-700">
                {resolvedAccountName}
              </span>
            </p>

            <button
              onClick={sendVerificationCode}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 "
            >
              Send Verification Code
            </button>
          </div>
        </div>
      )}

      {/* Close Button - Fixed Position */}
      <motion.button
        onClick={onCancel}
        className="fixed top-14 right-6 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
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
