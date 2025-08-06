import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../../utils/mailer.js";
import { updateWalletBalance } from "../wallet/walletController.js";

async function userSignUpController(req, res) {
  try {
    const { name, email, password, tag, profilePic, telegramNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const userExistsByEmail = await userModel.findOne({ email });
    if (userExistsByEmail) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const userExistsByName = await userModel.findOne({ name });
    if (userExistsByName) {
      return res.status(409).json({
        success: false,
        message: "A user with this display name already exists. Please choose a different display name.",
      });
    }

    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const emailToken = uuidv4();

    const tempUser = {
      name,
      email,
      password: hashPassword,
      tag,
      profilePic,
      telegramNumber,
      role: "GENERAL",
      isVerified: false,
      emailToken,
    };

    try {
      await sendVerificationEmail(email, emailToken);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(503).json({
        success: false,
        message: "Sign-up temporarily unavailable due to system maintenance. Please try again shortly or contact support for registration.",
      });
    }

    const newUser = new userModel(tempUser);
    await newUser.save();

    await updateWalletBalance(
      newUser._id,
      900,
      "credit",
      "Signup Bonus",
      newUser._id.toString(),
      "User"
    );

    return res.status(201).json({
      success: true,
      message: "Thank you for signing up! ₦900 signup bonus awarded. Please verify your email to continue.",
    });

  } catch (err) {
    console.error("Signup error:", err);

    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.name) {
        return res.status(409).json({
          success: false,
          message: `The display name "${err.keyValue.name}" is already taken. Please choose a unique display name.`,
        });
      }
       if (err.keyPattern && err.keyPattern.email) {
         return res.status(409).json({
          success: false,
          message: `A user with email "${err.keyValue.email}" already exists.`,
        });
       }
    }

    return res.status(500).json({
      success: false,
      message: "Sign-up temporarily unavailable due to system maintenance. Please try again shortly or contact support for registration.",
    });
  }
}

export default userSignUpController;