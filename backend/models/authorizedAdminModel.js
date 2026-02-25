import mongoose from "mongoose";

/**
 * Authorized Admin Schema
 * Stores admin emails and their department access
 * Super Admin can manage this from the panel
 */
const authorizedAdminSchema = mongoose.Schema(
  {
    // Admin email (must match a registered user)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Department they can access
    department: {
      type: String,
      required: true,
      enum: [
        "SUPER",
        "USERS",
        "PRODUCTS",
        "PAYMENTS",
        "ETH",
        "MARKET",
        "EARNINGS",
        "DATAPAD",
        "BLOG",
        "REPORTS",
        "COMMUNITY",
        "LIVESCRIPT",
      ],
    },
    // Who authorized this admin
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional note
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: same email can't be in same department twice
authorizedAdminSchema.index({ email: 1, department: 1 }, { unique: true });

const AuthorizedAdmin = mongoose.model("AuthorizedAdmin", authorizedAdminSchema);

export default AuthorizedAdmin;
