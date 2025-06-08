import axios from 'axios';
import dotenv from 'dotenv';
import Stock from '../models/stocks.model.js';

dotenv.config();

/**
 * Generate API URL for fetching stock data
 */
const getStockApiUrl = (ticker) => 
    `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.STOCK_API_KEY}`;

/**
 * Parse stock data received from API
 */
const parseStockData = (data) => {
    if (!data || typeof data.c !== 'number') {
        console.warn('Invalid stock data received');
        return null;
    }

    return {
        price: data.c,       // Current price
        high: data.h || 0,   // Daily high
        low: data.l || 0,    // Daily low
        volume: data.v || 0  // Trading volume
    };
};

/**
 * Fetch stock data from external API
 */
const fetchStockData = async (ticker) => {
    try {
        console.log(`Fetching data for ${ticker}...`);
        const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.STOCK_API_KEY}`;
        
        const response = await axios.get(url);
        
        // **Log the FULL API response**
        console.log(`📡 API Response for ${ticker}:`, response.data);

        // **Check if the response is valid**
        if (!response.data || typeof response.data.c !== 'number') {
            console.error(`Invalid API response for ${ticker}:`, response.data);
            return null;
        }

        return response.data; // Return full data object
    } catch (error) {
        console.error(`Error fetching stock data for ${ticker}:`, error);
        return null;
    }
};

/**
 * Update a single stock document in the database
 */
const updateStock = async (stock) => {
    console.log(`Updating stock: ${stock.ticker}`);
    const stockData = await fetchStockData(stock.ticker);

    if (stockData) {
        const { c: price, h: high, l: low } = stockData; 

        console.log(`🔍 Retrieved from API: ${stock.ticker} -> Price: ${price}`);

        if (!isNaN(price) && !isNaN(high) && !isNaN(low)) {
            stock.price = price;
            stock.high = Math.max(stock.high || 0, high);
            stock.low = stock.low === 0 ? low : Math.min(stock.low, low);

            await stock.save();
            console.log(`SAVED TO MONGO: ${stock.ticker} -> Price: ${stock.price}`);
        } else {
            console.warn(`Skipping ${stock.ticker}: Invalid data received.`);
        }
    } else {
        console.warn(`No data available to update ${stock.ticker}`);
    }
};

/**
 * Update all stocks in the database
 */
const updateStockPrices = async () => {
    try {
        console.log('Querying database for stocks...');
        const stocks = await Stock.find({});
        console.log(`Found ${stocks.length} stocks in the database.`);

        if (stocks.length === 0) {
            console.warn('No stocks found in the database to update.');
            return;
        }

        for (const stock of stocks) {
            console.log(`Updating ${stock.ticker}...`);
            const stockData = await fetchStockData(stock.ticker);

            if (stockData) {
                console.log(`API Returned:`, stockData);  // Log Finnhub response
                stock.price = stockData.c;
                stock.high = stockData.h;
                stock.low = stockData.l;
                stock.volume = stockData.v || 0;
                stock.updatedAt = new Date();

                await stock.save();
                console.log(`Saved ${stock.ticker}: ${stock.price}`);
            } else {
                console.error(`Skipped ${stock.ticker} due to missing data.`);
            }
        }
    } catch (error) {
        console.error('Error updating stock prices:', error);
    }
};

export { updateStockPrices };