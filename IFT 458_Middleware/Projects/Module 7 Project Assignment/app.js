const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./custom-middlewares/authMiddleware');

const app = express();

// ===================================================
//                1. GLOBAL MIDDLEWARES
// ===================================================
app.use(morgan('dev')); // HTTP request logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ===================================================
//              2. VIEW ENGINE SETUP
// ===================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===================================================
//          3. CUSTOM MIDDLEWARE LOGGER FUNCTION
// ===================================================
const middlewareLogger = (name) => (req, res, next) => {
  const userInfo = req.user ? ` - User: ${req.user.email}` : ' - User: Guest';
  console.log(`[Custom Middleware] ${name}${userInfo} - Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
  next();
};

// ===================================================
//          4. PUBLIC ROUTES
// ===================================================

// Brandon Trinkle
// ASU ID: 1217455031
// IFT 458
// Home Route (200 OK)
app.get('/', middlewareLogger('Home Route'), (req, res) => {
  res.render('home', {
    title: 'Dashboard',
    user: req.user,
    books: [],
    api_version: process.env.API_VERSION
  });
});

// HTTP Status Code
app.get('/200', (req, res) => {
  res.status(200).send('OK: The request has succeeded (200)');
});

app.get('/201', (req, res) => {
  res.status(201).send('Resource created successfully (201)');
});

app.get('/400', (req, res) => {
  res.status(400).send('Bad request (400)');
});

// Async Route (returns 200 on success)
app.get('/async', async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve('Done'), 1000);
    });
    res.status(200).send('Async Operation Completed');
  } catch (err) {
    next(err); // Triggers the 500 error handler
  }
});

// User Routes
const userRouter = require('./routes/userRoutes');
app.use('/users', middlewareLogger('User Router'), userRouter);

// ===================================================
//         5. PROTECTED ROUTES
// ===================================================

app.use(authMiddleware.authenticate);

// Book routes
const booksRoutes = require('./routes/bookRoutes');
app.use('/books', middlewareLogger('Book Router'), booksRoutes);

// Secure data route
app.get('/secure-data/:userId',
  middlewareLogger('Authorization Middleware'), authMiddleware.authorize,
  middlewareLogger('Data Processing Middleware'), (req, res, next) => {
    req.processedAt = new Date();
    next();
  },
  middlewareLogger('Response Middleware'), (req, res) => {
    res.json({
      userId: req.params.userId,
      timestamp: req.processedAt,
      message: 'Secure data accessed successfully.'
    });
  }
);

// ===================================================
//          6. ERROR HANDLING MIDDLEWARE
// ===================================================

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).send('404 - Page not found.');
  console.log(`[ErrorHandling] 404 - Route not found: ${req.originalUrl}`);
});

// Global Error Handler (500 Internal Server Error)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const viewPath = path.join(__dirname, 'views', '500.ejs');

  if (isDev) {
    console.error('[ErrorHandling] 500 - Internal Server Error:', err.stack);
  } else {
    console.error('[ErrorHandling] 500 - Internal Server Error:', err.message);
  }

  if (fs.existsSync(viewPath)) {
    res.status(500).render('500', { error: isDev ? err : { message: 'An internal error occurred.' } });
  } else {
    console.error('[ErrorHandling] Missing 500.ejs view file.');
    res.status(500).send('500 - Internal Server Error.');
  }
});

module.exports = app;