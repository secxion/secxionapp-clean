export const UNVERIFIED_WITHDRAWAL_LIMIT_NGN = 50000;
export const UNVERIFIED_WITHDRAWAL_TOTAL_LIMIT_NGN = 50000;
export const UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN = 500000;
// Legacy alias kept to avoid breaking older imports.
export const UNVERIFIED_MAX_WALLET_BALANCE_NGN =
  UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN;

export const isKycApproved = (kycStatus) =>
  String(kycStatus || "").toLowerCase() === "approved";

export const isRestrictedKycTier = (kycStatus) => !isKycApproved(kycStatus);

export const getKycFinancialLimits = (kycStatus) => {
  if (isKycApproved(kycStatus)) {
    return {
      isRestricted: false,
      withdrawalLimit: null,
      walletBalanceCap: null,
      creditTransactionLimit: null,
    };
  }

  return {
    isRestricted: true,
    withdrawalLimit: UNVERIFIED_WITHDRAWAL_LIMIT_NGN,
    walletBalanceCap: UNVERIFIED_MAX_WALLET_BALANCE_NGN,
    creditTransactionLimit: UNVERIFIED_MAX_CREDIT_TRANSACTION_VOLUME_NGN,
  };
};
