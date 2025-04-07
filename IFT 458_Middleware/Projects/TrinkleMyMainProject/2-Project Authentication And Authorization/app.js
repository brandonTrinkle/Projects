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

app.use(morgan('dev')); // basic HTTP request logging

// Parsers
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
//           3. CUSTOM MIDDLEWARE LOGGER FUNCTION
// ===================================================

const middlewareLogger = (name) => (req, res, next) => {
  const userInfo = req.user ? ` - User: ${req.user.email}` : ' - User: Guest';
  console.log(`[Custom Middleware] ${name}${userInfo} - Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
  next();
};

// ===================================================
//               4. ROUTES DEFINITION
// ===================================================

// Home route (no authentication required)
app.get('/', middlewareLogger('Home Route'), (req, res) => {
  res.render('home', {
    title: 'Dashboard',
    user: req.user,
    books: [],
    api_version: process.env.API_VERSION
  });
});

// View routes
const viewRouter = require('./routes/viewRoutes');
app.use(`${process.env.API_VERSION}/views`, middlewareLogger('View Router'), viewRouter);

// User routes 
const userRouter = require('./routes/userRoutes');
app.use(`${process.env.API_VERSION}/users`, middlewareLogger('User Router'), userRouter);

// Test route to intentionally throw a 500 error
app.get('/trigger-500', (req, res, next) => {
  console.log('[Test] Triggering intentional 500 error.');
  next(new Error('Intentional 500 error for testing'));
});


// ===================================================
//          5. PROTECTED ROUTES WITH AUTHENTICATION
// ===================================================

// Middleware runs explicitly after authentication to log user clearly
app.use(authMiddleware.authenticate);

// Book routes (authenticated routes)
const booksRoutes = require('./routes/bookRoutes');
app.use(`${process.env.API_VERSION}/books`, middlewareLogger('Book Router'), booksRoutes);

// Secure data route (complex middleware chain example)
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
//              6. ERROR HANDLING MIDDLEWARE
// ===================================================

// Brandon Trinkle
// ASU ID: 1217455031
// IFT 458
// 404 Handler
app.use((req, res) => {
  const viewPath = path.join(__dirname, 'views', '404.ejs');

  if (fs.existsSync(viewPath)) {
      res.status(404).render('404', { url: req.originalUrl });
  } else {
      console.error('[ErrorHandling] Missing 404.ejs view file.');
      res.status(404).send('404 - Page not found.');
  }

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