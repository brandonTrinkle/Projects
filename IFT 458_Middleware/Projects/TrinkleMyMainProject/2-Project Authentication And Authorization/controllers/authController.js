const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  user.password = undefined;

  res.render('authorizationSuccess', { user, token, api_version: process.env.API_VERSION });
};

exports.signup = async (req, res, next) => {
  const { name, email } = req.body;
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).render('appError', { errorCode: 401, errorMessage: 'Provide email/password.', api_version: process.env.API_VERSION });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    return res.status(401).render('appError', { errorCode: 401, errorMessage: 'Incorrect credentials.', api_version: process.env.API_VERSION });
  }

  createSendToken(user, 200, res);
};
