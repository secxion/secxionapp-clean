import AuthorizedAdmin from "../../models/authorizedAdminModel.js";
import userModel from "../../models/userModel.js";
import { DEPARTMENTS } from "../../config/adminDepartments.js";

/**
 * Get all authorized admins
 * GET /api/admin/authorized-list
 */
export const getAuthorizedAdminsList = async (req, res) => {
  try {
    const admins = await AuthorizedAdmin.find({})
      .populate("authorizedBy", "name email")
      .sort({ department: 1, createdAt: -1 });

    // Group by department for better UI display
    const byDepartment = {};
    for (const admin of admins) {
      if (!byDepartment[admin.department]) {
        byDepartment[admin.department] = [];
      }
      byDepartment[admin.department].push(admin);
    }

    res.json({
      success: true,
      error: false,
      data: {
        list: admins,
        byDepartment,
        departments: Object.keys(DEPARTMENTS).map((key) => ({
          id: key,
          name: DEPARTMENTS[key].name,
          description: DEPARTMENTS[key].description,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getAuthorizedAdminsList:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Add a new authorized admin
 * POST /api/admin/authorize
 */
export const authorizeAdmin = async (req, res) => {
  try {
    const { email, department, note } = req.body;
    const authorizedBy = req.userId;

    // Validate inputs
    if (!email || !department) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email and department are required",
      });
    }

    // Check if department is valid
    if (!DEPARTMENTS[department]) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid department",
      });
    }

    // Check if email exists as a registered user
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User with this email not found. They must register first.",
      });
    }

    // Check if already authorized
    const existing = await AuthorizedAdmin.findOne({
      email: email.toLowerCase(),
      department,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: true,
        message: `${email} is already authorized for ${DEPARTMENTS[department].name}`,
      });
    }

    // Create authorization
    const admin = await AuthorizedAdmin.create({
      email: email.toLowerCase(),
      department,
      authorizedBy,
      note: note || "",
      isActive: true,
    });

    await admin.populate("authorizedBy", "name email");

    console.log(`✅ ${email} authorized for ${department} by user ${authorizedBy}`);

    res.status(201).json({
      success: true,
      error: false,
      message: `${email} is now authorized for ${DEPARTMENTS[department].name}`,
      data: admin,
    });
  } catch (error) {
    console.error("Error in authorizeAdmin:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "This email is already authorized for this department",
      });
    }
    
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Remove admin authorization
 * DELETE /api/admin/authorize/:id
 */
export const revokeAuthorization = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AuthorizedAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Authorization not found",
      });
    }

    await AuthorizedAdmin.findByIdAndDelete(id);

    console.log(`🚫 Revoked ${admin.email} access to ${admin.department}`);

    res.json({
      success: true,
      error: false,
      message: `Revoked ${admin.email} access to ${DEPARTMENTS[admin.department]?.name || admin.department}`,
    });
  } catch (error) {
    console.error("Error in revokeAuthorization:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Toggle admin active status
 * PUT /api/admin/authorize/:id/toggle
 */
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AuthorizedAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Authorization not found",
      });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    console.log(`${admin.isActive ? '✅' : '⏸️'} ${admin.email} ${admin.department} - ${admin.isActive ? 'activated' : 'deactivated'}`);

    res.json({
      success: true,
      error: false,
      message: `${admin.email} is now ${admin.isActive ? 'active' : 'inactive'} for ${DEPARTMENTS[admin.department]?.name || admin.department}`,
      data: admin,
    });
  } catch (error) {
    console.error("Error in toggleAdminStatus:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Migrate hardcoded admins to database (one-time use)
 * POST /api/admin/migrate-admins
 */
export const migrateHardcodedAdmins = async (req, res) => {
  try {
    const { AUTHORIZED_ADMINS } = await import("../../config/adminDepartments.js");
    const authorizedBy = req.userId;
    
    let migrated = 0;
    let skipped = 0;
    const errors = [];

    for (const [department, emails] of Object.entries(AUTHORIZED_ADMINS)) {
      for (const email of emails) {
        try {
          // Check if already exists
          const existing = await AuthorizedAdmin.findOne({
            email: email.toLowerCase(),
            department,
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Create authorization
          await AuthorizedAdmin.create({
            email: email.toLowerCase(),
            department,
            authorizedBy,
            note: "Migrated from config file",
            isActive: true,
          });
          migrated++;
        } catch (err) {
          errors.push(`${email} (${department}): ${err.message}`);
        }
      }
    }

    res.json({
      success: true,
      error: false,
      message: `Migration complete: ${migrated} added, ${skipped} skipped`,
      data: { migrated, skipped, errors },
    });
  } catch (error) {
    console.error("Error in migrateHardcodedAdmins:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};
