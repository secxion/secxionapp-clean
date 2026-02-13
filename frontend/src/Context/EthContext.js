// EthContext.js - ETH wallet state provider
import React, { useState } from 'react';
import SummaryApi from '../common';

export const EthContext = React.createContext();

const SERVICE_FEE_PERCENT = 1.5; // 1.5% service fee

export const EthProvider = ({ children }) => {
  const [ethRate, setEthRate] = useState(0); // ETH to NGN
  const [gasFee, setGasFee] = useState('0.00000000'); // ETH gas fee
  const [serviceFeePercent] = useState(SERVICE_FEE_PERCENT); // %
  const [nairaBalance, setNairaBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState('0.000000');

  /**
   * ✅ Fetch ETH price (NGN)
   */
  const fetchEthRate = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(SummaryApi.fetchEthPrice.url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to fetch ETH rate');
      const data = await response.json();
      const rate = data?.ethereum?.ngn || 0;
      setEthRate(rate);
      return rate;
    } catch (error) {
      console.error('fetchEthRate error:', error);
      setEthRate(0);
      return 0;
    }
  };

  /**
   * ✅ Fetch Gas Fee from Public Ethereum RPC (no API key required)
   */
  const fetchGasFee = async () => {
    const ETH_RPC_ENDPOINTS = [
      'https://ethereum-rpc.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://cloudflare-eth.com',
    ];

    for (const rpcUrl of ETH_RPC_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_gasPrice',
            params: [],
            id: 1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;
        const data = await response.json();

        // Result is gas price in Wei (hex), convert to ETH for total tx cost
        const gasPriceWei = parseInt(data?.result || '0x0', 16);
        const estimatedGasUnits = 21000; // Standard ETH transfer
        const gasFeeWei = gasPriceWei * estimatedGasUnits;
        const gasFeeEth = gasFeeWei / 1e18; // Wei to ETH

        if (gasFeeEth > 0) {
          // Store full precision - no rounding
          setGasFee(gasFeeEth.toPrecision(12));
          return gasFeeEth;
        }
      } catch (error) {
        console.warn(`Gas fee fetch failed from ${rpcUrl}:`, error.message);
        continue;
      }
    }

    // All endpoints failed, use default
    console.error('All gas fee endpoints failed, using default');
    setGasFee('0.00105');
    return 0.00105;
  };

  /**
   * ✅ Fetch Wallet Balance (NGN + convert to ETH)
   */
  const fetchWalletBalance = async (userId) => {
    if (!userId) {
      setNairaBalance(0);
      setEthBalance('0.000000');
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const balanceRes = await fetch(SummaryApi.getWalletBalance.url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!balanceRes.ok) throw new Error('Failed to fetch wallet balance');
      const balanceData = await balanceRes.json();

      const naira = balanceData.balance || 0;
      setNairaBalance(naira);

      let currentEthRate = ethRate;
      if (currentEthRate === 0) {
        currentEthRate = await fetchEthRate();
      }

      if (currentEthRate > 0) {
        const ethValue = naira / currentEthRate;
        setEthBalance(ethValue.toFixed(6));
      } else {
        setEthBalance('0.000000');
      }
    } catch (error) {
      console.error('fetchWalletBalance error:', error);
      setNairaBalance(0);
      setEthBalance('0.000000');
    }
  };

  /**
   * ✅ Calculate Service Fee (applied to transaction amount)
   */
  const calculateServiceFee = (amountEth) => {
    if (!amountEth || isNaN(amountEth)) return 0;
    return (amountEth * serviceFeePercent) / 100;
  };

  /**
   * ✅ Calculate Total Transaction Cost = Amount + Gas Fee + Service Fee
   */
  const calculateTotalCost = (amountEth) => {
    const serviceFeeEth = calculateServiceFee(amountEth);
    const gasFeeEth = parseFloat(gasFee) || 0;
    return amountEth + serviceFeeEth + gasFeeEth;
  };

  return (
    <EthContext.Provider
      value={{
        ethRate,
        gasFee,
        serviceFeePercent,
        nairaBalance,
        ethBalance,
        fetchEthRate,
        fetchGasFee,
        fetchWalletBalance,
        calculateServiceFee,
        calculateTotalCost,
      }}
    >
      {children}
    </EthContext.Provider>
  );
};
