import React from 'react';
import { format } from 'date-fns';
import {
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';

const TransactionCard = ({ transaction }) => {
  const { type, amount, description, createdAt, status } = transaction;
  const isCredit = type?.toLowerCase().includes('credit');
  const isDebit = type?.toLowerCase().includes('debit');
  const isWithdrawal = type?.toLowerCase().includes('withdrawal');
  const transactionColor = isCredit ? 'text-green-600' : 'text-red-600';
  const formattedDate = format(new Date(createdAt), 'MMM dd, yyyy h:mm a');

  let statusBadgeClass =
    'inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest font-spaceGrotesk';
  let statusText = '';
  let statusIcon = null;

  switch (status?.toLowerCase()) {
    case 'pending':
      statusBadgeClass +=
        ' border-brand-gold/20 bg-brand-gold/5 text-brand-gold';
      statusText = 'Pending';
      statusIcon = <FaClock className="mr-1.5" />;
      break;
    case 'approved-processing':
      statusBadgeClass += ' border-sky-500/20 bg-sky-500/5 text-sky-400';
      statusText = 'Processing';
      statusIcon = <FaMoneyBillWave className="mr-1.5" />;
      break;
    case 'rejected':
      statusBadgeClass += ' border-rose-500/20 bg-rose-500/5 text-rose-400';
      statusText = 'Rejected';
      statusIcon = <FaTimesCircle className="mr-1.5" />;
      break;
    case 'completed':
      statusBadgeClass +=
        ' border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
      statusText = 'Completed';
      statusIcon = <FaCheckCircle className="mr-1.5" />;
      break;
    default:
      statusBadgeClass += ' border-gray-500/20 bg-white/5 text-gray-400';
      statusText = 'Unknown';
      statusIcon = <FaExclamationTriangle className="mr-1.5" />;
      break;
  }

  let transactionIcon = null;
  if (isCredit) {
    transactionIcon = (
      <FaArrowUp className="mr-3 text-emerald-500 w-3.5 h-3.5" />
    );
  } else if (isDebit || isWithdrawal) {
    transactionIcon = (
      <FaArrowDown className="mr-3 text-rose-500 w-3.5 h-3.5" />
    );
  } else {
    transactionIcon = (
      <FaMoneyBillWave className="mr-3 text-gray-500 w-3.5 h-3.5" />
    );
  }

  return (
    <div className="group relative border-b border-white/5 bg-white/5 px-6 py-6 transition-all duration-300 hover:bg-white/10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center">
          <div className="p-2.5 bg-black/20 rounded-xl mr-4 group-hover:bg-brand-gold/10 transition-colors">
            {transactionIcon}
          </div>
          <div className="flex flex-col">
            <span className="truncate font-black text-white font-spaceGrotesk text-sm tracking-wide uppercase">
              {description ||
                (isCredit
                  ? 'Credit'
                  : isDebit
                    ? 'Debit'
                    : isWithdrawal
                      ? 'Withdrawal'
                      : 'Transaction')}
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {formattedDate.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`shrink-0 font-black font-spaceGrotesk text-lg tracking-tighter ${transactionColor.replace('600', '400')}`}
          >
            {isCredit ? '+' : '-'}₦
            {Math.abs(amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-end">
        {status && (
          <span className={statusBadgeClass}>
            {statusIcon}
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
