import { MongoClient } from "mongodb";

// Instead of mongodb+srv (which requires SRV DNS lookup),
// try direct connection to cluster nodes
const uri =
  "mongodb://bmxii:secxion0219@bm12-shard-00-00.qdh9mrh.mongodb.net:27017,bm12-shard-00-01.qdh9mrh.mongodb.net:27017,bm12-shard-00-02.qdh9mrh.mongodb.net:27017/BM12-Section?replicaSet=bm12-shard-0&retryWrites=true&w=majority&ssl=true";

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true, // Allow self-signed if needed
});

async function test() {
  try {
    console.log("🔗 Attempting direct node connection (no SRV lookup)...");
    const startTime = Date.now();

    await client.connect();
    const elapsed = Date.now() - startTime;

    console.log(`✅ Connected in ${elapsed}ms`);

    // Test ping
    const adminDb = client.db("admin");
    const result = await adminDb.command({ ping: 1 });
    console.log("✅ Ping successful");

    // List collections
    const db = client.db("BM12-Section");
    const collections = await db.listCollections().toArray();
    console.log(`\n✅ Collections found: ${collections.length}`);
    collections.forEach((c) => console.log(`   - ${c.name}`));
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("   Code:", err.code);
  } finally {
    await client.close();
  }
}

test();
