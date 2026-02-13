import userModel from "../../models/userModel.js";

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) throw new Error("Verification token is missing");

    const user = await userModel.findOne({ emailToken: token });
    if (!user) throw new Error("Invalid token");

    user.emailToken = null;
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Verification failed",
    });
  }
};
