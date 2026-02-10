import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function deleteUserByEmail(email) {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/BM12-Section';
    await mongoose.connect(mongoUri);
    
    const result = await userModel.deleteOne({ email });
    console.log(`✅ Deleted ${result.deletedCount} user(s) with email: ${email}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    process.exit(1);
  }
}

const emailToDelete = process.argv[2] || 'boardmanxii@gmail.com';
deleteUserByEmail(emailToDelete);
