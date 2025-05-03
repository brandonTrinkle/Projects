// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/22/2025

const mongoose = require("mongoose");

const loanDbContext = async () => {
  try {
    const DB = process.env.DATABASE.replace(
      "HelloMongo",
      process.env.DB_PASSWORD
    );
    await mongoose.connect(DB, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Database connected in loanDbContext");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

module.exports = loanDbContext;
