// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/22/2025

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const loanRoutes = require("./routes/loanRoutes.js");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<DB_PASSWORD>",
  process.env.DB_PASSWORD
);

const app = express();
app.use(express.json());
app.use("/api", loanRoutes); //added routes

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection successful"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port http://localhost:${port}...`);
});