import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function fetchCollections() {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connected successfully!\n");

    // Get database
    const db = client.db("BM12-Section");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:\n`);

    for (const collection of collections) {
      const collName = collection.name;
      const col = db.collection(collName);
      const count = await col.countDocuments();

      console.log(`📋 ${collName} (${count} documents)`);

      if (count > 0) {
        const sampleDoc = await col.findOne();
        console.log("   Sample:", JSON.stringify(sampleDoc, null, 2));
      }
      console.log("");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("   Code:", err.code);
  } finally {
    await client.close();
  }
}

fetchCollections().catch(console.dir);
