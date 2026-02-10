/**
 * Simple request caching utility with TTL (Time To Live)
 * Caches API responses to reduce unnecessary requests
 * Useful for marketplace data that doesn't change frequently
 */

const cache = new Map();

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key (typically the URL)
 * @returns {any|null} Cached data or null if not found/expired
 */
export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.expiresAt) {
    // Cache expired, remove it
    cache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Store data in cache with TTL
 * @param {string} key - Cache key (typically the URL)
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export const setCachedData = (key, data, ttl = 5 * 60 * 1000) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  cache.delete(key);
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  cache.clear();
};

/**
 * Custom hook wrapper for cached fetch
 * @param {string} url - URL to fetch
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise} Fetch result
 */
export const fetchWithCache = async (url, ttl = 5 * 60 * 1000) => {
  // Check cache first
  const cached = getCachedData(url);
  if (cached) {
    return Promise.resolve(cached);
  }

  // Fetch fresh data
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    // Cache the result
    if (data) {
      setCachedData(url, data, ttl);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Clear cache after mutations (updates, deletes, creates)
 * @param {string} pattern - URL pattern to match (e.g., '/api/market')
 */
export const invalidateCachePatterns = (pattern) => {
  const keysToDelete = [];
  cache.forEach((value, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => cache.delete(key));
};
