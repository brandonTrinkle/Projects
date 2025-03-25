// Example middleware function to transform the request body to uppercase
exports.makeUpperCase = (req, res, next) => {
  if (req.body.name) {
    req.body.name = req.body.name.toUpperCase();
  }
  next();
};