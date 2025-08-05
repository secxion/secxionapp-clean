import React, { useState, useEffect } from 'react';
import AddBankAccountForm from './AddBankAccountForm';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';
import { FaPlusCircle, FaTrashAlt, FaUniversity, FaSpinner, } from 'react-icons/fa';

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
            const response = await fetch(
                SummaryApi.getBankAccounts.url,
                {
                    method: SummaryApi.getBankAccounts.method,
                    credentials: 'include',
                }
            );
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
                }
            );
            const data = await response.json();
            if (data.success) {
                fetchBankAccounts();
            } else {
                setDeleteError(data.message || 'Failed to delete bank account.');
            }
        } catch (err) {
            console.error('Error deleting bank account:', err);
            setDeleteError('An unexpected error occurred while deleting the account.');
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading && !showAddAccountForm) {
        return <div className="text-gray-600 italic">Loading bank accounts...</div>;
    }

    if (error && !showAddAccountForm) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <>
            <div className='fixed w-screen h-screen px-4 right-0 left-0 mt-1'>

                {!showAddAccountForm ? (
                    <>
                        {bankAccounts.length > 0 ? (
                            bankAccounts.map((account) => (
                                <div key={account._id} className="bg-gray-50 rounded-md p-6 mb-2 flex items-center justify-between border border-gray-200">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 flex items-center">
                                            <FaUniversity className="mr-2 text-gray-600" /> {account.accountNumber}
                                        </h4>
                                        <p className="text-sm text-gray-600">{account.bankName}</p>
                                        <p className="text-xs text-gray-500">Holder: {account.accountHolderName}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAccount(account._id)}
                                        className="text-red-500 hover:text-red-700 focus:outline-none text-sm ml-4 flex items-center"
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
                            ))
                        ) : (
                            <p className="text-gray-500 mt-6 ml-20 italic">No bank accounts added yet.</p>
                        )}
                        {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}
                        <button
                            className="inline-flex items-center px-4 py-2 mt-6 border border-dashed border-green-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-3"
                            onClick={handleAddAccountClick}
                            disabled={showAddAccountForm || bankAccounts.length >= 2}
                        >
                            <FaPlusCircle className="mr-2" /> Add New Account
                        </button>
                        {bankAccounts.length >= 2 && (
                            <p className="text-sm text-gray-500 mt-1">You can have a maximum of 2 bank accounts.</p>
                        )}
                    </>
                ) : (
                    <div className="bg-white shadow rounded-md p-3 border border-gray-200">
                        <AddBankAccountForm onAccountAdded={handleAccountAdded} onCancel={handleCancelAddAccount} userId={user?.id || user?._id} />
                    </div>
                )}
            </div>
        </>
    );
};

export default BankAccountList;