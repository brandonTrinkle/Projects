// Student Name: Brandon Trinkle
// Student ID: 1217455031
// Date: 3/15/2025

function loggerMiddleware(req, next) {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
}

module.exports = loggerMiddleware;