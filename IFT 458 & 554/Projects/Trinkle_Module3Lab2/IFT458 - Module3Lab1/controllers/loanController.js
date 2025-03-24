// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/22/2025

const Loan = require("../model/loanModel.js");

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find(); // Retrieve all loans from the database
    res.status(200).json({
      status: "success",
      results: loans.length, // Number of loans found
      data: {
        loans, // The loans array
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message, // Return the error message if there's a failure
    });
  }
};

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    // Create a new loan using the data from the request body
    const newLoan = await Loan.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        loan: newLoan, // Return the created loan object
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message, // Return the error message if there's a failure
    });
  }
};
