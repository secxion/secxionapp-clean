import userModel from "../../models/userModel.js";

export const verifyEmailController = async (req, res) => {
  try {
    const { token, redirect } = req.query;
    if (!token) throw new Error("Verification token is missing");

    const normalizedToken = decodeURIComponent(token);
    const user = await userModel.findOne({ emailToken: normalizedToken });
    if (!user) throw new Error("Invalid token");

    user.emailToken = null;
    user.isVerified = true;
    await user.save();

    const successMessage = "Email verified successfully. You can now log in.";
    if (redirect) {
      return res.redirect(
        `${redirect}?status=success&message=${encodeURIComponent(successMessage)}`,
      );
    }

    res.json({
      success: true,
      message: successMessage,
    });
  } catch (err) {
    const errorMessage = err.message || "Verification failed";
    if (req.query?.redirect) {
      return res.redirect(
        `${req.query.redirect}?status=error&message=${encodeURIComponent(errorMessage)}`,
      );
    }

    res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }
};
