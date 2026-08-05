import userProduct from "../../models/userProduct.js";
import Wallet from "../../models/walletModel.js";
import userModel from "../../models/userModel.js";
import {
  getKycFinancialLimits,
  UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN,
} from "../../utils/kycLimitPolicy.js";

const KYC_CREDIT_LIMITED_REFERENCE_TYPES = new Set([
  "User",
  "userproduct",
  "OtherType",
]);

const COUNTABLE_CREDIT_STATUSES = new Set(["completed", "approved"]);

const getNonKycCreditTransactionVolume = (transactions = []) =>
  transactions.reduce((sum, tx) => {
    const txType = String(tx?.type || "").toLowerCase();
    const txStatus = String(tx?.status || "completed").toLowerCase();
    const txModel = String(tx?.onModel || "");
    const txAmount = Number(tx?.amount || 0);

    if (txType !== "credit" || txAmount <= 0) return sum;
    if (!COUNTABLE_CREDIT_STATUSES.has(txStatus)) return sum;
    if (!KYC_CREDIT_LIMITED_REFERENCE_TYPES.has(txModel)) return sum;

    return sum + txAmount;
  }, 0);

async function UserUploadMarketController(req, res, next) {
  try {
    if (!req.userId) {
      const err = new Error("Unauthorized! Please login.");
      err.status = 401;
      throw err;
    }

    const submittedAmount = Number(req.body?.calculatedTotalAmount);
    if (!Number.isFinite(submittedAmount) || submittedAmount <= 0) {
      const err = new Error("Calculated total amount is required.");
      err.status = 400;
      throw err;
    }

    const user = await userModel.findById(req.userId).select("kycStatus");
    const limits = getKycFinancialLimits(user?.kycStatus);

    if (limits.isRestricted) {
      const wallet = await Wallet.findOne({ userId: req.userId }).select(
        "balance transactions",
      );
      const currentBalance = Number(wallet?.balance || 0);
      const usedCreditVolume = getNonKycCreditTransactionVolume(
        wallet?.transactions,
      );
      const projectedCreditVolume = usedCreditVolume + submittedAmount;
      const remainingCreditAllowance = Math.max(
        0,
        UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN - usedCreditVolume,
      );

      if (
        projectedCreditVolume > UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN
      ) {
        return res.status(403).json({
          success: false,
          error: true,
          code: "UNVERIFIED_MARKET_SUBMISSION_BLOCKED",
          message:
            "This trade cannot be submitted because it exceeds the cumulative transaction credit limit for unverified accounts. Complete KYC verification to continue. Unlimited balance and withdrawals are available once KYC is verified.",
          kycRedirectPath: "/kyc",
          details: {
            currentBalance,
            usedCreditVolume,
            projectedCreditVolume,
            estimatedCredit: submittedAmount,
            remainingCreditAllowance,
            maxCreditVolume: UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN,
          },
        });
      }
    }

    const newProduct = new userProduct({
      ...req.body,
      userId: req.userId,
    });
    const saveProduct = await newProduct.save();
    res.status(201).json({
      message: "Market uploaded successfully.",
      error: false,
      success: true,
      data: saveProduct,
    });
  } catch (err) {
    err.message = err.message || "Could not upload market. Please try again.";
    next(err);
  }
}

export default UserUploadMarketController;
