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

    //  Select Collection
    const db = client.db("Module3");
    //  Select sub collection
    const collection = db.collection("Activity2");

    //  Create new entry
    const createResult = await collection.insertOne({ name: "Brandon Trinkle", age: 35 });
    console.log("New entry created");

    // Read the new entry
    const foundDoc = await collection.findOne({ name: "Brandon Trinkle" });
    console.log("New Entry:", foundDoc);

    // Modify the entry
    const updateResult = await collection.updateOne(
      { name: "Brandon Trinkle" },
      { $set: { age: 38 } }
    );
    console.log("New entry has been updated.  Read back updated entry.")

    // Read back the updated document
    const updatedDoc = await collection.findOne({ name: "Brandon Trinkle" });
    console.log("Updated Entry:", updatedDoc);

    // Delete entry
    const deleteResult = await collection.deleteOne({ name: "Brandon Trinkle" });
    console.log("Deleted Entry");

    //  Read back to ensure it was deleted
    const deletedDoc = await collection.findOne({ name: "Brandon Trinkle" });
    console.log("Entry deleted if respnse is null.  Response:", deletedDoc);

    //  Log CRUD has been completed without errors
    console.log("CRUD operations completed.");

    //  Close database on CTRL + C
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

run();