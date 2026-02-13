import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit", "withdrawal"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: String,
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: [
      "userproduct",
      "WithdrawalRequest",
      "EthWithdrawalRequest",
      "PaymentRequest",
      "OtherType",
      "User",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved-processing", "rejected", "completed"],
    default: "completed",
  },
});

const bankAccountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
  },
  { _id: true },
);

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    bankAccounts: [bankAccountSchema],
    transactions: [transactionSchema],
  },
  {
    timestamp: { type: Date, default: Date.now },
    appliedToBalance: { type: Boolean, default: false },
  },
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
