import axios from 'axios';
import dotenv from 'dotenv';
import Stock from '../models/stocks.model.js';

dotenv.config();
console.log("Finnhub API Key:", process.env.STOCK_API_KEY);

/********************************************************************
 *                      HELPER FUNCTIONS
 ********************************************************************/

const getStockHighLowPrice = async (ticker) => {
    try {
        console.log(`Fetching stock price for ${ticker}`);
        console.log(`API Key: ${process.env.STOCK_API_KEY}`);
        console.log(`Fetching latest stock prices for ${ticker}...`);

        // Fetch stock data from Finnhub
        const response = await axios.get('https://finnhub.io/api/v1/quote', {
            params: {
                symbol: ticker.toUpperCase(),
                token: process.env.STOCK_API_KEY,
            },
        });

        const data = response.data;
        if (!data || Object.keys(data).length === 0) {
            throw new Error(`No data found for ${ticker}`);
        }

        return {
            price: Number(data.c), // Current price
            high: Number(data.h),  // Daily high
            low: Number(data.l),   // Daily low
        };
    } catch (error) {
        console.error(`Error fetching high/low prices for ${ticker}:`, error.message);
        return { price: 0, high: 0, low: 0 };
    }
};

/********************************************************************
 *                     STOCK UPDATE FUNCTIONS
 ********************************************************************/

export const updateStockPrices = async () => {
    try {
        const stocks = await Stock.find({});

        for (const stock of stocks) {
            const newPriceData = await getStockHighLowPrice(stock.ticker);

            if (newPriceData && newPriceData.price) {
                stock.price = newPriceData.price;
                stock.high = newPriceData.high;
                stock.low = newPriceData.low;
                stock.marketCap = newPriceData.price * stock.volume;

                await stock.save(); // Save updated stock data
                console.log(`Updated ${stock.ticker}: Price = $${newPriceData.price}, Market Cap = $${stock.marketCap}`);
            }
        }
    } catch (error) {
        console.error('Error updating stock prices:', error.message);
    }
};

/********************************************************************
 *                     API ROUTE HANDLERS
 ********************************************************************/

export const searchStockByCompanyName = async (req, res) => {
    try {
        const { company } = req.query;
        if (!company) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        console.log(`Searching for stock ticker of: ${company}`);

        // Search for company ticker using Finnhub
        const searchResponse = await axios.get('https://finnhub.io/api/v1/search', {
            params: {
                q: company,
                token: process.env.STOCK_API_KEY,
            },
        });

        const results = searchResponse.data.result;
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: `No stock found for ${company}` });
        }

        // Get the best match (first result)
        const bestMatch = results[0];
        const ticker = bestMatch.symbol;
        console.log(`Found stock: ${ticker}`);

        // Fetch stock price, high, and low values
        const stockPriceData = await getStockHighLowPrice(ticker);

        // Fetch stock profile (company details)
        const profileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: {
                symbol: ticker,
                token: process.env.STOCK_API_KEY,
            },
        });

        const stockProfile = profileResponse.data;
        if (!stockProfile || Object.keys(stockProfile).length === 0) {
            return res.status(404).json({ error: 'Stock profile not found' });
        }

        // Extract outstanding shares if available
        const outstandingShares = stockProfile.shareOutstanding || null;

        // Calculate market cap dynamically
        const marketCap = stockPriceData.price * (outstandingShares || 0);

        // Construct final stock object
        const stockData = {
            ticker,
            companyName: stockProfile.name || company,
            price: stockPriceData.price,
            high: stockPriceData.high,
            low: stockPriceData.low,
            outstandingShares,
            marketCap,
        };

        res.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};