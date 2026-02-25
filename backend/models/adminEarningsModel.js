import mongoose from "mongoose";

// Track individual commission transactions
const adminEarningSchema = mongoose.Schema(
  {
    // Source of the earning
    sourceType: {
      type: String,
      enum: ["marketplace", "eth_withdrawal", "other"],
      required: true,
    },
    // Reference to the source document (e.g., userProduct ID)
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceModel",
      required: true,
    },
    sourceModel: {
      type: String,
      enum: ["userproduct", "EthWithdrawalRequest", "other"],
      required: true,
    },
    // User who made the transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Commission details
    originalAmount: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true, // e.g., 5 for 5%
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    userReceivedAmount: {
      type: Number,
      required: true,
    },
    // Transaction description
    description: {
      type: String,
      default: "",
    },
    // Status
    status: {
      type: String,
      enum: ["completed", "pending", "reversed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Platform settings for commission rates
const platformSettingsSchema = mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const AdminEarning = mongoose.model("AdminEarning", adminEarningSchema);
export const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema);

export default AdminEarning;
