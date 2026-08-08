import mongoose from "mongoose";

const ethWithdrawalRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ethRecipientAddress: {
      type: String,
      required: true,
    },
    nairaRequestedAmount: {
      type: Number,
      required: true,
    },
    ethCalculatedAmount: {
      type: Number,
      required: true,
    },
    ethNetAmountToSend: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processed", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 128,
    },
  },
  {
    timestamps: true,
  },
);

ethWithdrawalRequestSchema.index({ userId: 1 });
ethWithdrawalRequestSchema.index({ status: 1 });
ethWithdrawalRequestSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  },
);

const EthWithdrawalRequest = mongoose.model(
  "EthWithdrawalRequest",
  ethWithdrawalRequestSchema,
);
export default EthWithdrawalRequest;
