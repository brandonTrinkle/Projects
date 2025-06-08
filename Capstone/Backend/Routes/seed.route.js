import express from 'express';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import Stock from '../models/stocks.model.js';
import fs from 'fs';
import csv from 'csv-parser';

dotenv.config();
const router = express.Router();

/********************************************************************
 *                   CONSTANTS & STATIC DATA
 ********************************************************************/
const supportedStocks = [
  { companyName: "Apple Inc.", ticker: "AAPL" },
  { companyName: "Microsoft Corp.", ticker: "MSFT" },
  { companyName: "Tesla Inc.", ticker: "TSLA" },
  { companyName: "Amazon.com Inc.", ticker: "AMZN" },
  { companyName: "Alphabet Inc.", ticker: "GOOGL" },
  // Add more supported stocks as needed
];

/********************************************************************
 *                   HELPER FUNCTIONS
 ********************************************************************/

// * 1. Filter out unsupported tickers (those containing a dot)
const findBestMatch = (results) => {
  const filtered = results.filter(result => result.symbol && !result.symbol.includes('.'));
  return filtered.length ? filtered[0] : results[0];
};

// * 2. Get Company Search URL for Finnhub
const getCompanySearchUrl = (companyName) => {
  return `https://finnhub.io/api/v1/search?q=${companyName}&token=${process.env.STOCK_API_KEY}`;
};

// * 3. Fetch dynamic price data (quote) for a ticker
const getStockPriceData = async (ticker) => {
  try {
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: ticker.toUpperCase(),
        token: process.env.STOCK_API_KEY,
      },
    });
    const data = response.data;
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No price data found for ${ticker}`);
    }
    return {
      price: data.c,
      high: data.h,
      low: data.l,
    };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(`Access forbidden when fetching price data for ${ticker}. Check API permissions or ticker validity.`);
    } else {
      console.error(`Error fetching price data for ${ticker}:`, error.message);
    }
    throw error;
  }
};

// * 4. Fetch stock details (ticker) based on company name using Finnhub search API
const fetchStockDetails = async (companyName) => {
  try {
    console.log(`Searching for company: ${companyName}`);
    const url = getCompanySearchUrl(companyName);
    const searchResponse = await axios.get(url);
    const bestMatch = findBestMatch(searchResponse.data.result);
    if (!bestMatch) {
      console.warn(`No matching stock found for ${companyName}`);
      return null;
    }
    const ticker = bestMatch.symbol;
    console.log(`Found Ticker: ${ticker}`);
    return ticker;
  } catch (error) {
    console.error('Error fetching stock details:', error.message);
    return null;
  }
};

// * 5. Fetch outstanding shares (for market cap calculation)
const fetchStockProfile = async (ticker) => {
  try {
    console.log(`📡 Fetching stock profile for ${ticker}...`);
    const response = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
      params: { symbol: ticker, token: process.env.STOCK_API_KEY }
    });
    if (response.data && response.data.shareOutstanding) {
      return response.data.shareOutstanding;
    } else {
      console.warn(`No outstanding shares data for ${ticker}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(`Access forbidden for stock profile of ${ticker}. Check API permissions or ticker validity.`);
    } else {
      console.error(`Error fetching stock profile for ${ticker}:`, error.message);
    }
    return null;
  }
};

// * 6. Validate the request body for adding a stock
const validateRequestBody = (body) => {
  const { companyName, volume } = body;
  if (!companyName || isNaN(volume) || volume <= 0) {
    return { valid: false, error: 'Company name and valid volume are required' };
  }
  return { valid: true };
};

// * 7. Get stock ticker from company name (alternative)
const getStockTicker = async (companyName) => {
  try {
    console.log(`Searching for company: ${companyName}`);
    const url = `https://finnhub.io/api/v1/search?q=${companyName}&token=${process.env.STOCK_API_KEY}`;
    const searchResponse = await axios.get(url);
    const bestMatch = findBestMatch(searchResponse.data.result);
    if (!bestMatch) {
      throw new Error(`No matching stock found for ${companyName}`);
    }
    console.log(`Found Ticker: ${bestMatch.symbol}`);
    return bestMatch.symbol;
  } catch (error) {
    console.error('Error fetching stock details:', error.message);
    throw error;
  }
};

