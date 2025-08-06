import React from 'react';
import { format } from 'date-fns';
import { FaArrowUp, FaArrowDown, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const TransactionCard = ({ transaction }) => {
    const { type, amount, description, createdAt, status } = transaction;
    const isCredit = type?.toLowerCase().includes('credit');
    const isDebit = type?.toLowerCase().includes('debit');
    const isWithdrawal = type?.toLowerCase().includes('withdrawal');
    const transactionColor = isCredit ? 'text-green-600' : 'text-red-600';
    const formattedDate = format(new Date(createdAt), 'MMM dd, yyyy h:mm a');

    let statusBadgeClass = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    let statusText = '';
    let statusIcon = null;

    switch (status?.toLowerCase()) {
        case 'pending':
            statusBadgeClass += ' bg-yellow-100 text-yellow-800';
            statusText = 'Pending';
            statusIcon = <FaClock className="mr-1" />;
            break;
        case 'approved-processing':
            statusBadgeClass += ' bg-blue-100 text-blue-800';
            statusText = 'Processing';
            statusIcon = <FaMoneyBillWave className="mr-1" />;
            break;
        case 'rejected':
            statusBadgeClass += ' bg-red-100 text-red-800';
            statusText = 'Rejected';
            statusIcon = <FaTimesCircle className="mr-1" />;
            break;
        case 'completed':
            statusBadgeClass += ' bg-green-100 text-green-800';
            statusText = 'Completed';
            statusIcon = <FaCheckCircle className="mr-1" />;
            break;
        default:
            statusBadgeClass += ' bg-gray-100 text-gray-800';
            statusText = 'Unknown';
            statusIcon = <FaExclamationTriangle className="mr-1" />;
            break;
    }

    let transactionIcon = null;
    if (isCredit) {
        transactionIcon = <FaArrowUp className="mr-1 text-green-500" />;
    } else if (isDebit || isWithdrawal) {
        transactionIcon = <FaArrowDown className="mr-1 text-red-500" />;
    } else {
        transactionIcon = <FaMoneyBillWave className="mr-1 text-gray-500" />;
    }

    return (
        <div className="container bg-white rounded-md p-4 mb-3 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    {transactionIcon}
                    <span className="font-semibold text-gray-800 line-clamp-1">{description || (isCredit ? 'Credit' : isDebit ? 'Debit' : isWithdrawal ? 'Withdrawal' : 'Transaction')}</span>
                </div>
                <span className={`font-bold ${transactionColor}`}>
                    {isCredit ? '+' : '-'} ₦{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
                <span>{formattedDate}</span>
                {status && <span className={statusBadgeClass}>{statusIcon}{statusText}</span>}
            </div>
        </div>
    );
};

export default TransactionCard;