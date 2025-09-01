// ETHWallet.js
import React, { useState } from "react";
import SummaryApi from "../common";

export const EthContext = React.createContext();

const SERVICE_FEE_PERCENT = 1.5; // 1.5% service fee

export const EthProvider = ({ children }) => {
  const [ethRate, setEthRate] = useState(0); // ETH to NGN
  const [gasFee, setGasFee] = useState("0.000000"); // ETH gas fee
  const [serviceFeePercent] = useState(SERVICE_FEE_PERCENT); // %
  const [nairaBalance, setNairaBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState("0.000000");

  /**
   * ✅ Fetch ETH price (NGN)
   */
  const fetchEthRate = async () => {
    try {
      const response = await fetch(SummaryApi.fetchEthPrice.url);
      if (!response.ok) throw new Error("Failed to fetch ETH rate");
      const data = await response.json();
      const rate = data?.ethereum?.ngn || 0;
      setEthRate(rate);
      return rate;
    } catch (error) {
      console.error("fetchEthRate error:", error);
      setEthRate(0);
      return 0;
    }
  };

  /**
   * ✅ Fetch Gas Fee from Etherscan API
   */
  const fetchGasFee = async () => {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch gas fee");
      const data = await response.json();

      // Use "ProposeGasPrice" (average gas price in Gwei)
      const gasPriceGwei = parseFloat(data?.result?.ProposeGasPrice || 0);
      const estimatedGasUnits = 21000; // ETH transfer
      const gasFeeEth = (gasPriceGwei * estimatedGasUnits) / 1e9; // Convert Gwei → ETH

      setGasFee(gasFeeEth.toFixed(6));
      return gasFeeEth;
    } catch (error) {
      console.error("fetchGasFee error:", error);
      setGasFee("0.000000");
      return 0;
    }
  };

  /**
   * ✅ Fetch Wallet Balance (NGN + convert to ETH)
   */
  const fetchWalletBalance = async (userId) => {
    if (!userId) return;
    try {
      const balanceRes = await fetch(`${SummaryApi.getWalletBalance.url}/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!balanceRes.ok) throw new Error("Failed to fetch wallet balance");
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
        setEthBalance("0.000000");
      }
    } catch (error) {
      console.error("fetchWalletBalance error:", error);
      setNairaBalance(0);
      setEthBalance("0.000000");
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