/********************************************************************
 *                           ROUTES
 ********************************************************************/

// GET /quote - Get live quote for a ticker and transform the data for the front end
router.get('/quote', async (req, res) => {
  try {
    const { ticker } = req.query;
    const finnhubResponse = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: ticker,
        token: process.env.STOCK_API_KEY
      }
    });
    const data = finnhubResponse.data; // { c, h, l, o, pc, t }

    // Transform fields to match front-end expectations
    const transformed = {
      ticker: ticker.toUpperCase(),
      price: data.c,
      high: data.h,
      low: data.l,
      trend: data.c >= data.pc ? 'Up' : 'Down'
    };

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// POST /add - Add a new stock to the database
router.post('/add', async (req, res) => {
  try {
    const validation = validateRequestBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { companyName, volume, ticker: providedTicker } = req.body;
    // Use provided ticker (from admin dropdown) if available; otherwise search by company name.
    const ticker = providedTicker || await getStockTicker(companyName);

    // Check if the stock already exists in the database
    const stockExists = await Stock.findOne({ ticker });
    if (stockExists) {
      return res.status(409).json({ error: 'Stock already exists' });
    }

    // Fetch outstanding shares for market cap calculation
    const outstandingShares = await fetchStockProfile(ticker);

    // Fetch dynamic price data (price, high, and low)
    const priceData = await getStockPriceData(ticker);

    // Create a new stock record with dynamic data
    const newStock = new Stock({
      companyName,
      ticker,
      volume,
      price: priceData.price,
      high: priceData.high,
      low: priceData.low,
      outstandingShares,
      marketCap: outstandingShares ? priceData.price * outstandingShares : null,
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (err) {
    console.error('Error adding stock:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /sp500-static - Read and return the S&P 500 list from a CSV file
router.get('/sp500-static', (req, res) => {
  const results = [];
  // Adjust file path as necessary
  const filePath = path.join(process.cwd(), './sp500_constituents.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const sp500List = results.map(row => ({
        symbol: row.Symbol || row.symbol,
        name: row.Name || row.name,
      }));
      res.json(sp500List);
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
      res.status(500).json({ error: 'Failed to read S&P 500 CSV' });
    });
});

// GET /finnhub-us-tickers - Fetch US stock symbols from Finnhub
router.get('/finnhub-us-tickers', async (req, res) => {
  try {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.STOCK_API_KEY}`;
    const response = await axios.get(url);
    const allSymbols = response.data;

    const filteredSymbols = allSymbols
      .filter(item => !item.symbol.includes('.'))
      .slice(0, 100);

    const result = filteredSymbols.map(item => ({
      symbol: item.symbol,
      description: item.description || '',
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching US tickers from Finnhub:', error);
    res.status(500).json({ error: 'Failed to fetch US tickers' });
  }
});

// GET /all - Get all stocks from the database
router.get('/all', async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// GET /get - Get a specific stock by ticker
router.get('/get', async (req, res) => {
  const { ticker } = req.query;
  try {
    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /supported - Return the hard-coded list of supported stocks
router.get('/supported', (req, res) => {
  res.json(supportedStocks);
});

// GET /intraday-twelve - Fetch intraday data from Twelve Data
router.get('/intraday-twelve', async (req, res) => {
  try {
    const { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker is required' });
    }

    // Twelve Data time_series endpoint
    const tdUrl = 'https://api.twelvedata.com/time_series';
    const response = await axios.get(tdUrl, {
      params: {
        symbol:     ticker.toUpperCase(),
        interval:   '5min',
        outputsize: 288,                  // ~24 hours of 5 min bars
        apikey:     process.env.TWELVE_DATA_KEY
      }
    });
    const data = response.data;

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message });
    }

    // Twelve Data returns newest→oldest; reverse to chronological
    const values = data.values.slice().reverse();
    const intradayArray = values.map(v => ({
      time:  new Date(v.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(v.close)
    }));

    res.json(intradayArray);
  } catch (err) {
    console.error('Twelve Data intraday route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;