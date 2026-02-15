/**
 * CSV Export Utility for Transaction Data
 */

/**
 * Converts transactions array to CSV format and triggers download
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Optional custom filename (default: transactions.csv)
 */
export const exportTransactionsToCSV = (
  transactions,
  filename = 'transactions.csv',
) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  try {
    // Define CSV headers based on transaction object structure
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Account Number',
      'Bank Name',
      'Description',
      'Reference',
    ];

    // Map transaction data to CSV rows
    const rows = transactions.map((transaction) => {
      const createdDate = new Date(transaction.createdAt);
      const dateStr = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const timeStr = createdDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      return [
        escapeCSVField(transaction._id || ''),
        dateStr,
        timeStr,
        transaction.type || '',
        transaction.amount || '',
        transaction.currency || 'NGN',
        transaction.status || '',
        escapeCSVField(transaction.bankAccountDetails?.accountNumber || ''),
        transaction.bankAccountDetails?.bankName || '',
        escapeCSVField(transaction.description || ''),
        escapeCSVField(transaction.reference || ''),
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error exporting transactions. Please try again.');
  }
};

/**
 * Exports filtered transactions with custom date range
 * @param {Array} transactions - Array of transaction objects
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 */
export const exportTransactionsByDateRange = (
  transactions,
  startDate,
  endDate,
) => {
  const filtered = transactions.filter((transaction) => {
    const txDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return txDate >= startDate && txDate <= endDate;
  });

  const filename = `transactions_${startDate}_to_${endDate}.csv`;
  exportTransactionsToCSV(filtered, filename);
};

/**
 * Escapes special characters in CSV fields
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field value
 */
const escapeCSVField = (field) => {
  if (field === null || field === undefined) return '""';

  const stringField = String(field);

  // If field contains comma, newline, or double quotes, wrap in quotes
  if (
    stringField.includes(',') ||
    stringField.includes('\n') ||
    stringField.includes('"')
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

/**
 * Creates blob and triggers download
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Download filename
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Get summary statistics for transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Summary statistics
 */
export const getTransactionSummary = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
    };
  }

  const summary = {
    totalTransactions: transactions.length,
    totalAmount: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  };

  transactions.forEach((tx) => {
    const amount = tx.amount || 0;
    summary.totalAmount += amount;

    if (tx.type === 'deposit') {
      summary.totalDeposits += amount;
    } else if (tx.type === 'withdrawal') {
      summary.totalWithdrawals += amount;
    }

    if (tx.status === 'completed') {
      summary.completedTransactions += 1;
    } else if (tx.status === 'pending' || tx.status === 'approved-processing') {
      summary.pendingTransactions += 1;
    } else if (tx.status === 'rejected') {
      summary.failedTransactions += 1;
    }
  });

  return summary;
};
