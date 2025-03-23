const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");

// Route to get all loans
router.get("/", loanController.getAllLoans);

// Route to create a new loan
router.post("/loans", loanController.createLoan);

module.exports = router;
