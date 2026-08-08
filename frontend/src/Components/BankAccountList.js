import React, { useState, useEffect, useCallback } from 'react';
import AddBankAccountForm from './AddBankAccountForm';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';
import {
  FaPlusCircle,
  FaTrashAlt,
  FaUniversity,
  FaSpinner,
} from 'react-icons/fa';
import SecxionSpinner from './SecxionSpinner';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const BankAccountList = ({ onBankAccountsUpdated, onBankAccountsUpdating }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchBankAccounts = useCallback(async () => {
    if (!user?.id && !user?._id) {
      console.warn('User not found. Cannot fetch bank accounts.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(SummaryApi.getBankAccounts.url, {
        method: SummaryApi.getBankAccounts.method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setBankAccounts(data.data);
        if (onBankAccountsUpdated) {
          onBankAccountsUpdated(data.data);
        }
      } else {
        setError(
          toUserSafeMessage(
            data.message,
            'We could not load your bank accounts. Please try again.',
            { status: response.status },
          ),
        );
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError(
        toUserSafeMessage(
          err,
          'We could not load your bank accounts. Please try again.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [user, onBankAccountsUpdated]);

  useEffect(() => {
    if (!showAddAccountForm && user) {
      fetchBankAccounts();
    }
  }, [showAddAccountForm, user, fetchBankAccounts]);

  const handleAddAccountClick = () => {
    setShowAddAccountForm(true);
  };

  const handleAccountAdded = () => {
    if (onBankAccountsUpdating) {
      onBankAccountsUpdating(true);
    }
    setShowAddAccountForm(false);
    fetchBankAccounts();
  };

  const handleCancelAddAccount = () => {
    setShowAddAccountForm(false);
  };

  const handleDeleteAccount = async (accountId) => {
    setDeleteLoading(accountId);
    setDeleteError('');
    if (onBankAccountsUpdating) {
      onBankAccountsUpdating(true);
    }
    try {
      const response = await fetch(
        `${SummaryApi.deleteBankAccount.url}/${accountId}`,
        {
          method: SummaryApi.deleteBankAccount.method,
          credentials: 'include',
        },
      );
      const data = await response.json();
      if (data.success) {
        fetchBankAccounts();
      } else {
        setDeleteError(
          toUserSafeMessage(
            data.message,
            'We could not remove this bank account. Please try again.',
            { status: response.status },
          ),
        );
      }
    } catch (err) {
      console.error('Error deleting bank account:', err);
      setDeleteError(
        toUserSafeMessage(
          err,
          'We could not remove this bank account. Please try again.',
        ),
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading && !showAddAccountForm) {
    return (
      <div className="">
        <span className="">
          <SecxionSpinner size="medium" message="" />
        </span>
      </div>
    );
  }

  if (error && !showAddAccountForm) {
    return (
      <div className="text-center py-12">
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl max-w-md mx-auto">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBankAccounts}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showAddAccountForm ? (
        <>
          {bankAccounts.length > 0 ? (
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div
                  key={account._id}
                  className="bg-white/5 rounded-2xl p-6 flex items-center justify-between border border-white/5 hover:border-brand-gold/20 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="p-3 bg-brand-gold/5 rounded-xl border border-brand-gold/10 group-hover:bg-brand-gold/10 transition-colors">
                      <FaUniversity className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <h4 className="font-black text-white font-spaceGrotesk text-lg tracking-tight">
                        {account.accountNumber}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          Bank:{' '}
                          <span className="text-gray-300">
                            {account.bankName}
                          </span>
                        </p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          Holder:{' '}
                          <span className="text-gray-300">
                            {account.accountHolderName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300 active:scale-90"
                    disabled={deleteLoading === account._id}
                    title="Remove account"
                  >
                    {deleteLoading === account._id ? (
                      <FaSpinner className="animate-spin w-4 h-4" />
                    ) : (
                      <FaTrashAlt className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-8 bg-gray-800/50 rounded-xl border border-gray-700 max-w-md mx-auto">
                <FaUniversity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  No bank accounts added yet.
                </p>
                <p className="text-gray-500 text-sm">
                  Add a bank account to start receiving withdrawals
                </p>
              </div>
            </div>
          )}
          {deleteError && (
            <p className="text-red-400 mt-4 text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              {deleteError}
            </p>
          )}
          <button
            className="w-full inline-flex items-center justify-center px-8 py-5 mt-10 border-2 border-dashed border-white/5 hover:border-brand-gold/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-brand-gold bg-white/[0.02] hover:bg-brand-gold/5 transition-all duration-500 group"
            onClick={handleAddAccountClick}
            disabled={showAddAccountForm || bankAccounts.length >= 2}
          >
            <FaPlusCircle className="mr-3 w-4 h-4 transition-transform group-hover:rotate-90 duration-500" />
            Add New Account
          </button>
          {bankAccounts.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2 text-center bg-gray-800/30 border border-gray-600 rounded-lg p-3">
              You can have a maximum of 2 bank accounts.
            </p>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-xl p-6 border border-yellow-600/30 backdrop-blur-sm">
          <AddBankAccountForm
            onAccountAdded={handleAccountAdded}
            onCancel={handleCancelAddAccount}
            userId={user?.id || user?._id}
          />
        </div>
      )}
    </div>
  );
};

export default BankAccountList;
