// application core dependency modules
// Note: The order of the require statements is important
// You will need to restore the packages by running npm install
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// start express app
const app = express();

// 1) GLOBAL MIDDLEWARES & CHAINED MIDDLEWARE (Step 1)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// First chained middleware: logs a message then passes control
app.use((req, res, next) => {
  console.log('Chained Middleware 1: First middleware');
  next();
});

// Second chained middleware: logs a second message then passes control
app.use((req, res, next) => {
  console.log('Chained Middleware 2: Second middleware');
  next();
});

// 2) CUSTOM MIDDLEWARE (Step 2)

function logMethodAndUrl(req, res, next) {
  console.log(`Custom Middleware: Request Method: ${req.method}, URL: ${req.url}`);
  next();
}
app.use(logMethodAndUrl);

// EXPRESS APP SETTINGS & GLOBAL MIDDLEWARES

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
console.log('Views directory:', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
console.log('Public directory:', path.join(__dirname, 'public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// HOME ROUTE
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Dashboard',
    user: undefined,
    books: [],
    api_version: process.env.API_VERSION
  });
});

// DEFINE ROUTES FOR UI & API

const viewRouter = require('./routes/viewRoutes');
const viewUrl = `${process.env.API_VERSION || '/api/v1'}/views`;
console.log('viewUrl:', viewUrl);
app.use(viewUrl, viewRouter);

const userRouter = require('./routes/userRoutes');
app.use('/api/v1/users', userRouter);

const bookRoutes = require('./routes/bookRoutes');
app.use('/api/v1/books', bookRoutes);

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: undefined,
    api_version: process.env.API_VERSION
  });
});

// 4) ERROR HANDLING (Assignment Step 3)

app.get('/error', (req, res) => {
  throw new Error('This is a test error!');
});

app.use((err, req, res, next) => {
  console.error('Error encountered:', err.stack);
  res.status(500).send('Something broke!');
});

// EXPORT APP 
module.exports = app;