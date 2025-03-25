const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).render('authorizationSuccess', {
    user,
    token,
    api_version: process.env.API_VERSION
  });
};

exports.signup = async (req, res, next) => {
  try {
    // Ensure the field names here match your User model's expected names.
    const { name, email, password, passwordConfirmation } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirmation
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error(err);
    return res.status(400).render('appError', {
      errorCode: 400,
      errorMessage: err.message,
      api_version: process.env.API_VERSION
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(401).render('appError', {
        errorCode: 401,
        errorMessage: 'Please provide email and password!',
        api_version: process.env.API_VERSION
      });
    }
    // 2) Check if user exists and if the password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isPasswordMatch(password, user.password))) {
      return res.status(401).render('appError', {
        errorCode: 401,
        errorMessage: 'Incorrect email and password!',
        api_version: process.env.API_VERSION
      });
    }
    // 3) If everything is ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    return res.status(500).render('appError', {
      errorCode: 500,
      errorMessage: 'Internal Server Error',
      api_version: process.env.API_VERSION
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).render('appError', {
        errorCode: 401,
        errorMessage: 'You are not logged in! Please log in to get access',
        api_version: process.env.API_VERSION
      });
    }
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).render('appError', {
        errorCode: 401,
        errorMessage: 'The user belonging to this token does no longer exist',
        api_version: process.env.API_VERSION
      });
    }
    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).render('appError', {
      errorCode: 500,
      errorMessage: 'Internal Server Error',
      api_version: process.env.API_VERSION
    });
  }
};

exports.loginEnhanced = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render('appError', {
        errorCode: 400,
        errorMessage: 'Incorrect email or password',
        api_version: process.env.API_VERSION
      });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isPasswordMatch(password, user.password))) {
      return res.status(401).render('appError', {
        errorCode: 401,
        errorMessage: 'Incorrect email or password',
        api_version: process.env.API_VERSION
      });
    }
    createSendToken(user, 200, res);
    // Note: The render below is likely unnecessary since createSendToken sends a response.
    // res.render(`${process.env.API_VERSION}/`, { user: undefined });
  } catch (err) {
    console.error(err);
    return res.status(500).render('appError', {
      errorCode: 500,
      errorMessage: 'Internal Server Error',
      api_version: process.env.API_VERSION
    });
  }
};
