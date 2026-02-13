import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: String,
    profilePic: String,
    role: {
      type: String,
      default: "GENERAL",
    },
    tag: String,
    telegramNumber: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    signupIP: { type: String },
    emailToken: String,

    resetToken: { type: String },
    resetTokenExpiry: { type: Number },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
