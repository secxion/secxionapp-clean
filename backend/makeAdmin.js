import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import userModel from "./models/userModel.js";

// Set DNS servers to reach MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

dotenv.config();

async function makeUserAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const email = "boardmanxii@gmail.com";

    console.log(`👤 Looking for user with email: ${email}`);
    const user = await userModel.findOne({ email });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    // Update role to ADMIN
    user.role = "ADMIN";
    await user.save();

    console.log(`\n✅ User elevated to ADMIN!`);
    console.log(`   New role: ${user.role}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

makeUserAdmin();
