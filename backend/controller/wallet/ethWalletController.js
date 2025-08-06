import EthWallet from "../../models/ethWalletModel.js";
import Wallet from "../../models/walletModel.js";
import axios from "axios";

// Replace with a public exchange API or Etherscan if needed
const getEthToNairaRate = async () => {
  const { data } = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
  return data.data.rates.NGN;
};

export const saveEthWalletAddress = async (req, res) => {
  try {
    const { ethAddress } = req.body;
    const userId = req.userId;

    if (!ethAddress) {
      return res.status(400).json({ success: false, message: "ETH address is required." });
    }

    let wallet = await EthWallet.findOne({ userId });
    if (!wallet) {
      wallet = new EthWallet({ userId, ethAddress });
    } else {
      wallet.ethAddress = ethAddress;
    }

    await wallet.save();
    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error("Error saving ETH address:", err);
    res.status(500).json({ success: false, message: "Error saving ETH address", error: err.message });
  }
};

export const getUserEthWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await EthWallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "ETH Wallet not found" });
    }

    const ethToNaira = await getEthToNairaRate();
    const nairaWallet = await Wallet.findOne({ userId });
    const ethEquivalent = (nairaWallet?.balance || 0) / parseFloat(ethToNaira);

    res.status(200).json({
      success: true,
      ethWallet: wallet,
      nairaBalance: nairaWallet?.balance || 0,
      ethEquivalent: ethEquivalent.toFixed(6),
      exchangeRate: ethToNaira
    });
  } catch (error) {
    console.error("Error fetching ETH wallet:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ETH wallet", error: error.message });
  }
};

export const withdrawEth = async (req, res) => {
  try {
    const { toAddress, amountEth } = req.body;
    const userId = req.userId;

    if (!toAddress || !amountEth) {
      return res.status(400).json({ success: false, message: "Address and amount required" });
    }

    // Simulate withdrawal or integrate a custodial service
    // Just log/store this for now
    console.log(`Withdraw ${amountEth} ETH to ${toAddress} for user ${userId}`);

    res.status(200).json({ success: true, message: `Withdrawal request to ${toAddress} for ${amountEth} ETH submitted.` });
  } catch (err) {
    console.error("Withdraw error:", err);
    res.status(500).json({ success: false, message: "ETH withdrawal failed", error: err.message });
  }
};
