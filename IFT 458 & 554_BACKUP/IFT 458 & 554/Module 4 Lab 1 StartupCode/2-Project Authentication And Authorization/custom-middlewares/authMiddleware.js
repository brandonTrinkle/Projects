const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
  console.log('🔐 [AUTH] Authenticating request...');

  try {
    const token = req.cookies.jwt;

    if (!token) {
      console.warn('⚠️ [AUTH] No token found in cookies.');
      return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
    }

    console.log('✅ [AUTH] Token received:', token);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ [AUTH] Decoded token:', decodedToken);
    } catch (err) {
      console.error('❌ [AUTH] Token verification failed:', err.message);
      return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
    }

    const userId = decodedToken.id || decodedToken._id;
    const authenticatedUser = await User.findById(userId);

    if (!authenticatedUser) {
      console.warn('⛔ [AUTH] No user found for ID:', userId);
      return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
    }

    console.log('✅ [AUTH] Authenticated user:', authenticatedUser.email);
    req.user = authenticatedUser;
    next();

  } catch (err) {
    console.error('🔥 [AUTH] Unexpected authentication error:', err.message);
    return res.redirect(`${process.env.API_VERSION}/views/loginUser`);
  }
};

const authorize = async (req, res, next) => {
  console.log('🔐 [AUTHZ] Authorizing user...');

  const currentUser = req.user;

  if (!currentUser) {
    console.error('⛔ [AUTHZ] No user attached to request.');
    return res.status(403).json({ message: 'Forbidden: No user found.' });
  }

  const userRole = currentUser.role;
  console.log('ℹ️ [AUTHZ] User role:', userRole);

  if (userRole) {
    console.log('✅ [AUTHZ] Access granted.');
    next();
  } else {
    console.warn('⛔ [AUTHZ] Access denied.');
    res.status(403).json({ message: 'Forbidden: Missing user role.' });
  }
};

// Optional utility for debugging
async function fetchUserById(userId) {
  try {
    const user = await User.findById(userId);
    if (user) {
      console.log('🔍 [DEBUG] Found user:', user);
    } else {
      console.warn('🔍 [DEBUG] No user found for ID:', userId);
    }
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching user:', error.message);
  }
}

module.exports = { authenticate, authorize };
