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
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 25,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    kycStatus: {
      type: String,
      enum: ["unverified", "pending", "approved", "rejected"],
      default: "unverified",
    },
    kycVerifiedAt: {
      type: Date,
      default: null,
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
