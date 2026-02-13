import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "./models/userModel.js";

dotenv.config();

async function deleteAllUsers() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/BM12-Section";
    await mongoose.connect(mongoUri);

    const result = await userModel.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} user(s) from database`);

    // Verify deletion
    const remainingUsers = await userModel.countDocuments({});
    console.log(`📊 Remaining users in database: ${remainingUsers}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting users:", error.message);
    process.exit(1);
  }
}

deleteAllUsers();
