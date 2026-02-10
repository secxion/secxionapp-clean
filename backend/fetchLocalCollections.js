import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fetchLocalCollections() {
  try {
    console.log('🔗 Connecting to Local MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/BM12-Section');
    
    const db = mongoose.connection.db;
    console.log('✅ Connected to Local MongoDB\n');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Collections in LOCAL MongoDB (${collections.length} total):\n`);
    
    for (const collection of collections) {
      const collName = collection.name;
      const col = db.collection(collName);
      const count = await col.countDocuments();
      
      console.log(`📋 ${collName} - ${count} documents`);
      
      if (count > 0) {
        const sample = await col.findOne();
        console.log('   First doc:', JSON.stringify(sample, null, 2).slice(0, 200) + '...');
      }
    }
    
    await mongoose.disconnect();
    
  } catch(err) {
    console.error('❌ Error:', err.message);
  }
}

fetchLocalCollections();
