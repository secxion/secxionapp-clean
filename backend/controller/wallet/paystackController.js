import axios from "axios";

let cachedBanks = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getPaystackBanks = async (req, res) => {
  const now = Date.now();

  if (cachedBanks && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    return res.status(200).json({ success: true, data: cachedBanks });
  }

  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    cachedBanks = response.data.data;
    cacheTimestamp = now;

    return res.status(200).json({ success: true, data: cachedBanks });
  } catch (error) {
    console.error(
      "Paystack bank list error:",
      error?.response?.data || error.message,
    );

    const fallbackBanks = [
      { name: "Access Bank", code: "044" },
      { name: "GTBank", code: "058" },
      { name: "Zenith Bank", code: "057" },
      { name: "First Bank", code: "011" },
      { name: "UBA", code: "033" },
      { name: "Fidelity Bank", code: "070" },
      { name: "Stanbic IBTC Bank", code: "221" },
      { name: "Union Bank", code: "032" },
      { name: "Polaris Bank", code: "076" },
      { name: "Wema Bank", code: "035" },
    ];

    return res.status(200).json({
      success: true,
      data: fallbackBanks,
      message: "Using fallback bank list due to API error.",
    });
  }
};

export const resolveBankAccount = async (req, res) => {
  const { account_number, bank_code } = req.body;

  if (!account_number || !bank_code) {
    return res.status(400).json({
      success: false,
      message: "Account number and bank code are required.",
    });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Account resolved successfully",
      data: {
        account_name: response.data.data.account_name,
        bank_name: response.data.data.bank_name || "",
      },
    });
  } catch (error) {
    console.error(
      "Paystack resolve error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to resolve account number",
      error: error.message,
    });
  }
};
