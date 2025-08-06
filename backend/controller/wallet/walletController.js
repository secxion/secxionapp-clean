import Wallet from "../../models/walletModel.js";
import { createTransactionNotification } from "../notifications/notificationsController.js";

// Ensure wallet exists for a user
export const ensureWalletExists = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = new Wallet({ userId });
    await wallet.save();
  }
  return wallet;
};

// Get balance for logged-in user
export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await ensureWalletExists(userId);

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions: wallet.transactions || [],
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance',
      error: error.message,
    });
  }
};

// Admin: Get another user's wallet balance
export const getOtherUserWalletBalance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found for this user.' });
    }

    res.status(200).json({ success: true, balance: wallet.balance });
  } catch (error) {
    console.error('Error fetching user wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user wallet balance',
      error: error.message,
    });
  }
};

// Update wallet balance and log transaction
export const updateWalletBalance = async (
  userId,
  amount,
  type,
  description,
  referenceId,
  referenceType,
  status = 'completed'
) => {
  try {
    const validModels = ["PaymentRequest", "EthWithdrawalRequest", "OtherType", "User", "userproduct"];
    if (!validModels.includes(referenceType)) {
      throw new Error(`Invalid referenceType: ${referenceType}`);
    }

    const wallet = await ensureWalletExists(userId);

    if (amount < 0) {
      if (Math.abs(amount) < 1000) {
        return {
          success: false,
          message: "Minimum withdrawal amount is ₦1000.",
        };
      }
      if (wallet.balance + amount < 0) {
        return {
          success: false,
          message: "Insufficient balance. Cannot go below ₦0.",
        };
      }
    }

    // Only immediately apply balance if transaction is approved/completed
    if (status === 'completed' || status === 'approved') {
      wallet.balance += amount;
    }

    // Record transaction
    const transaction = {
      type, // 'credit' | 'debit'
      amount,
      description,
      referenceId,
      onModel: referenceType,
      status, // new field
      timestamp: new Date(),
    };

    wallet.transactions.push(transaction);
    await wallet.save();

    // Notification
    const formattedAmount = `₦${Math.abs(amount).toLocaleString()}`;
    const message =
      type === 'credit'
        ? `Your wallet has been credited with ${formattedAmount} (${status})`
        : type === 'debit'
        ? `Your wallet has been debited by ${formattedAmount} (${status})`
        : `A wallet transaction of ${formattedAmount} (${status}) occurred`;

    await createTransactionNotification(
      userId,
      Math.abs(amount),
      type,
      message,
      '/wallet',
      referenceId
    );

    return {
      success: true,
      message: `Wallet transaction recorded with status: ${status}`,
      transaction,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return {
      success: false,
      message: "Failed to update wallet balance.",
      error: error.message,
    };
  }
};

// Optional: Update transaction status (useful for ETH confirmations)
export const updateTransactionStatus = async (userId, transactionId, newStatus) => {
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return { success: false, message: "Wallet not found" };

    const transaction = wallet.transactions.id(transactionId);
    if (!transaction) return { success: false, message: "Transaction not found" };

    transaction.status = newStatus;

    // Apply balance update if it's now completed or approved
    if ((newStatus === 'completed' || newStatus === 'approved') && !transaction.appliedToBalance) {
      wallet.balance += transaction.amount;
      transaction.appliedToBalance = true;
    }

    await wallet.save();

    return {
      success: true,
      message: `Transaction status updated to ${newStatus}`,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error("Failed to update transaction status:", error);
    return {
      success: false,
      message: "Failed to update transaction status",
      error: error.message,
    };
  }
};
