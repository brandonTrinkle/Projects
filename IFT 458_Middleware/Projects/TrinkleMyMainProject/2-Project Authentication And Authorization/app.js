const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./custom-middlewares/authMiddleware');

const app = express();

// ===================================================
//                1. GLOBAL MIDDLEWARES
// ===================================================

// Logging Middleware (Morgan)
app.use(morgan('dev'));

// Custom Middleware Logger
const middlewareLogger = (name) => (req, res, next) => {
  const userInfo = req.user ? ` - User: ${req.user.email}` : '';
  console.log(`[Custom Middleware] ${name}${userInfo} - Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
  next();
};

// Body Parsing Middlewares
app.use(middlewareLogger('BodyParser URL Encoded'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(middlewareLogger('BodyParser JSON'));
app.use(bodyParser.json());

// Cookie Parsing Middleware
app.use(middlewareLogger('CookieParser'));
app.use(cookieParser());

// Serving Static Files
app.use(middlewareLogger('Static Files Middleware'));
app.use(express.static(path.join(__dirname, 'public')));

// ===================================================
//              2. VIEW ENGINE SETUP
// ===================================================

console.log(`[Setup] View Engine: EJS, Views Directory: ${path.join(__dirname, 'views')}`);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===================================================
//               3. ROUTES DEFINITION
// ===================================================

// Home Page Route
app.get('/', middlewareLogger('Home Route'), (req, res) => {
    res.render('home', {
        title: 'Dashboard',
        user: undefined,
        books: [],
        api_version: process.env.API_VERSION
    });
});

// Dynamic Route Validation Middleware
const isValidUserId = (userId) => /^[0-9a-fA-F]{24}$/.test(userId);

app.param('userId', (req, res, next, userId) => {
    console.log(`[Route Validation Middleware] UserId Param Validator triggered for userId: ${userId}`);
    if (!isValidUserId(userId)) {
        console.log('[Route Validation Middleware] Invalid User ID format detected.');
        return res.status(400).send('Invalid User ID');
    }
    console.log('[Route Validation Middleware] User ID format validated.');
    next();
});

// Complex Middleware Chain (Authentication & Authorization)
app.get('/secure-data/:userId',
    middlewareLogger('Auth Middleware (Authenticate)'), authMiddleware.authenticate,
    middlewareLogger('Auth Middleware (Authorize)'), authMiddleware.authorize,
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
//                 4. API & VIEW ROUTES
// ===================================================

// View Routes
const viewRouter = require('./routes/viewRoutes');
const viewUrl = `${process.env.API_VERSION}/views`;
app.use(viewUrl, middlewareLogger('View Router'), viewRouter);

// User API Routes
const userRouter = require('./routes/userRoutes');
const userUrl = `${process.env.API_VERSION}/users`;
app.use(userUrl, middlewareLogger('User Router'), userRouter);

// Book API Routes
const booksRoutes = require('./routes/bookRoutes');
const bookUrl = `${process.env.API_VERSION}/books`;
app.use(bookUrl, middlewareLogger('Book Router'), booksRoutes);

// ===================================================
//              5. ERROR HANDLING MIDDLEWARE
// ===================================================

// 404 Not Found Handler
app.use(middlewareLogger('404 Error Handler'), (req, res) => {
    console.log('[ErrorHandling Middleware] 404 - Route not found:', req.originalUrl);
    res.status(404).render('404', { url: req.originalUrl });
});

// Global Error Handler (500 Internal Server Error)
app.use(middlewareLogger('500 Error Handler'), (err, req, res, next) => {
    console.error('[ErrorHandling Middleware] 500 - Internal Server Error:', err.stack);
    res.status(500).render('500', { error: err });
});

module.exports = app;