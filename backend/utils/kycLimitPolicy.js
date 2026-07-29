export const UNVERIFIED_WITHDRAWAL_LIMIT_NGN = 50000;
export const UNVERIFIED_MAX_WALLET_BALANCE_NGN = 500000;

export const isKycApproved = (kycStatus) =>
  String(kycStatus || "").toLowerCase() === "approved";

export const isRestrictedKycTier = (kycStatus) => !isKycApproved(kycStatus);

export const getKycFinancialLimits = (kycStatus) => {
  if (isKycApproved(kycStatus)) {
    return {
      isRestricted: false,
      withdrawalLimit: null,
      walletBalanceCap: null,
    };
  }

  return {
    isRestricted: true,
    withdrawalLimit: UNVERIFIED_WITHDRAWAL_LIMIT_NGN,
    walletBalanceCap: UNVERIFIED_MAX_WALLET_BALANCE_NGN,
  };
};
