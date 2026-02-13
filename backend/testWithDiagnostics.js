import { MongoClient, ServerApiVersion } from "mongodb";
import os from "os";
import dns from "dns";

// FIX: Set proper DNS servers (not just localhost)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

const uri =
  "mongodb+srv://bmxii:secxion0219@bm12.qdh9mrh.mongodb.net/BM12-Section?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});

async function test() {
  try {
    console.log("🔗 Attempting connection...");
    console.log("   Current time:", new Date().toISOString());
    console.log("   DNS servers:", dns.getServers());

    // Try to connect with timeout
    const promise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connect timeout after 8s")), 8000),
    );

    await Promise.race([promise, timeoutPromise]);

    console.log("✅ Connected!");

    const db = client.db("BM12-Section");
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.code) console.error("   Code:", err.code);
    console.error("\n📋 Troubleshooting:");
    console.error("   1. Is your internet connection stable?");
    console.error("   2. Restart your router/WiFi");
    console.error("   3. Does Compass still work? If yes, DNS is intermittent");
    console.error("   4. Try using a VPN");
  } finally {
    await client.close();
  }
}

test();
