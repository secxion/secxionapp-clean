import React, { useState, useEffect } from 'react';
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

const BankAccountList = ({ onBankAccountsUpdated, onBankAccountsUpdating }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchBankAccounts = async () => {
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
        setError(data.message || 'Failed to fetch bank accounts.');
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('An unexpected error occurred while fetching bank accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showAddAccountForm && user) {
      fetchBankAccounts();
    }
  }, [showAddAccountForm, user]);

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
        setDeleteError(data.message || 'Failed to delete bank account.');
      }
    } catch (err) {
      console.error('Error deleting bank account:', err);
      setDeleteError(
        'An unexpected error occurred while deleting the account.',
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
                  className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 flex items-center justify-between border border-yellow-600/20 hover:border-yellow-600/40 transition-all duration-200 shadow-lg"
                >
                  <div>
                    <h4 className="font-semibold text-yellow-400 flex items-center text-lg">
                      <FaUniversity className="mr-3 text-yellow-400" />{' '}
                      {account.accountNumber}
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      {account.bankName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Holder: {account.accountHolderName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:outline-none text-sm ml-4 flex items-center px-3 py-2 rounded-lg transition-all duration-200"
                    disabled={deleteLoading === account._id}
                  >
                    {deleteLoading === account._id ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTrashAlt className="mr-2" />
                    )}
                    Delete
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
            className="w-full inline-flex items-center justify-center px-6 py-3 mt-6 border-2 border-dashed border-yellow-600/50 hover:border-yellow-600 rounded-xl shadow-sm text-sm font-medium text-yellow-400 bg-transparent hover:bg-yellow-600/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
            onClick={handleAddAccountClick}
            disabled={showAddAccountForm || bankAccounts.length >= 2}
          >
            <FaPlusCircle className="mr-2" /> Add New Account
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
