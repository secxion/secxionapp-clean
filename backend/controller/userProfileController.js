import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import Wallet from "../models/walletModel.js";

const userProfileController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized, user ID not found",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Fetch user's wallet details
    const wallet = await Wallet.findOne({ userId: req.userId });
    let walletBalance = null;
    let bankAccounts = [];

    if (wallet) {
      walletBalance = wallet.balance;
      bankAccounts = wallet.bankAccounts;
    }

    res.status(200).json({
      data: {
        ...user.toObject(), // Convert Mongoose document to plain object
        walletBalance,
        bankAccounts,
      },
      error: false,
      success: true,
      message: "User profile details",
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      message: err.message || "Failed to fetch user profile",
      error: true,
      success: false,
    });
  }
};

// Controller function to edit user profile
const editProfileController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized, user ID not found",
        error: true,
        success: false,
      });
    }

    const { name, tag, telegramNumber, profilePic, password, newPassword } =
      req.body;
    const updateFields = {};

    if (name) updateFields.name = name.trim();
    if (tag) updateFields.tag = tag.trim();
    if (telegramNumber) updateFields.telegramNumber = telegramNumber.trim();
    if (profilePic) updateFields.profilePic = profilePic;

    if (password && newPassword) {
      const user = await userModel.findById(req.userId).select("+password");
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", error: true, success: false });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({
            message: "Incorrect current password",
            error: true,
            success: false,
          });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password = hashedPassword;
    } else if (password || newPassword) {
      // If one password field is filled but not both, reject
      return res
        .status(400)
        .json({
          message:
            "Both current and new password are required to change password",
          error: true,
          success: false,
        });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.userId, updateFields, { new: true })
      .select("-password");
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in editProfileController:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
};

// Controller function to get a specific user's bank accounts
const getUserBankAccountsController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user ID not found.",
      });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: wallet.bankAccounts,
    });
  } catch (error) {
    console.error("Error fetching user bank accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bank accounts.",
      error: error.message,
    });
  }
};

// Controller function to get a specific user's wallet balance
const getUserWalletBalanceController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user ID not found.",
      });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error fetching user wallet balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user wallet balance.",
      error: error.message,
    });
  }
};

// Controller function to add a bank account to a user's wallet
const addBankAccountController = async (req, res) => {
  try {
    const userId = req.userId;
    const { accountNumber, bankName, accountHolderName } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    if (wallet.bankAccounts.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "You cannot add more than 2 bank accounts.",
      });
    }

    const accountExists = wallet.bankAccounts.some(
      (account) =>
        account.accountNumber === accountNumber &&
        account.bankName === bankName,
    );
    if (accountExists) {
      return res.status(409).json({
        success: false,
        message: "This bank account is already added.",
      });
    }

    const newBankAccount = {
      accountNumber,
      bankName,
      accountHolderName,
    };

    wallet.bankAccounts.push(newBankAccount);
    await wallet.save();

    res.status(201).json({
      success: true,
      message: "Bank account added successfully.",
      data: wallet.bankAccounts,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add bank account.",
      error: error.message,
    });
  }
};

// Controller function to delete a bank account from a user's wallet
const deleteBankAccountController = async (req, res) => {
  try {
    const userId = req.userId;
    const { accountId } = req.params;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    const initialLength = wallet.bankAccounts.length;
    wallet.bankAccounts = wallet.bankAccounts.filter(
      (account) => account._id.toString() !== accountId,
    );

    if (wallet.bankAccounts.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found.",
      });
    }

    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Bank account deleted successfully.",
      data: wallet.bankAccounts,
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bank account.",
      error: error.message,
    });
  }
};

export default {
  userProfileController,
  editProfileController,
  getUserBankAccountsController,
  getUserWalletBalanceController,
  addBankAccountController,
  deleteBankAccountController,
};
