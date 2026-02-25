import { AdminEarning, PlatformSettings } from "../models/adminEarningsModel.js";

// Default commission rates
const DEFAULT_RATES = {
  marketplace: 5, // 5% commission on marketplace sales
  eth_withdrawal: 10, // 10% on ETH withdrawals (already exists)
};

/**
 * Get commission rate for a specific type
 * @param {string} type - "marketplace" | "eth_withdrawal" | "other"
 * @returns {Promise<number>} - Commission rate as percentage
 */
export const getCommissionRate = async (type = "marketplace") => {
  try {
    const setting = await PlatformSettings.findOne({ key: `commission_${type}` });
    if (setting) {
      return parseFloat(setting.value);
    }
    return DEFAULT_RATES[type] || 5;
  } catch (error) {
    console.error("Error fetching commission rate:", error);
    return DEFAULT_RATES[type] || 5;
  }
};

/**
 * Set commission rate for a specific type
 * @param {string} type - "marketplace" | "eth_withdrawal" | "other"
 * @param {number} rate - Commission rate as percentage
 */
export const setCommissionRate = async (type, rate) => {
  try {
    await PlatformSettings.findOneAndUpdate(
      { key: `commission_${type}` },
      { 
        value: rate, 
        description: `Commission rate for ${type} transactions` 
      },
      { upsert: true, new: true }
    );
    return { success: true, rate };
  } catch (error) {
    console.error("Error setting commission rate:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate commission and amounts
 * @param {number} originalAmount - Original transaction amount
 * @param {number} rate - Commission rate as percentage
 * @returns {object} - { commissionAmount, userReceivedAmount }
 */
export const calculateCommission = (originalAmount, rate) => {
  const amount = parseFloat(originalAmount) || 0;
  const commissionRate = parseFloat(rate) || 5;
  
  const commissionAmount = (amount * commissionRate) / 100;
  const userReceivedAmount = amount - commissionAmount;
  
  return {
    commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimal places
    userReceivedAmount: Math.round(userReceivedAmount * 100) / 100,
  };
};

/**
 * Record a commission earning
 * @param {object} params - Earning details
 */
export const recordEarning = async ({
  sourceType,
  sourceId,
  sourceModel,
  userId,
  originalAmount,
  commissionRate,
  commissionAmount,
  userReceivedAmount,
  description = "",
}) => {
  try {
    const earning = new AdminEarning({
      sourceType,
      sourceId,
      sourceModel,
      userId,
      originalAmount,
      commissionRate,
      commissionAmount,
      userReceivedAmount,
      description,
      status: "completed",
    });
    
    await earning.save();
    
    return { success: true, earning };
  } catch (error) {
    console.error("Error recording earning:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Process marketplace commission
 * Called when admin approves a marketplace sale (status = DONE)
 * @param {object} marketProduct - The userProduct document
 * @returns {object} - { success, commissionAmount, userReceivedAmount }
 */
export const processMarketplaceCommission = async (marketProduct) => {
  try {
    const originalAmount = parseFloat(marketProduct.calculatedTotalAmount) || 0;
    
    if (originalAmount <= 0) {
      return { 
        success: true, 
        commissionAmount: 0, 
        userReceivedAmount: 0,
        message: "No amount to process" 
      };
    }
    
    const rate = await getCommissionRate("marketplace");
    const { commissionAmount, userReceivedAmount } = calculateCommission(originalAmount, rate);
    
    // Record the earning
    await recordEarning({
      sourceType: "marketplace",
      sourceId: marketProduct._id,
      sourceModel: "userproduct",
      userId: marketProduct.userId,
      originalAmount,
      commissionRate: rate,
      commissionAmount,
      userReceivedAmount,
      description: `Commission from ${marketProduct.productName || "marketplace sale"}`,
    });
    
    return {
      success: true,
      originalAmount,
      commissionRate: rate,
      commissionAmount,
      userReceivedAmount,
    };
  } catch (error) {
    console.error("Error processing marketplace commission:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get admin earnings summary
 * @param {object} filters - Optional filters { startDate, endDate, sourceType }
 */
export const getEarningsSummary = async (filters = {}) => {
  try {
    const query = { status: "completed" };
    
    if (filters.sourceType) {
      query.sourceType = filters.sourceType;
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    // Get total earnings
    const aggregation = await AdminEarning.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commissionAmount" },
          totalOriginalAmount: { $sum: "$originalAmount" },
          totalUserPaid: { $sum: "$userReceivedAmount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);
    
    // Get earnings by source type
    const bySourceType = await AdminEarning.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$sourceType",
          totalCommission: { $sum: "$commissionAmount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);
    
    // Get recent earnings
    const recentEarnings = await AdminEarning.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "name email");
    
    return {
      success: true,
      data: {
        summary: aggregation[0] || {
          totalCommission: 0,
          totalOriginalAmount: 0,
          totalUserPaid: 0,
          transactionCount: 0,
        },
        bySourceType,
        recentEarnings,
      },
    };
  } catch (error) {
    console.error("Error getting earnings summary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all earnings with pagination
 */
export const getAllEarnings = async ({ page = 1, limit = 50, sourceType, startDate, endDate }) => {
  try {
    const query = {};
    
    if (sourceType && sourceType !== "all") {
      query.sourceType = sourceType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [earnings, total] = await Promise.all([
      AdminEarning.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      AdminEarning.countDocuments(query),
    ]);
    
    return {
      success: true,
      data: earnings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting all earnings:", error);
    return { success: false, error: error.message };
  }
};
