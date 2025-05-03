// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/22/2025

const express = require("express");
const mongoose = require("mongoose"); //enviornment variables for database
const dotenv = require("dotenv"); //enviorment variables for .env file

dotenv.config({ path: "./config.env" }); //imports config.env authentication

const app = express();

app.use(express.json());

// MongoDB connection setup using Mongoose
const DB = process.env.DATABASE.replace("HelloMongo", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection successful"));

// Routes
const loanRoutes = require("./routes/loanRoutes.js");

app.use(express.json()); // Add this line to parse JSON bodies
app.use("/api", loanRoutes); // Use your routes

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port http://localhost:${port}...`);
});
