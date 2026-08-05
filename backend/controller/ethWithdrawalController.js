import EthWithdrawalRequest from "../models/ethWithdrawalRequestModel.js";
import PaymentRequest from "../models/paymentRequestModel.js";
import axios from "axios";
import { updateWalletBalance } from "./wallet/walletController.js";
import { createTransactionNotification } from "./notifications/notificationsController.js";
import Wallet from "../models/walletModel.js";
import userModel from "../models/userModel.js";
import {
  getKycFinancialLimits,
  UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN,
} from "../utils/kycLimitPolicy.js";

export const createEthWithdrawalRequest = async (req, res) => {
  try {
    const { ethRecipientAddress, nairaRequestedAmount, ethNetAmountToSend } =
      req.body;
    const userId = req.userId;
    const requestedNaira = Number(nairaRequestedAmount);

    if (!ethRecipientAddress || !nairaRequestedAmount || !ethNetAmountToSend) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!Number.isFinite(requestedNaira) || requestedNaira <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid withdrawal amount.",
      });
    }

    const user = await userModel.findById(userId).select("kycStatus");
    const limits = getKycFinancialLimits(user?.kycStatus);

    if (limits.isRestricted) {
      const [paymentRequests, ethRequests] = await Promise.all([
        PaymentRequest.find(
          {
            userId,
            status: { $ne: "rejected" },
          },
          { amount: 1 },
        ).lean(),
        EthWithdrawalRequest.find(
          {
            userId,
            status: { $ne: "Rejected" },
          },
          { nairaRequestedAmount: 1 },
        ).lean(),
      ]);

      const paymentUsed = paymentRequests.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );
      const ethUsed = ethRequests.reduce(
        (sum, item) => sum + Number(item.nairaRequestedAmount || 0),
        0,
      );

      const usedWithoutKyc = paymentUsed + ethUsed;
      const projectedUsed = usedWithoutKyc + requestedNaira;

      if (projectedUsed > UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN) {
        const remainingAmount = Math.max(
          0,
          UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN - usedWithoutKyc,
        );

        return res.status(403).json({
          success: false,
          message: `Unverified accounts can withdraw up to a total of ₦${UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN.toLocaleString()}. Your non-KYC available withdrawal is ₦${remainingAmount.toLocaleString()}. Please complete KYC to continue withdrawing. Unlimited balance and withdrawals are available once KYC is verified.`,
          code: "UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_REACHED",
          totalLimit: UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN,
          usedAmount: usedWithoutKyc,
          remainingAmount,
          kycRedirectPath: "/kyc",
        });
      }
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found." });
    }

    if (requestedNaira > wallet.balance) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal amount exceeds wallet balance.",
      });
    }

    const ethRateRes = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: { ids: "ethereum", vs_currencies: "ngn" },
      },
    );
    const ethRate = ethRateRes.data?.ethereum?.ngn;
    if (!ethRate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to fetch ETH rate." });
    }

    const ethCalculatedAmount = requestedNaira / ethRate;

    const newRequest = new EthWithdrawalRequest({
      userId,
      ethRecipientAddress,
      nairaRequestedAmount: requestedNaira,
      ethCalculatedAmount,
      ethNetAmountToSend,
      status: "Pending",
    });

    await newRequest.save();

    const walletUpdate = await updateWalletBalance(
      userId,
      -requestedNaira,
      "debit",
      "ETH withdrawal initiated",
      newRequest._id,
      "EthWithdrawalRequest",
    );

    if (!walletUpdate.success) {
      console.error("Wallet update failed:", walletUpdate.error);
    } else {
      await createTransactionNotification(
        userId,
        requestedNaira,
        "debit",
        `${ethNetAmountToSend} ETH to ${ethRecipientAddress} initiated.`,
        `/eth-withdrawals`,
        newRequest._id,
      );
    }

    return res.status(201).json({
      success: true,
      message: "ETH withdrawal request submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("ETH withdrawal error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing ETH withdrawal.",
      error: error.message,
    });
  }
};

export const getAllEthWithdrawalRequests = async (req, res) => {
  try {
    const requests = await EthWithdrawalRequest.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching requests",
        error: error.message,
      });
  }
};

export const updateEthWithdrawalStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ["Pending", "Processed", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const request = await EthWithdrawalRequest.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });
    }

    const userId = request.userId;
    const nairaAmount = request.nairaRequestedAmount;

    if (status === "Rejected") {
      request.status = "Rejected";
      request.rejectionReason = rejectionReason || "Rejected by admin";

      const refundResult = await updateWalletBalance(
        userId,
        nairaAmount,
        "credit",
        "ETH withdrawal rejected - refund",
        request._id,
        "EthWithdrawalRequest",
      );

      if (!refundResult.success) {
        console.error("Refund failed for ETH withdrawal:", refundResult.error);
      } else {
        await createTransactionNotification(
          userId,
          nairaAmount,
          "credit",
          `ETH withdrawal of ₦${nairaAmount} was rejected. Refund issued.`,
          `/eth-withdrawals`,
          request._id,
        );
      }
    } else if (status === "Processed") {
      request.status = "Processed";
      request.processedAt = new Date();

      const detailsMessage =
        `ETH withdrawal processed:\n` +
        `• Recipient: ${request.ethRecipientAddress}\n` +
        `• Amount (₦): ₦${nairaAmount}\n` +
        `• ETH Sent: ${request.ethNetAmountToSend} ETH\n` +
        `• Time: ${new Date().toLocaleString()}`;

      await createTransactionNotification(
        userId,
        request.ethNetAmountToSend,
        "eth_processed",
        detailsMessage,
        `/eth-withdrawals`,
        request._id,
      );
    } else {
      request.status = status;
      if (request.rejectionReason) request.rejectionReason = undefined;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "ETH withdrawal status updated successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Status update error (ETH withdrawal):", error);
    return res.status(500).json({
      success: false,
      message: "Error updating ETH withdrawal status.",
      error: error.message,
    });
  }
};

export const getSingleEthWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await EthWithdrawalRequest.findById(requestId).populate(
      "userId",
      "name email",
    );

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching request:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching request",
        error: error.message,
      });
  }
};

export const getEthWithdrawalStatus = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const latestRequest = await EthWithdrawalRequest.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!latestRequest) {
      return res.status(200).json({ success: true, status: "" });
    }

    return res.status(200).json({
      success: true,
      status: latestRequest.status,
    });
  } catch (error) {
    console.error("Error checking withdrawal status:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking withdrawal status.",
      error: error.message,
    });
  }
};
