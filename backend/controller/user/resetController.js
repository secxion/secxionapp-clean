import userModel from "../../models/userModel.js";
import { sendResetCodeEmail } from "../../utils/mailer.js";
import bcrypt from "bcryptjs";

// In-memory rate limit tracker
const rateLimitMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 15 minutes

function generateNumericCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export async function sendResetCode(req, res) {
  try {
    const { email, type } = req.body;

    if (!email || !["password", "telegram"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    // Rate limiting
    const now = Date.now();
    const record = rateLimitMap.get(email) || { count: 0, start: now };

    if (now - record.start < WINDOW_MS) {
      if (record.count >= MAX_ATTEMPTS) {
        return res.status(429).json({
          success: false,
          message: "Too many reset requests. Please try again later.",
        });
      }
      record.count++;
    } else {
      record.count = 1;
      record.start = now;
    }

    rateLimitMap.set(email, record);

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const code = generateNumericCode();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetToken = code;
    user.resetTokenExpiry = expiry;

    // Ensure Mongoose tracks field changes
    user.markModified("resetToken");
    user.markModified("resetTokenExpiry");

    await user.save();

    await sendResetCodeEmail(email, code, type);

    res.json({ success: true, message: `Reset code sent to ${email}` });
  } catch (err) {
    console.error("sendResetCode error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

export async function verifyReset(req, res) {
  try {
    const { email, code, newValue, type } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const submittedCode = code?.toString();
    const storedCode = user.resetToken?.toString();

    // Debug logs
    console.log("Submitted code:", submittedCode);
    console.log("Stored code:", storedCode);
    console.log("Token expiry:", user.resetTokenExpiry, "Current time:", Date.now());

    if (
      !storedCode ||
      submittedCode !== storedCode ||
      Date.now() > user.resetTokenExpiry
    ) {
      console.warn(`Failed reset attempt: email=${email}, code=${submittedCode}`);
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    if (type === "password") {
      user.password = bcrypt.hashSync(newValue, bcrypt.genSaltSync(10));
    } else if (type === "telegram") {
      user.telegramNumber = newValue;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.json({
      success: true,
      message: `${type === "password" ? "Password" : "Telegram number"} updated.`,
    });
  } catch (err) {
    console.error("verifyReset error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}
