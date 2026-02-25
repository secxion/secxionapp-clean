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

// Admin wallet to track each admin's balance
const adminWalletSchema = mongoose.Schema(
  {
    // Admin user ID
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Admin email (for easy lookup)
    email: {
      type: String,
      required: true,
    },
    // Department
    department: {
      type: String,
      required: true,
    },
    // Current balance
    balance: {
      type: Number,
      default: 0,
    },
    // Total received all time
    totalReceived: {
      type: Number,
      default: 0,
    },
    // Total withdrawn
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Track payouts from Super Admin to other admins
const adminPayoutSchema = mongoose.Schema(
  {
    // Who sent the payout (Super Admin)
    fromAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
    },
    // Who received the payout
    toAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toEmail: {
      type: String,
      required: true,
    },
    toDepartment: {
      type: String,
      required: true,
    },
    // Amount
    amount: {
      type: Number,
      required: true,
    },
    // Note/reason
    note: {
      type: String,
      default: "",
    },
    // Status
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

export const AdminEarning = mongoose.model("AdminEarning", adminEarningSchema);
export const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema);
export const AdminWallet = mongoose.model("AdminWallet", adminWalletSchema);
export const AdminPayout = mongoose.model("AdminPayout", adminPayoutSchema);

export default AdminEarning;
