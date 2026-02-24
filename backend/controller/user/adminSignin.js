import bcrypt from "bcryptjs";
import userModel from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { 
  getDepartmentByKey, 
  isEmailAuthorized, 
  getDepartmentRoutes 
} from "../../config/adminDepartments.js";

/**
 * Admin Sign In Controller with Department-Based Access
 * 
 * Login flow:
 * 1. Validate department key
 * 2. Validate email + password
 * 3. Check if user's email is authorized for that department
 * 4. Issue JWT with department claim
 */
async function adminSignInController(req, res, next) {
  try {
    const { email: rawEmail, password, departmentKey } = req.body;
    const email = rawEmail?.toLowerCase().trim();
    
    console.log("🔐 Admin login attempt:");
    console.log("📧 Email:", email);
    console.log("🔑 Department key provided:", !!departmentKey);
    
    // Validate required fields
    if (!email || !password) {
      const err = new Error("Please provide email and password.");
      err.status = 400;
      throw err;
    }

    if (!departmentKey) {
      const err = new Error("Department key is required.");
      err.status = 400;
      throw err;
    }

    // Step 1: Validate department key
    const department = getDepartmentByKey(departmentKey);
    if (!department) {
      console.log("❌ Invalid department key");
      const err = new Error("Invalid department key.");
      err.status = 403;
      throw err;
    }
    console.log("✅ Department verified:", department.name);

    // Step 2: Find user
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      throw err;
    }

    // Step 3: Check password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      const err = new Error("Incorrect password.");
      err.status = 401;
      throw err;
    }

    // Step 4: Check if email is authorized for this department
    if (!isEmailAuthorized(email, department.id)) {
      console.log("❌ Email not authorized for department:", department.id);
      const err = new Error(`You are not authorized to access the ${department.name} department.`);
      err.status = 403;
      throw err;
    }
    console.log("✅ Email authorized for department:", department.id);

    // Step 5: Get allowed routes for this department
    const allowedRoutes = getDepartmentRoutes(department.id);

    // Step 6: Create JWT with department info
    const tokenData = {
      _id: user._id,
      email: user.email,
      department: department.id,
      departmentName: department.name,
      allowedRoutes: allowedRoutes
    };
    
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 60 * 60 * 8, // 8 hours
    });
    
    const tokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    console.log("✅ Admin login successful for:", email);
    console.log("📋 Department:", department.name);
    console.log("🛤️ Allowed routes:", allowedRoutes);

    res
      .cookie("token", token, tokenOptions)
      .status(200)
      .json({
        message: `Welcome to ${department.name}!`,
        data: {
          token,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          department: {
            id: department.id,
            name: department.name,
            description: department.description,
            allowedRoutes: allowedRoutes
          }
        },
        success: true,
        error: false,
      });
  } catch (err) {
    console.error("🔥 Admin Sign-in Error:", err.message);
    err.message = err.message || "Internal server error.";
    err.status = err.status || 500;
    next(err);
  }
}

export default adminSignInController;
