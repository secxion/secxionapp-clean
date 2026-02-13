import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://bmxii:secxion0219@bm12.qdh9mrh.mongodb.net/?appName=BM12";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    console.log("🔗 Attempting to connect to MongoDB Atlas...");
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅ Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
    console.error("   Code:", err.code);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
