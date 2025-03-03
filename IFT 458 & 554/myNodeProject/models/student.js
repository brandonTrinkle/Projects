// models/student.js
const mongoose = require("mongoose");

// Define the student schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  major: { type: String, required: true },
  email: { type: String, required: true },
});
// Create the model
const Student = mongoose.model("student", studentSchema);

module.exports = Student;
