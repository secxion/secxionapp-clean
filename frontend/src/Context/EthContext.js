import React, { useState } from "react";
import SummaryApi from "../common";
import { calculateGasFee } from "../helper/calculateGasFee";

export const EthContext = React.createContext();

export const EthProvider = ({ children }) => {
  const [ethRate, setEthRate] = useState(0);
  const [gasFee, setGasFee] = useState("0.000000");
  const [nairaBalance, setNairaBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState("0.000000");

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

  const fetchGasFee = async () => {
    try {
      const gasData = await calculateGasFee("medium");
      const baseFee = parseFloat(gasData.feeEth);
      const bufferedFee = baseFee * 1.1;
      setGasFee(bufferedFee.toFixed(6));
      return bufferedFee;
    } catch (error) {
      console.error("fetchGasFee error:", error);
      setGasFee("0.000000");
      return 0;
    }
  };

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

  return (
    <EthContext.Provider
      value={{
        ethRate,
        setEthRate,
        gasFee,
        setGasFee,
        nairaBalance,
        setNairaBalance,
        ethBalance,
        setEthBalance,
        fetchEthRate,
        fetchGasFee,
        fetchWalletBalance,
      }}
    >
      {children}
    </EthContext.Provider>
  );
};
