import express from 'express';
import History from '../Models/history.model.js';

const router = express.Router();

// Add a new history entry
router.post('/add', async (req, res) => {
    const { userId, stockTicker, shares, price, transactionType } = req.body;

    try {
        const newHistory = new History({
            userId,
            stockTicker,
            shares,
            price,
            transactionType,
            date: new Date()
        });

        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (error) {
        console.error('Error adding history:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

// Fetch user history by userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const history = await History.find({ userId });
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching user history:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});