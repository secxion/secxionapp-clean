import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "report_reply",
        "transaction:debit",
        "transaction:credit",
        "new_blog",
        "transaction:withdrawal",
        "transaction:payment_completed",
        "transaction:rejected",
        "market_upload:DONE",
        "market_upload:CANCEL",
        "market_upload:PROCESSING",
        "transaction:eth_processed",
      ],
    },
    category: {
      type: String,
      enum: [
        "transaction",
        "report",
        "market_upload",
        "general",
        "eth_processed",
      ],
      default: "general",
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    relatedObjectId: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      enum: [
        "PaymentRequest",
        "Wallet",
        "Report",
        "BlogNote",
        "userproduct",
        "EthWithdrawalRequest",
      ],
      default: "PaymentRequest",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = model("Notification", notificationSchema);

export default Notification;
