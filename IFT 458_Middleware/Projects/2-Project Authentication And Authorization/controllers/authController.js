const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');


// exports.signup = async (req, res, next) => {
//   const { name, email, password, passwordConfirm } = req.body;
//   const newUser = await User.create({
//     name: name,
//     email: email,
//     password: password,
//     passwordConfirm: passwordConfirm
//   });
//   createSendToken(newUser, 201, res);
// };

//OR
// since the values are same as the properties names
// this style is called object destructuring ans it is prefered
exports.signup = async (req, res, next) => {
  const { name, email, password, passwordConfirmation } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirmation
  });
  //and then send the token
  createSendToken(newUser, 201, res);// this is called Authorization
};

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
  user.password = undefined; // very important

  // res.status(statusCode).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user
  //   }
  // });
  res.render( 'authorizationSuccess', { user: user, token: token , api_version: process.env.API_VERSION});
};
// sign token
const signToken = id => {
  // document reference https://www.npmjs.com/package/jsonwebtoken
  const jwtToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    //noTimestamp:true,
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  console.log;
  return jwtToken;
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {

    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'Please provide email and password!',
      api_version: process.env.API_VERSION
    });
   
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'Incorrect email and password!',
      api_version: process.env.API_VERSION
    });
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
};


exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'You are not logged in! Please log in to get access',
      api_version: process.env.API_VERSION
    });
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {

    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'The user belonging to this token does no longer exist',
      api_version: process.env.API_VERSION
    });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

exports.loginInhanced = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    res.status(400).render('appError', {
      errorCode: 400,
      errorMessage: 'Incorrect email or password',
      api_version: process.env.API_VERSION
    });
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'Incorrect email or password',
      api_version: process.env.API_VERSION
    });
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);

  res.render(`${process.env.API_VERSION}/`, {
    user:undefined
  })
};



