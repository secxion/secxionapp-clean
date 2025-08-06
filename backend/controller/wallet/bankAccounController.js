import Wallet from "../../models/walletModel.js";
import { sendBankVerificationCode } from "../../utils/mailer.js";

const handleServerError = (res, error, contextMessage) => {
  console.error(`${contextMessage}:`, error);
  return res.status(500).json({
    success: false,
    message: contextMessage,
    error: error?.message || "Internal server error",
  });
};

export const addBankAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      accountNumber,
      bankName,
      bankCode,
      accountHolderName,
    } = req.body;

    if (!accountNumber || !bankName || !bankCode || !accountHolderName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided: account number, bank name, bank code, and resolved account name.",
      });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found for this user." });
    }

    if (wallet.bankAccounts.length >= 2) {
      return res.status(400).json({ success: false, message: "You cannot add more than 2 bank accounts." });
    }

    const alreadyExists = wallet.bankAccounts.some(
      (acc) =>
        acc.accountNumber === accountNumber &&
        acc.bankName === bankName &&
        acc.bankCode === bankCode
    );

    if (alreadyExists) {
      return res.status(409).json({ success: false, message: "This bank account is already added." });
    }

    wallet.bankAccounts.push({ accountNumber, bankName, bankCode, accountHolderName });
    await wallet.save();

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully.",
      data: wallet.bankAccounts,
    });
  } catch (error) {
    return handleServerError(res, error, "Error adding bank account");
  }
};

export const getBankAccounts = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found for this user." });
    }

    res.status(200).json({
      success: true,
      data: wallet.bankAccounts,
    });
  } catch (error) {
    return handleServerError(res, error, "Error fetching bank accounts");
  }
};

export const deleteBankAccount = async (req, res) => {
  try {
    const { userId } = req;
    const { accountId } = req.params;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found for this user." });
    }

    const initialLength = wallet.bankAccounts.length;
    wallet.bankAccounts = wallet.bankAccounts.filter(
      (account) => account._id.toString() !== accountId
    );

    if (wallet.bankAccounts.length === initialLength) {
      return res.status(404).json({ success: false, message: "Bank account not found." });
    }

    await wallet.save();
    res.status(200).json({
      success: true,
      message: "Bank account deleted successfully.",
      data: wallet.bankAccounts,
    });
  } catch (error) {
    return handleServerError(res, error, "Error deleting bank account");
  }
};

const verificationCodes = new Map();

export const sendBankAddCode = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized. Email not found." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendBankVerificationCode(email, code);
    res.status(200).json({ success: true, message: "Verification code sent to your email." });
  } catch (error) {
    return handleServerError(res, error, "Error sending bank verification code");
  }
};

export const verifyAndAddBankAccount = async (req, res) => {
  try {
    const { code, accountNumber, bankName, bankCode, accountHolderName } = req.body;
    const userId = req.userId;
    const email = req.user?.email;

    if (!code || !email || !accountNumber || !bankName || !bankCode || !accountHolderName) {
      return res.status(400).json({ success: false, message: "All fields and verification code are required." });
    }

    const stored = verificationCodes.get(email);
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    if (wallet.bankAccounts.length >= 2) {
      return res.status(400).json({ success: false, message: "Limit of 2 bank accounts reached." });
    }

    const exists = wallet.bankAccounts.some(
      (acc) => acc.accountNumber === accountNumber && acc.bankCode === bankCode
    );
    if (exists) {
      return res.status(409).json({ success: false, message: "Bank account already exists." });
    }

    wallet.bankAccounts.push({ accountNumber, bankName, bankCode, accountHolderName });
    await wallet.save();
    verificationCodes.delete(email);

    res.status(201).json({
      success: true,
      message: "Bank account added successfully.",
      data: wallet.bankAccounts,
    });
  } catch (error) {
    return handleServerError(res, error, "Error verifying and adding bank account");
  }
};
