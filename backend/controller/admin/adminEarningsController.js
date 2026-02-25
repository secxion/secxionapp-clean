import { 
  getEarningsSummary, 
  getAllEarnings, 
  getCommissionRate, 
  setCommissionRate 
} from "../../helpers/commissionHelper.js";

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
