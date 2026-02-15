import bcrypt from "bcryptjs";
import userModel from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { verifySliderValue } from "../../utils/sliderVerification.js";

async function userSignInController(req, res, next) {
  try {
    const { email: rawEmail, password, sliderValue, targetValue, slider } = req.body;
    const email = rawEmail?.toLowerCase().trim();
    console.log("🔐 Login attempt:");
    console.log("📧 Email:", email);
    console.log("🎯 Target:", targetValue);
    console.log("📍 Slider:", sliderValue);
    console.log("📩 Slider Signature Object:", slider);
    if (!email || !password) {
      const err = new Error("Please provide email and password.");
      err.status = 400;
      throw err;
    }
    if (
      typeof sliderValue !== "number" ||
      typeof targetValue !== "number" ||
      Math.abs(sliderValue - targetValue) > 3
    ) {
      const err = new Error("Verification failed. Please try again.");
      err.status = 403;
      throw err;
    }
    if (!slider || !verifySliderValue(slider.value, slider.signature)) {
      const err = new Error("Verification failed. Please try again.");
      err.status = 403;
      throw err;
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      throw err;
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      const err = new Error("Incorrect password.");
      err.status = 401;
      throw err;
    }
    if (!user.isVerified) {
      const err = new Error("Please verify your email before logging in.");
      err.status = 403;
      throw err;
    }
    const tokenData = {
      _id: user._id,
      email: user.email,
    };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 60 * 60 * 8,
    });
    const tokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };
    console.log("✅ Login successful for:", email);
    res
      .cookie("token", token, tokenOptions)
      .status(200)
      .json({
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        success: true,
        error: false,
      });
  } catch (err) {
    console.error("🔥 Sign-in Error:", err);
    err.message = err.message || "Internal server error.";
    err.status = err.status || 500;
    next(err);
  }
}

export default userSignInController;
