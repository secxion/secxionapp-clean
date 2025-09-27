/**
 * Calculates estimated ETH gas fee based on transaction speed.
 * @param {string} speed - "slow", "medium", or "fast"
 * @returns {Promise<{ feeEth: string, gasPriceGwei: number, speed: string }>}
 */
export const calculateGasFee = async (priority = 'medium') => {
  try {
    console.log('🔄 Calculating gas fee with priority:', priority);

    // For now, return a mock gas fee calculation
    // In a real implementation, this would call an Ethereum gas price API
    const mockGasPrices = {
      low: {
        gasPrice: 20, // gwei
        gasLimit: 21000,
        feeEth: '0.00042',
        feeUsd: 1.5,
      },
      medium: {
        gasPrice: 25, // gwei
        gasLimit: 21000,
        feeEth: '0.000525',
        feeUsd: 1.8,
      },
      high: {
        gasPrice: 35, // gwei
        gasLimit: 21000,
        feeEth: '0.000735',
        feeUsd: 2.5,
      },
    };

    const gasData = mockGasPrices[priority] || mockGasPrices.medium;

    console.log('⛽ Gas fee calculated:', gasData);
    return gasData;
  } catch (error) {
    console.error('❌ Error calculating gas fee:', error);

    // Return fallback gas fee
    return {
      gasPrice: 25,
      gasLimit: 21000,
      feeEth: '0.000525',
      feeUsd: 1.8,
    };
  }
};
