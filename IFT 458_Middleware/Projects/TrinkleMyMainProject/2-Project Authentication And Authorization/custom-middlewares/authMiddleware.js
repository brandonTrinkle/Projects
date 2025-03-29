const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            console.log('[AuthMiddleware] No JWT token found, redirecting to login.');
            return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id || decodedToken._id;
        const authenticatedUser = await User.findById(userId);

        if (!authenticatedUser) {
            console.log(`[AuthMiddleware] No user found for token ID: ${userId}, redirecting to login.`);
            return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
        }

        req.user = authenticatedUser;

        console.log(`[AuthMiddleware] User authenticated: ${authenticatedUser.email}`);
        next();
    } catch (error) {
        console.log('[AuthMiddleware] Authentication error:', error.message);
        res.redirect(`${process.env.API_VERSION}/views/loginUser`);
    }
};

const authorize = async (req, res, next) => {
    if (!req.user) {
        console.log('[AuthMiddleware] Authorization failed - no authenticated user.');
        return res.status(403).json({ message: 'Forbidden' });
    }

    console.log(`[AuthMiddleware] Authorizing user: ${req.user.email}, role: ${req.user.role}`);
    next();
};

module.exports = { authenticate, authorize };