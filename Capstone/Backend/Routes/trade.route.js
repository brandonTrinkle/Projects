import express from 'express';
import { processStockPurchase, processStockSale  } from '../services/tradeStock.service.js';

const router = express.Router();

//  Buy Stocks
router.post('/buy', async (req, res) => {
    try {
        const { userId, ticker, shares, price, companyName } = req.body;
        if (!userId || !ticker || shares <= 0) {
            return res.status(400).json({ error: 'Invalid purchase request' });
        }

        const result = await processStockPurchase(userId, ticker, shares, price, companyName);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//  Sell Stocks
router.post('/sell', async (req, res) => {
  try {
      const { userId, ticker, shares } = req.body;
      if (!userId || !ticker || isNaN(shares) || shares <= 0) {
          return res.status(400).json({ error: 'Invalid sell request' });
      }

      const result = await processStockSale(userId, ticker, shares);
      res.status(200).json(result);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});
  
  export default router;