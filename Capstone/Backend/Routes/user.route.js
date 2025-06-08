import express from 'express';
import User from '../Models/user.model.js';
import Portfolio from '../Models/portfolio.model.js';
import History from '../Models/history.model.js';

const router = express.Router();

/********************************************************************
 *                   HELPER FUNCTIONS
 ********************************************************************/

// Validation for registration input
const validateRegistrationInput = ({ username, firstname, lastname, email, password }) => {
    if (!username || !firstname || !lastname || !email || !password) {
        return { valid: false, error: 'All fields are required.' };
    }
    return { valid: true };
};

// Check if user already exists by email
const checkUserExists = async (email) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }
};

// Create a new user and portfolio
const createUserAndPortfolio = async (userData) => {
    const { username, firstname, lastname, email, password } = userData;
    const newUser = new User({ 
        username, 
        firstName: firstname, 
        lastName: lastname, 
        email, 
        password 
    });
    await newUser.save();

    const newPortfolio = new Portfolio({
        userId: newUser.userId,
        firstname,
        lastname,
        stocks: [],
        availableFunds: 0,
    });
    await newPortfolio.save();

    return newUser;
};

/********************************************************************
 *                           ROUTES
 ********************************************************************/

// Register a new user and create a portfolio
router.post('/register', async (req, res) => {
    try {
        const validation = validateRegistrationInput(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        await checkUserExists(req.body.email);
        const newUser = await createUserAndPortfolio(req.body);

        res.status(201).json({ 
            message: 'User and portfolio created successfully.', 
            user: newUser 
        });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add funds to a user's portfolio
router.post('/deposit', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid user ID or deposit amount.' });
        }

        const portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found.' });
        }

        if (amount > 1000000) {
            return res.status(400).json({ error: 'Deposit exceeds the allowed limit.' });
        }

        portfolio.availableFunds += parseFloat(amount);
        await portfolio.save();

        const depositHistory = new History({
            userId,
            stockTicker: 'CASH',
            shares: amount,
            price: 1.00,
            transactionType: 'deposit',
            date: new Date()
        });
        await depositHistory.save();

        res.status(200).json({ 
            message: 'Deposit successful', 
            availableFunds: portfolio.availableFunds 
        });
    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Withdraw funds from a user's portfolio
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid user ID or withdrawal amount.' });
        }

        const portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found.' });
        }

        if (portfolio.availableFunds < amount) {
            return res.status(400).json({ error: 'Insufficient funds.' });
        }

        portfolio.availableFunds -= parseFloat(amount);
        await portfolio.save();

        const withdrawHistory = new History({
            userId,
            stockTicker: 'CASH',
            shares: amount,
            price: 1.00,
            transactionType: 'withdraw',
            date: new Date()
        });
        await withdrawHistory.save();

        res.status(200).json({ 
            message: 'Withdrawal successful', 
            availableFunds: portfolio.availableFunds 
        });
    } catch (error) {
        console.error('Error processing withdrawal:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user level
router.put('/users/:userId/level', async (req, res) => {
    try {
        const { userId } = req.params;
        const { level } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.level = level;
        await user.save();

        res.status(200).json({ message: 'User level updated successfully.', user });
    } catch (error) {
        console.error('Error updating user level:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;