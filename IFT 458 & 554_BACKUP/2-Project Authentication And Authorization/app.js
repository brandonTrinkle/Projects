// application core dependency modules
// Note: The order of the require statements is important
// You will need to restore the packages by running npm install
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');



// start express app
const app = express()

// 1) GLOBAL MIDDLEWARES to log the request to the console
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

// Set the view engine to ejs and set the views directory
app.set('view engine', 'ejs');
console.log('dirname', __dirname);
app.set('views', path.join(__dirname, 'views'));
console.log('views', path.join(__dirname, 'views'));

// 2) GLOBAL MIDDLEWARES // Serving static files
app.use(express.static(path.join(__dirname, 'public')));
console.log('public', path.join(__dirname, 'public'));

// 3) GLOBAL MIDDLEWARES // Body parser, reading data from body into req.body
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse cookies
app.use(cookieParser());

// Create a home route
app.get('/', (req, res) => {
    res.render('home',
    { 
      title: 'Dashboard',
      user: undefined,
      books: [],
      api_version: process.env.API_VERSION
    });
});
// 4)  Start defining routes for UI and API
const viewRouter = require('./routes/viewRoutes')
const viewUrl = `${process.env.API_VERSION}/views`
console.log('viewUrl', viewUrl);
app.use(viewUrl, viewRouter);

// 5) ROUTES API for Users
const userRouter = require('./routes/userRoutes');
app.use(`${process.env.API_VERSION}/users`, userRouter);

// // 6) ROUTES API for Books
const booksRoutes = require('./routes/bookRoutes.js');
app.use(`${process.env.API_VERSION}/books`, booksRoutes);

module.exports = app;
