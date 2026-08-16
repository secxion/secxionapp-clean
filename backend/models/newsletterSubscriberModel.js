import mongoose from "mongoose";

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "unsubscribed"],
      default: "pending",
      index: true,
    },
    source: {
      type: String,
      default: "website",
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    lastCampaignAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema,
);

export default NewsletterSubscriber;
