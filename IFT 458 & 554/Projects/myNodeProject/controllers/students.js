const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student
router.post('/', async (req, res) => {
  console.log("Received request to add student:", req.body);
  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    major: req.body.major,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student by name
router.delete('/:name', async (req, res) => {
  const studentName = req.params.name;
  console.log(`Received request to delete student with name: ${studentName}`);

  try {
    const result = await Student.findOneAndDelete({ name: studentName });
    if (!result) {
      console.warn(`Student with name: ${studentName} not found`);
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: `Student with name ${studentName} has been deleted` });
  } catch (err) {
    console.error("Error deleting student:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
