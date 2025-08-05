import React, { useEffect, useState } from "react";
import axios from "axios";

const WithdrawEth = ({ userEthBalance }) => {
  const [ethAmount, setEthAmount] = useState("");
  const [usdValue, setUsdValue] = useState(null);
  const [nairaValue, setNairaValue] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const MIN_WITHDRAWAL = 0.01;

  // ✅ Real-time ETH/USD and USD/NGN conversion
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [ethRes, usdToNgnRes] = await Promise.all([
          axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"),
          axios.get("https://open.er-api.com/v6/latest/USD"),
        ]);

        const ethUsd = ethRes.data.ethereum.usd;
        const usdToNgn = usdToNgnRes.data.rates.NGN;

        setConversionRate(ethUsd);
        setUsdValue(ethAmount ? (ethAmount * ethUsd).toFixed(2) : null);
        setNairaValue(ethAmount ? (ethAmount * ethUsd * usdToNgn).toFixed(2) : null);
      } catch (err) {
        console.error("Error fetching exchange rates", err);
        setError("Unable to fetch conversion rates. Please try again later.");
      }
    };

    fetchRates();
  }, [ethAmount]);

  // ✅ Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(ethAmount);

    if (!amount || isNaN(amount)) {
      return setError("Enter a valid ETH amount.");
    }

    if (amount < MIN_WITHDRAWAL) {
      return setError(`Minimum withdrawal amount is ${MIN_WITHDRAWAL} ETH.`);
    }

    if (amount > userEthBalance) {
      return setError("Insufficient balance.");
    }

    // Proceed with withdrawal
    setError("");
    alert(`Withdrawing ${amount} ETH (≈ $${usdValue}, ₦${nairaValue})`);
    // Add your withdrawal API call here
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-xl rounded-xl mt-10">
      <h2 className="text-xl font-bold text-center mb-4">Withdraw ETH</h2>

      <div className="space-y-3">
        <input
          type="number"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          placeholder="Enter ETH amount"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {usdValue && (
          <div className="text-sm text-gray-700">
            ≈ ${usdValue} USD / ₦{nairaValue} NGN
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          onClick={handleWithdraw}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300"
        >
          Withdraw
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Your ETH Balance: {userEthBalance} ETH
      </div>

      {isMobile && (
        <div className="mt-2 text-xs text-yellow-600 text-center">
          Mobile mode active — optimized for smaller screens.
        </div>
      )}
    </div>
  );
};

export default WithdrawEth;
