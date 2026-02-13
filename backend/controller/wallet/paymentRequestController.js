import PaymentRequest from "../../models/paymentRequestModel.js";
import Wallet from "../../models/walletModel.js";
import { createTransactionNotification } from "../notifications/notificationsController.js";
import { updateWalletBalance } from "../wallet/walletController.js";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const createPaymentRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, paymentMethod, bankAccountId } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    if (amount > wallet.balance) {
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds your current wallet balance.",
      });
    }

    const selectedBankAccount = wallet.bankAccounts.id(bankAccountId);
    if (!selectedBankAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid bank account selected.",
      });
    }

    const newPaymentRequest = new PaymentRequest({
      userId,
      walletId: wallet._id,
      amount,
      paymentMethod,
      bankAccountDetails: {
        accountNumber: selectedBankAccount.accountNumber,
        bankName: selectedBankAccount.bankName,
        accountHolderName: selectedBankAccount.accountHolderName,
      },
    });

    const savedRequest = await newPaymentRequest.save();

    const walletUpdateResult = await updateWalletBalance(
      userId,
      -amount,
      "debit",
      "Payment request initiated",
      savedRequest._id,
      "PaymentRequest",
    );

    if (!walletUpdateResult.success) {
      console.error(
        "Error debiting wallet after payment request:",
        walletUpdateResult.error,
      );
    } else {
      await createTransactionNotification(
        userId,
        amount,
        "debit",
        `Payment request of ${formatCurrency(amount)} initiated.`,
        `/payment-requests`,
        savedRequest._id,
      );
    }

    res.status(201).json({
      success: true,
      message: "Payment request submitted successfully.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating payment request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment request.",
      error: error.message,
    });
  }
};

export const getAllPaymentRequests = async (req, res) => {
  try {
    const paymentRequests = await PaymentRequest.find().populate(
      "userId",
      "name email",
    );
    res.status(200).json({
      success: true,
      data: paymentRequests,
    });
  } catch (error) {
    console.error("Error fetching all payment requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment requests.",
      error: error.message,
    });
  }
};

export const getUserPaymentRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentRequests = await PaymentRequest.find({ userId }).sort({
      requestDate: -1,
    });
    res.status(200).json({
      success: true,
      data: paymentRequests,
    });
  } catch (error) {
    console.error("Error fetching user payment requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your payment requests.",
      error: error.message,
    });
  }
};

export const updatePaymentRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found.",
      });
    }

    if (
      !["pending", "approved-processing", "rejected", "completed"].includes(
        status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment request status.",
      });
    }

    const userId = paymentRequest.userId;
    const amount = paymentRequest.amount;

    paymentRequest.status = status;

    if (rejectionReason && status === "rejected") {
      paymentRequest.rejectionReason = rejectionReason;

      const refundResult = await updateWalletBalance(
        userId,
        amount,
        "credit",
        "Payment request rejected - refund",
        paymentRequest._id,
        "PaymentRequest",
      );

      if (!refundResult.success) {
        console.error(
          "Error crediting wallet after rejecting payment request:",
          refundResult.error,
        );
      } else {
        await createTransactionNotification(
          userId,
          amount,
          "credit",
          `Payment request rejected. Refund of ${formatCurrency(amount)} credited to your wallet. Reason: ${rejectionReason}`,
          `/payment-requests`,
          paymentRequest._id,
        );
      }

      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.transactions = wallet.transactions.map((tx) =>
          tx.referenceId && tx.referenceId.equals(paymentRequest._id)
            ? { ...tx, status: "rejected" }
            : tx,
        );
        await wallet.save();
      }
    } else if (status !== "rejected") {
      paymentRequest.rejectionReason = undefined;
    }

    if (status === "approved-processing") {
      const walletUpdateResult = await updateWalletBalance(
        userId,
        0,
        "withdrawal",
        "Payment request approved",
        paymentRequest._id,
        "PaymentRequest",
      );

      if (!walletUpdateResult.success) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to update wallet transaction status after approving request.",
          error: walletUpdateResult.error,
        });
      }

      paymentRequest.approvalDate = new Date();

      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.transactions = wallet.transactions.map((tx) =>
          tx.referenceId && tx.referenceId.equals(paymentRequest._id)
            ? { ...tx, status: "approved-processing" }
            : tx,
        );
        await wallet.save();
      }

      await createTransactionNotification(
        userId,
        amount,
        "withdrawal",
        `Your payment request of ${formatCurrency(amount)} approved and processing.`,
        `/payment-requests`,
        paymentRequest._id,
      );
    } else if (status === "completed") {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.transactions = wallet.transactions.map((tx) =>
          tx.referenceId && tx.referenceId.equals(paymentRequest._id)
            ? { ...tx, status: "completed" }
            : tx,
        );
        await wallet.save();
      }

      await createTransactionNotification(
        userId,
        amount,
        "payment_completed",
        `Your payment request of ${formatCurrency(amount)} completed.`,
        `/payment-requests`,
        paymentRequest._id,
      );
    }

    const updatedRequest = await paymentRequest.save();

    res.status(200).json({
      success: true,
      message: "Payment request status updated successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating payment request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment request status.",
      error: error.message,
    });
  }
};
