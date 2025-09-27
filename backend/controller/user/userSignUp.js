import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../../utils/mailer.js";
import { updateWalletBalance } from "../wallet/walletController.js";


async function userSignUpController(req, res, next) {
  try {
    const { name, email, password, tag, profilePic, telegramNumber } = req.body;
    if (!name || !email || !password) {
      const err = new Error("Name, email, and password are required.");
      err.status = 400;
      throw err;
    }
    const userExistsByEmail = await userModel.findOne({ email });
    if (userExistsByEmail) {
      const err = new Error("A user with this email already exists.");
      err.status = 409;
      throw err;
    }
    const userExistsByName = await userModel.findOne({ name });
    if (userExistsByName) {
      const err = new Error("A user with this display name already exists. Please choose a different display name.");
      err.status = 409;
      throw err;
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
      emailError.message = "Sign-up temporarily unavailable due to system maintenance. Please try again shortly or contact support for registration.";
      emailError.status = 503;
      return next(emailError);
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
        err.message = `The display name \"${err.keyValue.name}\" is already taken. Please choose a unique display name.`;
        err.status = 409;
        return next(err);
      }
      if (err.keyPattern && err.keyPattern.email) {
        err.message = `A user with email \"${err.keyValue.email}\" already exists.`;
        err.status = 409;
        return next(err);
      }
    }
    err.message = err.message || "Sign-up temporarily unavailable due to system maintenance. Please try again shortly or contact support for registration.";
    err.status = err.status || 500;
    next(err);
  }
}

export default userSignUpController;