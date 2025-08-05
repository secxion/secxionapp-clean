import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import TransactionCard from './TransactionCard';
import SummaryApi from '../common';
import { FaFilter, FaEye, FaEyeSlash } from 'react-icons/fa';

const TransactionHistory = () => {
    const { user } = useSelector((state) => state.user);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [errorTransactions, setErrorTransactions] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [visibleTransactions, setVisibleTransactions] = useState(3); 
    const [showAll, setShowAll] = useState(false);
    const navRef = useRef(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchTransactions = useCallback(async (currentStatusFilter) => {
        if (!user?.id && !user?._id) {
            console.warn('User not found in Redux. Cannot fetch transactions.');
            setErrorTransactions('User authentication details not found.');
            return;
        }

        setLoadingTransactions(true);
        setErrorTransactions('');
        try {
            let url = `${SummaryApi.transactions.url}`;
            const userId = user?.id || user?._id;
            url += `?userId=${userId}`;

            if (currentStatusFilter && currentStatusFilter !== 'all') {
                url += `&status=${currentStatusFilter}`;
            }

            console.log('Fetching transactions from:', url);
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Transactions data:', data);
            if (data.success && data.transactions) {
                setTransactions(data.transactions);
            } else {
                setErrorTransactions(data.message || 'Failed to fetch transactions.');
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setErrorTransactions('An unexpected error occurred while fetching transactions.');
        } finally {
            setLoadingTransactions(false);
        }
    }, [user, SummaryApi.transactions.url]);

    useEffect(() => {
        fetchTransactions(statusFilter);
        setVisibleTransactions(3);
        setShowAll(false);
    }, [statusFilter, fetchTransactions]);

    const handleFilterChange = (statusText) => {
        const statusValue = statusText.toLowerCase().replace(/ /g, '-');
        setStatusFilter(statusValue);
        setIsFilterOpen(false); 
        console.log('statusFilter updated:', statusValue);
    };

    const handleViewMore = () => {
        setShowAll(true);
        setVisibleTransactions(transactions.length);
    };

    const handleCloseViewMore = () => {
        setShowAll(false);
        setVisibleTransactions(3);
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    if (loadingTransactions) {
        return <div className="text-gray-600 italic">Loading transaction history...</div>;
    }

    if (errorTransactions) {
        return <div className="text-red-500">Error loading transactions: {errorTransactions}</div>;
    }

    const displayedTransactions = showAll ? transactions : transactions.slice(0, visibleTransactions);
    const menuItems = ['All', 'Pending', 'Approved Processing', 'Rejected', 'Completed'];
    const minMenuWidth = `${menuItems.length * 5}px`;

    return (       
            <div className='min-w-screen max-w-screen'>
            <nav className='pt-28 bg-white shadow-md w-screen overflow-x-auto fixed top-0 left-0 right-0 z-30 flex items-center justify-between py-2 px-4' >
                    <ul ref={navRef}  className="flex items-center space-x-4 overflow-x-auto "
                     aria-label="Tabs" style={{ minWidth: minMenuWidth }}>
                        {menuItems.map((item) => (
                            <button
                                key={item.toLowerCase().replace(/ /g, '-')}
                                onClick={() => handleFilterChange(item)}
                                className={`${statusFilter === item.toLowerCase().replace(/ /g, '-') ? 'border-indigo-500 text-indigo-600 focus:ring-indigo-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:ring-gray-200'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                            >
                                {item}
                            </button>
                        ))}
                    </ul>
                </nav>
            

            <div className="space-y-6 w-full right-0 left-0 ">
                {displayedTransactions.length > 0 ? (
                    displayedTransactions.map((transaction) => (
                        <TransactionCard key={transaction._id} transaction={transaction} />
                    ))
                ) : (
                    <p className="text-gray-500 italic">No transactions found with the selected filter.</p>
                )}
            </div>

            {transactions.length > visibleTransactions && !showAll && (
                <div className=" mt-4 flex justify-center">
                    <button
                        onClick={handleViewMore}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <FaEye className="mr-2" /> View More
                    </button>
                </div>
            )}

            {showAll && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleCloseViewMore}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        <FaEyeSlash className="mr-2" /> Show Less
                    </button>
                </div>
            )}
                    </div>    
                    
    );
};

export default TransactionHistory;