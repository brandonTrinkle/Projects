exports.home = async (req, res) => {
  res.status(200).render('home', {
    title: 'Over View',
    user: req.user,
    books: undefined,
    api_version: process.env.API_VERSION
  });
};

exports.registerNewUser = (req, res) => {
  res.status(200).render('registerForm', {
    title: 'Sign in New User',
    user: req.user,
    api_version: process.env.API_VERSION
  });
};

exports.loginUser = (req, res) => {
  res.status(200).render('loginForm', {
    title: 'Please log into your account',
    user: req.user,
    api_version: process.env.API_VERSION
  });
};

exports.logOutUser = (req, res) => {
  res.status(200).render('logoutForm', {
    title: 'Log Out',
    user: req.user,
    api_version: process.env.API_VERSION
  });
};

exports.bookExchangeView = (req, res)=>{
  res.status(200).render('bookExchange', {
    title: 'Books Exchange',
    user: req.user,
    books: undefined,
    api_version: process.env.API_VERSION
  });
};