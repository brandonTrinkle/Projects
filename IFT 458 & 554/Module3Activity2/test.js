// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/16/2025

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

//  I had to change the callback to use async due to atlas and mongoDB serverAPI
//  Async uses better error handling than trying to use client.connect
async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    //  Create new database
    const db = client.db("Module3");
    // Create new cluster
    const collection = client.collection("Activity 2")

    //  Create new entry
    const createResult = await collection.insertOne({ name: "Brandon Trinkle", age: 35 });
    console.log("New entry information:", createResult.insertedId);

    // Read the new entry
    const foundDoc = await collection.findOne({ name: "Brandon Trinkle" });
    console.log("Found Entry:", foundDoc);

    // Modify the entry
    const updateResult = await collection.updateOne(
        { name: "Brandon Trinkle" },
        { $set: { age: 38 } }
      );
      console.log("Entry updated:", updateResult.modifiedCount);

    // Delete entry
    const deleteResult = await collection.deleteOne({ name: "Brandon Trinkle" });
    console.log("Entry Deleted:", deleteResult.deletedCount);

    console.log("CRUD operations completed.");

  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

run();