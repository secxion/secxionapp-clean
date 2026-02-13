import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://bmxii:secxion0219@bm12.qdh9mrh.mongodb.net/BM12-Section?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  // Add these options that Compass might be using
  tls: true,
  tlsAllowInvalidCertificates: false,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // Try to bypass DNS issues
  authSource: "admin",
});

async function test() {
  try {
    console.log("🔗 Attempting Atlas connection...");
    const startTime = Date.now();

    const conn = await client.connect();
    const elapsed = Date.now() - startTime;

    console.log(`✅ Connected in ${elapsed}ms`);

    const adminDb = client.db("admin");
    const result = await adminDb.command({ ping: 1 });
    console.log("✅ Ping successful:", result);

    // Get database info
    const db = client.db("BM12-Section");
    const collections = await db.listCollections().toArray();
    console.log(`\n✅ Collections found: ${collections.length}`);
    collections.forEach((c) => console.log(`   - ${c.name}`));
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("   Code:", err.code);
    console.error("   Full error:", err);
  } finally {
    await client.close();
  }
}

test();
