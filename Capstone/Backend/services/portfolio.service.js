import Portfolio from '../Models/portfolio.model.js';
import User from '../Models/user.model.js';

/********************************************************************
 *                   HELPER FUNCTIONS
 ********************************************************************/
// Check if a user has a portfolio; create one if missing.
export const checkOrCreatePortfolio = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found with ID: ${userId}`);

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
        portfolio = await Portfolio.create({
            userId,
            firstName: user.firstname,
            lastName: user.lastname,
            stocks: [],
            availableFunds: 0,
        });
        console.log(`Portfolio created for ${user.firstname} ${user.lastname}`);
    }
    return portfolio;
};

/********************************************************************
 *                   MIDDLEWARE
 ********************************************************************/
// Middleware to ensure the user has a portfolio before proceeding with the request.
export const checkOrCreatePortfolioMiddleware = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId;
        if (!userId) {
            return next(); // No userId found; skip middleware.
        }
        await checkOrCreatePortfolio(userId);
        next();
    } catch (error) {
        next(error);
    }
};

/********************************************************************
 *                   PORTFOLIO MANAGEMENT
 ********************************************************************/
// Add funds to a user's portfolio.
export const addFundsToPortfolio = async (userId, amount) => {
    if (amount <= 0) throw new Error('Amount must be greater than zero.');

    const portfolio = await checkOrCreatePortfolio(userId);
    portfolio.availableFunds += amount;
    await portfolio.save();

    return portfolio;
};