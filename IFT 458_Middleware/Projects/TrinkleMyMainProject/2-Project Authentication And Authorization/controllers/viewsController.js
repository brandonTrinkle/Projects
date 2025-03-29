
exports.home = async (req, res) => {
  res.status(200).render('home', {
    title: `Over View`,
    user: undefined,
    books: undefined,
    api_version: process.env.API_VERSION
  });
};

exports.registerNewUser = (req, res) => {
  const {email, password} = req.body;
  res.status(200).render('registerForm', {
    title: 'Sign in New User',
    user: undefined,
    api_version: process.env.API_VERSION
  });
};

exports.loginUser = (req, res) => {

  res.status(200).render('loginForm', {
    title: 'Please log into your account',
    user: undefined,
    api_version: process.env.API_VERSION
  });
};

exports.logOutUser = (req, res) => {
  const {email, password} = req.body;
  res.status(200).render('logoutFomr', {
    title: 'Sign in New User',
    user:undefined,
    api_version: process.env.API_VERSION
  });
};
exports.bookExchangeView = (req, res)=>{
  const {books,user} = req.body;
  res.status(200).render('bookExchange', {
    title: 'Books Exchange',
    user:undefined,
    books: undefined,
    api_version: process.env.API_VERSION
  });
}

