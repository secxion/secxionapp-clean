import mongoose from "mongoose";

const ethWalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  ethAddress: { type: String, required: true },
  ethBalance: { type: Number, default: 0 }, // optional: fetched from chain
}, { timestamps: true });

export default mongoose.model("EthWallet", ethWalletSchema);
