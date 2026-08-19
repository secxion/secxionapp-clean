import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SummaryApi from '../common';
import SecxionSpinner from './SecxionSpinner';
import {
  FaCheck,
  FaChevronDown,
  FaSearch,
  FaTimes,
  FaUniversity,
} from 'react-icons/fa';
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
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');

  const selectedBank = banks.find((bank) => bank.code === form.bankCode);
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase()),
  );

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

  const handleBankSelect = (bankCode) => {
    handleChange({ target: { name: 'bankCode', value: bankCode } });
    setBankPickerOpen(false);
    setBankSearch('');
  };

  useEffect(() => {
    if (!bankPickerOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setBankPickerOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [bankPickerOpen]);

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
        className="w-full max-w-xl mx-auto box-border p-6 sm:p-10 bg-black/20 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="shrink-0 p-3 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 shadow-brand-gold">
              <FaUniversity className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
                New Account Verification
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                Add a verified withdrawal destination
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400/60"
            aria-label="Close add bank account form"
          >
            <FaTimes className="h-4 w-4" />
          </button>
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
            <label
              htmlFor="add-bank-bank-code"
              className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
            >
              Select Bank
            </label>
            <button
              type="button"
              id="add-bank-bank-code"
              onClick={() => setBankPickerOpen(true)}
              className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 text-left text-sm font-medium text-white outline-none transition-all hover:border-brand-gold/40 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/20"
              aria-haspopup="dialog"
              aria-expanded={bankPickerOpen}
              aria-required="true"
              aria-label="Select bank"
            >
              <span className={selectedBank ? 'truncate' : 'text-gray-500'}>
                {selectedBank?.name || 'Choose a bank'}
              </span>
              <FaChevronDown
                className={`h-4 w-4 shrink-0 text-brand-gold transition-transform ${bankPickerOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {bankPickerOpen &&
              createPortal(
                <div
                  className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                  role="presentation"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setBankPickerOpen(false);
                    }
                  }}
                >
                  <div
                    className="flex max-h-[min(78vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-brand-gold/25 bg-brand-dark-elevated shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="bank-picker-title"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
                          Withdrawal destination
                        </p>
                        <h3
                          id="bank-picker-title"
                          className="text-xl font-black uppercase tracking-tight text-white font-spaceGrotesk"
                        >
                          Select your bank
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBankPickerOpen(false)}
                        className="inline-flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-red-400/40 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                        aria-label="Close bank selector"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="border-b border-white/10 p-4 sm:p-5">
                      <label htmlFor="bank-search" className="sr-only">
                        Search banks
                      </label>
                      <div className="relative">
                        <FaSearch
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                          aria-hidden="true"
                        />
                        <input
                          id="bank-search"
                          type="search"
                          value={bankSearch}
                          onChange={(event) =>
                            setBankSearch(event.target.value)
                          }
                          placeholder="Search bank name"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 py-4 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/20"
                        />
                      </div>
                    </div>

                    <div
                      className="min-h-0 overflow-y-auto p-3 sm:p-4"
                      role="listbox"
                      aria-label="Available banks"
                    >
                      {loadingBanks ? (
                        <div className="flex items-center justify-center py-12 text-xs font-bold uppercase tracking-widest text-gray-500">
                          Loading banks...
                        </div>
                      ) : filteredBanks.length === 0 ? (
                        <div className="py-12 text-center text-xs font-bold uppercase tracking-widest text-gray-500">
                          No matching banks
                        </div>
                      ) : (
                        filteredBanks.map((bank, index) => {
                          const isSelected = bank.code === form.bankCode;
                          return (
                            <button
                              key={`${bank.code}-${index}`}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleBankSelect(bank.code)}
                              className={`mb-2 flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all last:mb-0 ${
                                isSelected
                                  ? 'border-brand-gold/50 bg-brand-gold/10 text-brand-gold'
                                  : 'border-white/5 bg-white/[0.03] text-gray-300 hover:border-brand-gold/30 hover:bg-brand-gold/5 hover:text-white'
                              }`}
                            >
                              <span className="truncate">{bank.name}</span>
                              {isSelected && (
                                <FaCheck
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>

          <div className="group">
            <label
              htmlFor="add-bank-account-number"
              className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
            >
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="add-bank-account-number"
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
              <label
                htmlFor="add-bank-verification-code"
                className="block text-[10px] font-black font-spaceGrotesk text-emerald-400 uppercase tracking-[0.2em] mb-4 group-focus-within:text-white transition-colors"
              >
                Verification Code
              </label>
              <input
                id="add-bank-verification-code"
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

        <div className="mt-12">
          {codeSent && (
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-5 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base rounded-2xl font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'VERIFYING...' : 'Verify & Add Account'}
            </button>
          )}
        </div>
      </form>

      {/* Modal Confirmation */}
      {showConfirmModal && resolvedAccountName && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div
            className="glass-card w-full max-w-sm rounded-3xl border-brand-gold/30 p-8 text-center shadow-brand-gold sm:p-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-bank-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3
              id="add-bank-confirm-title"
              className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk mb-8"
            >
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
              type="button"
              onClick={sendVerificationCode}
              disabled={sendingCode}
              className="min-h-11 w-full rounded-2xl bg-brand-gold py-5 font-black font-spaceGrotesk text-[10px] uppercase tracking-widest text-brand-dark-base shadow-brand-gold transition-all hover:bg-brand-gold-dark active:scale-95 disabled:opacity-30"
            >
              {sendingCode ? 'TRANSMITTING...' : 'Send Verification Code'}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="mt-4 inline-flex min-h-11 items-center justify-center px-4 text-[10px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors font-spaceGrotesk"
              aria-label="Revise bank account details"
            >
              [ Revise Details ]
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBankAccountForm;
