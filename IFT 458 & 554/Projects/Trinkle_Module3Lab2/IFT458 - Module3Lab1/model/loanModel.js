// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/22/2025

const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is required"],
  },
  amount: {
    type: Number,
    required: [true, "Loan amount is required"],
  },
  borrower: {
    type: String,
    required: [true, "Borrower name is required"],
  },
  interestRate: {
    type: Number,
    required: [true, "Interest rate is required"],
  },
  status: {
    type: String,
    default: "pending",
  },
});

const Loan = mongoose.model("Loan", loanSchema);
module.exports = Loan;
