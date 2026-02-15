import mongoose from "mongoose";

const liveScriptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ["script", "tool", "bot", "automation", "other"],
      default: "other",
    },
    budget: {
      type: String,
      enum: ["under_50", "50_100", "100_250", "250_500", "500_plus", "negotiable"],
      default: "negotiable",
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "accepted", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LiveScript = mongoose.model("LiveScript", liveScriptSchema);

export default LiveScript;
