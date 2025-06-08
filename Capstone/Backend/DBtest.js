import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Portfolio from './Models/portfolio.model.js'; // Adjust path as needed
import User from './Models/user.model.js'; // Adjust path as needed

dotenv.config(); // Load environment variables

const app = express();
const PORT = 5000; // Test server port

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Routes for Testing

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single portfolio by ID
app.get('/portfolio/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid _id format' });
        }

        const portfolio = await Portfolio.findById(id);

        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        res.status(200).json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all portfolios
app.get('/portfolios', async (req, res) => {
    try {
        const portfolios = await Portfolio.find();
        res.status(200).json(portfolios);
    } catch (error) {
        console.error('Error fetching portfolios:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Test server running on http://localhost:${PORT}`);
});