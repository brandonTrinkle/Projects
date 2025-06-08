import express from 'express';
import mongoose from 'mongoose';
import Portfolio from '../Models/portfolio.model.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching portfolio for userId: ${userId}`);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format');
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const portfolio = await Portfolio.findOne({ userId });
        console.log('Fetched Portfolio:', portfolio);

        if (!portfolio) {
            console.error('Portfolio not found');
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        res.json(portfolio); // Return the complete portfolio data
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
