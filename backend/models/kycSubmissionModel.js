import mongoose from "mongoose";

const kycHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedByEmail: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    reason: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const kycSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 25,
    },
    phoneVerification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      method: {
        type: String,
        enum: ["otp"],
        default: "otp",
      },
    },
    consent: {
      accepted: {
        type: Boolean,
        default: false,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
    },
    faceMatch: {
      status: {
        type: String,
        enum: ["not_started", "pending", "passed", "failed"],
        default: "not_started",
      },
      score: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },
      provider: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },
      referenceId: {
        type: String,
        default: "",
        trim: true,
        maxlength: 180,
      },
      evidenceUrl: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },
      notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },
      checkedAt: {
        type: Date,
        default: null,
      },
    },
    idType: {
      type: String,
      enum: ["passport", "national_id", "drivers_license", "voters_card", "other"],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    documents: {
      frontUrl: {
        type: String,
        required: true,
      },
      backUrl: {
        type: String,
        default: "",
      },
      selfieUrl: {
        type: String,
        required: true,
      },
      selfieCaptureMethod: {
        type: String,
        enum: ["live_camera"],
        default: "live_camera",
      },
      selfieCapturedAt: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    submissionCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedByEmail: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    history: {
      type: [kycHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const KycSubmission = mongoose.model("KycSubmission", kycSubmissionSchema);

export default KycSubmission;
