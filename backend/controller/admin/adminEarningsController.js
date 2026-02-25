import { 
  getEarningsSummary, 
  getAllEarnings, 
  getCommissionRate, 
  setCommissionRate 
} from "../../helpers/commissionHelper.js";
import { AdminWallet, AdminPayout, AdminEarning } from "../../models/adminEarningsModel.js";
import userModel from "../../models/userModel.js";
import { AUTHORIZED_ADMINS } from "../../config/adminDepartments.js";

/**
 * Get earnings summary/dashboard data
 * GET /api/admin/earnings/summary
 */
export const getAdminEarningsSummary = async (req, res) => {
  try {
    const { startDate, endDate, sourceType } = req.query;
    
    const result = await getEarningsSummary({ startDate, endDate, sourceType });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: true,
        message: result.error || "Failed to fetch earnings summary",
      });
    }
    
    res.json({
      success: true,
      error: false,
      message: "Earnings summary fetched successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getAdminEarningsSummary:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all earnings with pagination
 * GET /api/admin/earnings
 */
export const getAdminEarnings = async (req, res) => {
  try {
    const { page = 1, limit = 50, sourceType, startDate, endDate } = req.query;
    
    const result = await getAllEarnings({
      page: parseInt(page),
      limit: parseInt(limit),
      sourceType,
      startDate,
      endDate,
    });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: true,
        message: result.error || "Failed to fetch earnings",
      });
    }
    
    res.json({
      success: true,
      error: false,
      message: "Earnings fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getAdminEarnings:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get commission rates
 * GET /api/admin/commission-rates
 */
export const getCommissionRates = async (req, res) => {
  try {
    const [marketplace, eth_withdrawal] = await Promise.all([
      getCommissionRate("marketplace"),
      getCommissionRate("eth_withdrawal"),
    ]);
    
    res.json({
      success: true,
      error: false,
      data: {
        marketplace,
        eth_withdrawal,
      },
    });
  } catch (error) {
    console.error("Error in getCommissionRates:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Update commission rate
 * PUT /api/admin/commission-rates
 */
export const updateCommissionRate = async (req, res) => {
  try {
    const { type, rate } = req.body;
    
    if (!type || rate === undefined) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Type and rate are required",
      });
    }
    
    if (rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Rate must be between 0 and 100",
      });
    }
    
    const result = await setCommissionRate(type, rate);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: true,
        message: result.error || "Failed to update commission rate",
      });
    }
    
    res.json({
      success: true,
      error: false,
      message: `Commission rate for ${type} updated to ${rate}%`,
      data: { type, rate },
    });
  } catch (error) {
    console.error("Error in updateCommissionRate:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all admin wallets (Super Admin only)
 * GET /api/admin/wallets
 */
export const getAdminWallets = async (req, res) => {
  try {
    const wallets = await AdminWallet.find({}).sort({ balance: -1 });
    
    res.json({
      success: true,
      error: false,
      data: wallets,
    });
  } catch (error) {
    console.error("Error in getAdminWallets:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get or create admin wallet for current user
 * GET /api/admin/wallet/me
 */
export const getMyAdminWallet = async (req, res) => {
  try {
    const adminId = req.userId;
    const adminEmail = req.user?.email;
    const department = req.department || "UNKNOWN";
    
    let wallet = await AdminWallet.findOne({ adminId });
    
    if (!wallet) {
      wallet = await AdminWallet.create({
        adminId,
        email: adminEmail,
        department,
        balance: 0,
        totalReceived: 0,
        totalWithdrawn: 0,
      });
    }
    
    res.json({
      success: true,
      error: false,
      data: wallet,
    });
  } catch (error) {
    console.error("Error in getMyAdminWallet:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get platform total balance (from all commissions)
 * GET /api/admin/earnings/platform-balance
 */
export const getPlatformBalance = async (req, res) => {
  try {
    // Sum all commission amounts
    const result = await AdminEarning.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);
    
    const totalEarnings = result[0]?.total || 0;
    
    // Sum all payouts made
    const payoutsResult = await AdminPayout.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalPayouts = payoutsResult[0]?.total || 0;
    
    // Available balance = total earnings - total payouts
    const availableBalance = totalEarnings - totalPayouts;
    
    res.json({
      success: true,
      error: false,
      data: {
        totalEarnings,
        totalPayouts,
        availableBalance,
      },
    });
  } catch (error) {
    console.error("Error in getPlatformBalance:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get list of all authorized admins for payout dropdown
 * GET /api/admin/authorized-admins
 */
export const getAuthorizedAdmins = async (req, res) => {
  try {
    // Get all authorized admin emails from config
    const adminList = [];
    
    for (const [dept, emails] of Object.entries(AUTHORIZED_ADMINS)) {
      for (const email of emails) {
        // Find user by email
        const user = await userModel.findOne({ email });
        if (user) {
          adminList.push({
            _id: user._id,
            email: user.email,
            name: user.name,
            department: dept,
          });
        }
      }
    }
    
    res.json({
      success: true,
      error: false,
      data: adminList,
    });
  } catch (error) {
    console.error("Error in getAuthorizedAdmins:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Transfer funds to another admin (Super Admin only)
 * POST /api/admin/payout
 */
export const createAdminPayout = async (req, res) => {
  try {
    const { toAdminId, amount, note } = req.body;
    const fromAdminId = req.userId;
    const fromEmail = req.user?.email;
    
    // Validate
    if (!toAdminId || !amount) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Recipient and amount are required",
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Amount must be greater than 0",
      });
    }
    
    // Check platform balance
    const earningsResult = await AdminEarning.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;
    
    const payoutsResult = await AdminPayout.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPayouts = payoutsResult[0]?.total || 0;
    
    const availableBalance = totalEarnings - totalPayouts;
    
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: true,
        message: `Insufficient balance. Available: ₦${availableBalance.toLocaleString()}`,
      });
    }
    
    // Get recipient info
    const toAdmin = await userModel.findById(toAdminId);
    if (!toAdmin) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Recipient admin not found",
      });
    }
    
    // Find recipient's department
    let toDepartment = "UNKNOWN";
    for (const [dept, emails] of Object.entries(AUTHORIZED_ADMINS)) {
      if (emails.includes(toAdmin.email)) {
        toDepartment = dept;
        break;
      }
    }
    
    // Create payout record
    const payout = await AdminPayout.create({
      fromAdminId,
      fromEmail,
      toAdminId,
      toEmail: toAdmin.email,
      toDepartment,
      amount,
      note: note || "",
      status: "completed",
    });
    
    // Update or create recipient's wallet
    let wallet = await AdminWallet.findOne({ adminId: toAdminId });
    if (!wallet) {
      wallet = await AdminWallet.create({
        adminId: toAdminId,
        email: toAdmin.email,
        department: toDepartment,
        balance: amount,
        totalReceived: amount,
        totalWithdrawn: 0,
      });
    } else {
      wallet.balance += amount;
      wallet.totalReceived += amount;
      await wallet.save();
    }
    
    res.json({
      success: true,
      error: false,
      message: `Successfully sent ₦${amount.toLocaleString()} to ${toAdmin.email}`,
      data: payout,
    });
  } catch (error) {
    console.error("Error in createAdminPayout:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get payout history
 * GET /api/admin/payouts
 */
export const getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const payouts = await AdminPayout.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await AdminPayout.countDocuments({});
    
    res.json({
      success: true,
      error: false,
      data: payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getPayoutHistory:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};
