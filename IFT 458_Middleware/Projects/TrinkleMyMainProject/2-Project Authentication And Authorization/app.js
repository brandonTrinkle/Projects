const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./custom-middlewares/authMiddleware');

const app = express();

// Middleware Logging using Morgan
app.use(morgan('dev'));

// Custom Middleware Logger (for debugging all middleware clearly)
const middlewareLogger = (middlewareName) => (req, res, next) => {
    console.log(`[Middleware] ${middlewareName} triggered for ${req.method} ${req.originalUrl}`);
    next();
};

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware with logging
app.use(middlewareLogger('BodyParser URL Encoded'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(middlewareLogger('BodyParser JSON'));
app.use(bodyParser.json());

app.use(middlewareLogger('CookieParser'));
app.use(cookieParser());

// Home route (basic view rendering)
app.get('/', middlewareLogger('Home Route'), (req, res) => {
    res.render('home', {
        title: 'Dashboard',
        user: undefined,
        books: [],
        api_version: process.env.API_VERSION
    });
});

// Dynamic Route with Validation Middleware
const isValidUserId = (userId) => /^[0-9a-fA-F]{24}$/.test(userId); // MongoDB ID format

app.use('/users/:userId', middlewareLogger('UserID Validation Middleware'), (req, res, next) => {
    if (!isValidUserId(req.params.userId)) {
        return res.status(400).send('Invalid User ID');
    }
    next();
});

// Complex Middleware Chain Route
app.get('/secure-data/:userId',
    middlewareLogger('Authentication Middleware'), authMiddleware.authenticate,
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

// View routes setup clearly logged
const viewRouter = require('./routes/viewRoutes');
const viewUrl = `${process.env.API_VERSION}/views`;
app.use(viewUrl, middlewareLogger('View Router'), viewRouter);

// User routes setup clearly logged
const userRouter = require('./routes/userRoutes');
const userUrl = `${process.env.API_VERSION}/users`;
app.use(userUrl, middlewareLogger('User Router'), userRouter);

// Book routes setup clearly logged
const booksRoutes = require('./routes/bookRoutes.js');
const bookUrl = `${process.env.API_VERSION}/books`;
app.use(bookUrl, middlewareLogger('Book Router'), booksRoutes);

// 404 Not Found Middleware
app.use(middlewareLogger('404 Handler'), (req, res, next) => {
    console.log('[APP] 404 handler triggered:', req.method, req.originalUrl);
    res.status(404).render('404', { url: req.originalUrl });
});

// 500 Internal Server Error Middleware
app.use(middlewareLogger('500 Handler'), (err, req, res, next) => {
    console.error('[APP] 500 error:', err.stack);
    res.status(500).render('500', { error: err });
});

module.exports = app;