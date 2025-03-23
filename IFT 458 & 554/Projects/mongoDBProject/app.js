require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB URI is not set. Please configure the MONGODB_URI environment variable.");
  process.exit(1);
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Attempting to connect to MongoDB...");
    
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    console.log("Sending ping command to MongoDB...");
    const response = await client.db("admin").command({ ping: 1 });
    
    console.log("Ping successful. MongoDB response:", response);
    console.log("MongoDB connection verified.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    console.log("Closing MongoDB client...");
    await client.close();
    console.log("MongoDB client connection closed.");
  }
}

console.log("Connecting to MongoDB");
run().catch(error => console.error("Unexpected error in run():", error));