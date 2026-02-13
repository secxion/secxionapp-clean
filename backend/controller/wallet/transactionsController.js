import Wallet from "../../models/walletModel.js";
import PaymentRequest from "../../models/paymentRequestModel.js";

export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    let transactions = wallet.transactions;

    const transactionHistoryWithPossibleUpdatedStatus = await Promise.all(
      transactions.map(async (tx) => {
        let transactionDetails = { ...tx.toObject() };

        if (tx.onModel === "PaymentRequest" && tx.referenceId) {
          try {
            const paymentRequest = await PaymentRequest.findById(
              tx.referenceId,
            );
            if (paymentRequest) {
              transactionDetails.status = paymentRequest.status;
            }
          } catch (error) {
            console.error("Error fetching related PaymentRequest:", error);
          }
        }

        return transactionDetails;
      }),
    );

    let filteredTransactionHistory =
      transactionHistoryWithPossibleUpdatedStatus;

    if (status && status !== "all") {
      const lowerStatus = status.toLowerCase().trim().replace(/ /g, "-");
      filteredTransactionHistory = filteredTransactionHistory.filter((tx) => {
        const transactionStatus = tx.status
          ? tx.status.toLowerCase().trim().replace(/ /g, "-")
          : null;
        return transactionStatus === lowerStatus;
      });
    }

    filteredTransactionHistory.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.status(200).json({
      success: true,
      transactions: filteredTransactionHistory,
    });
  } catch (error) {
    console.error("Error fetching user transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history.",
      error: error.message,
    });
  }
};
