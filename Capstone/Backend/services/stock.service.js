// services/stock.service.js
import Stock from './Models/stocks.model.js';

export const getStockData = async (ticker) => {
    try {
        const stock = await Stock.findOne({ ticker });
        if (!stock) {
            throw new Error(`Stock data not found for ticker: ${ticker}`);
        }

        return {
            current: stock.price,
            high: stock.high,
            low: stock.low,
        };
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        throw error;
    }
};