/**
 * Wallet Cache Utility
 * Implements caching for wallet-related data to reduce API calls
 * Supports multiple cache entries with different TTL values
 */

const CACHE_PREFIX = 'wallet_cache_';
const BALANCE_TTL = 5 * 60 * 1000; // 5 minutes
const RATE_TTL = 10 * 60 * 1000; // 10 minutes
const GAS_FEE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Format cache key
 */
const formatCacheKey = (key) => `${CACHE_PREFIX}${key}`;

/**
 * Get cached wallet balance
 * @param {string} userId - User ID
 * @returns {object|null} Cached balance data or null if expired
 */
export const getCachedWalletBalance = (userId) => {
  if (!userId) return null;

  const cacheKey = formatCacheKey(`balance_${userId}`);
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > BALANCE_TTL;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error parsing cached wallet balance:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Set wallet balance cache
 * @param {string} userId - User ID
 * @param {number} balance - Balance amount
 */
export const setCachedWalletBalance = (userId, balance) => {
  if (!userId) return;

  const cacheKey = formatCacheKey(`balance_${userId}`);
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: balance,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('Error caching wallet balance:', error);
  }
};

/**
 * Invalidate wallet balance cache
 * @param {string} userId - User ID
 */
export const invalidateWalletBalanceCache = (userId) => {
  if (!userId) return;
  const cacheKey = formatCacheKey(`balance_${userId}`);
  localStorage.removeItem(cacheKey);
};

/**
 * Get cached ETH rate
 * @returns {object|null} Cached rate data or null if expired
 */
export const getCachedEthRate = () => {
  const cacheKey = formatCacheKey('eth_rate');
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > RATE_TTL;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error parsing cached ETH rate:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Set ETH rate cache
 * @param {number} rate - ETH to NGN rate
 */
export const setCachedEthRate = (rate) => {
  if (!rate) return;

  const cacheKey = formatCacheKey('eth_rate');
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: rate,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('Error caching ETH rate:', error);
  }
};

/**
 * Invalidate ETH rate cache
 */
export const invalidateEthRateCache = () => {
  const cacheKey = formatCacheKey('eth_rate');
  localStorage.removeItem(cacheKey);
};

/**
 * Get cached gas fee
 * @returns {object|null} Cached gas fee data or null if expired
 */
export const getCachedGasFee = () => {
  const cacheKey = formatCacheKey('gas_fee');
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > GAS_FEE_TTL;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error parsing cached gas fee:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Set gas fee cache
 * @param {number} gasFee - Gas fee amount
 */
export const setCachedGasFee = (gasFee) => {
  if (!gasFee) return;

  const cacheKey = formatCacheKey('gas_fee');
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: gasFee,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('Error caching gas fee:', error);
  }
};

/**
 * Invalidate gas fee cache
 */
export const invalidateGasFeeCache = () => {
  const cacheKey = formatCacheKey('gas_fee');
  localStorage.removeItem(cacheKey);
};

/**
 * Get cached transaction history
 * @param {string} userId - User ID
 * @returns {array|null} Cached transactions or null if expired
 */
export const getCachedTransactionHistory = (userId) => {
  if (!userId) return null;

  const cacheKey = formatCacheKey(`transactions_${userId}`);
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    // Transaction cache expires after 3 minutes
    const isExpired = Date.now() - timestamp > 3 * 60 * 1000;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error parsing cached transactions:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Set transaction history cache
 * @param {string} userId - User ID
 * @param {array} transactions - Transaction list
 */
export const setCachedTransactionHistory = (userId, transactions) => {
  if (!userId || !Array.isArray(transactions)) return;

  const cacheKey = formatCacheKey(`transactions_${userId}`);
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: transactions,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('Error caching transactions:', error);
  }
};

/**
 * Invalidate transaction history cache
 * @param {string} userId - User ID
 */
export const invalidateTransactionHistoryCache = (userId) => {
  if (!userId) return;
  const cacheKey = formatCacheKey(`transactions_${userId}`);
  localStorage.removeItem(cacheKey);
};

/**
 * Clear all wallet caches for a user
 * @param {string} userId - User ID
 */
export const clearWalletCache = (userId) => {
  if (!userId) return;

  try {
    invalidateWalletBalanceCache(userId);
    invalidateTransactionHistoryCache(userId);
    // Don't clear ETH rate and gas fee as they're global
  } catch (error) {
    console.error('Error clearing wallet cache:', error);
  }
};

/**
 * Clear all wallet-related caches
 */
export const clearAllWalletCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all wallet cache:', error);
  }
};

const walletCacheExport = {
  getCachedWalletBalance,
  setCachedWalletBalance,
  invalidateWalletBalanceCache,
  getCachedEthRate,
  setCachedEthRate,
  invalidateEthRateCache,
  getCachedGasFee,
  setCachedGasFee,
  invalidateGasFeeCache,
  getCachedTransactionHistory,
  setCachedTransactionHistory,
  invalidateTransactionHistoryCache,
  clearWalletCache,
  clearAllWalletCache,
};

export default walletCacheExport;
