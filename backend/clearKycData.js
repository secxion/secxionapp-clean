import mongoose from "mongoose";
import dotenv from "dotenv";
import KycSubmission from "./models/kycSubmissionModel.js";
import userModel from "./models/userModel.js";

dotenv.config();

async function clearKycData() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/BM12-Section";

    await mongoose.connect(mongoUri);

    const deletedKyc = await KycSubmission.deleteMany({});
    const resetUsers = await userModel.updateMany(
      {},
      {
        $set: {
          kycStatus: "unverified",
          kycVerifiedAt: null,
          isPhoneVerified: false,
          phoneVerifiedAt: null,
        },
      },
    );

    const remainingKyc = await KycSubmission.countDocuments({});
    const remainingVerifiedUsers = await userModel.countDocuments({
      kycStatus: { $ne: "unverified" },
    });

    console.log(
      `✅ Deleted ${deletedKyc.deletedCount} KYC submission record(s).`,
    );
    console.log(
      `✅ Reset KYC fields for ${resetUsers.modifiedCount} user account(s).`,
    );
    console.log(`📊 Remaining KYC submissions: ${remainingKyc}`);
    console.log(
      `📊 Users still not in unverified state: ${remainingVerifiedUsers}`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing KYC data:", error.message);
    process.exit(1);
  }
}

clearKycData();