const express = require('express');
const router = express.Router();
const studentController = require('../controllers/students');

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.addStudent);
router.delete('/:name', studentController.deleteStudentByName);

module.exports = router;
