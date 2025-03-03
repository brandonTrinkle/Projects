// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 2/7/2025

const express = require('express');
const bodyParser = require('body-parser');
const { makeUpperCase } = require('./middlewares/middlewares.js'); 
const studentsRouter = require('./controllers/students.js');

const app = express();

app.use(bodyParser.json());
app.use(makeUpperCase);

app.use('/students', studentsRouter);

app.use('/', function(req, res, next) {
    console.log('Request URL:', req.url);
    res.send('Hello');
});

const mongoose = require('mongoose');
const uri = "mongodb+srv://btrinkle52:lVFgPGisucpwqBkn@trinklecluster.obqkf.mongodb.net/?retryWrites=true&w=majority&appName=TrinkleCluster";
mongoose.connect(uri, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connected to MongoDB");
    }).catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});