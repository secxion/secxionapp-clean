import userModel from "../../models/userModel.js";
import { sendVerificationEmail } from "../../utils/mailer.js";
import crypto from "crypto";

export const resendVerificationEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    const user = await userModel.findOne({ email });

    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("Email is already verified");

    // Generate a new token
    const token = crypto.randomBytes(32).toString("hex");
    user.emailToken = token;
    await user.save();

    await sendVerificationEmail(email, token);

    res.json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to resend verification email.",
    });
  }
};
