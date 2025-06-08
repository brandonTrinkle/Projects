import axios from 'axios';

/********************************************************************
 *                         TRADE OPERATIONS
 ********************************************************************/

// Sell Stock
export const sellStock = async (userId, ticker, shares) => {
    try {
      const response = await fetch('/backend/trade/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ticker, shares}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error selling stock');
      return data;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  };
  
  // Buy Stock
  export const buyStock = async (userId, ticker, shares, price, companyName) => {
    try {
      const response = await fetch('/backend/trade/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ticker, shares, price, companyName }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error buying stock');
  
      // Use returned price if available; otherwise, use the provided price
      const finalPrice = data.price ?? price;
  
      // Record the purchase in history
      await fetch('/backend/history/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          stockTicker: ticker,
          shares,
          price: finalPrice,
          transactionType: 'buy'
        }),
      });
  
      return data;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  };

/********************************************************************
 *                       STOCK DATA FUNCTIONS
 ********************************************************************/
  
  // Fetch Stock and Intraday Data
  export async function fetchStockAndIntraday(ticker) {
    const res = await axios.get('https://api.twelvedata.com/time_series', {
      params: {
        symbol:    ticker.toUpperCase(),
        interval:  '5min',
        outputsize: 288,                        
        apikey:    'fa06fd0f6f704fda8991d6bba46958be',
      }
    });
  
    if (res.data.status === 'error') {
      throw new Error(res.data.message);
    }
  
    // Twelve Data gives res.data.values = [ { datetime, open, high, low, close, … }, … ]
    // values[0] is most recent; reverse for oldest→newest
    const values = res.data.values.slice().reverse();
  
    const last8h = values.slice(-96)
    const intradayData = last8h.map(v => {
      // turn "2025-04-17 14:30:00" into a Date
      const date = new Date(v.datetime.replace(' ', 'T'));
      return {
        time: date.getTime(),        
        price: parseFloat(v.close)
      };
    });  
  
    const latest = values[values.length - 1];
    const prev   = values[values.length - 2] || latest;
  
    return {
      ticker: ticker.toUpperCase(),
      price:  parseFloat(latest.close),
      high:   parseFloat(latest.high),
      low:    parseFloat(latest.low),
      trend:  parseFloat(latest.close) >= parseFloat(prev.close) ? 'Up' : 'Down',
      intradayData
    };
  }
  
  // Fetch Stock Data by Ticker
  export const fetchStockData = async (ticker) => {
    try {
      console.log(`API call to fetch stock data for ticker: ${ticker}`);
      const response = await fetch(`/backend/stocks/get?ticker=${ticker}`);
      if (!response.ok) {
        throw new Error('Stock not found');
      }
      const data = await response.json();
      console.log('Fetched Stock Data:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchStockData:', error.message);
      throw error;
    }
  };
  
  // Fetch All Stocks
  export const fetchAllStocks = async () => {
    try {
      const response = await fetch('/backend/stocks/all');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all stocks:', error.message);
      throw error;
    }
  };
  
/********************************************************************
 *                        USER OPERATIONS
 ********************************************************************/
  
  // Fetch All Users
  export const fetchAllUsers = async () => {
    try {
      const response = await fetch('/backend/user/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all users:', error.message);
      throw error;
    }
  };
  
  // Update User Level
  export const updateUserLevel = async (userId, level) => {
    try {
      const response = await fetch(`/backend/user/users/${userId}/level`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error updating user level');
      return data;
    } catch (error) {
      console.error('Error updating user level:', error);
      throw error;
    }
  };
  
  // Login User

  export const loginUser = async (username, password) => {
    try {
      const response = await fetch('/backend/auth/SignIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
  
      // Store user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      return data.user; // Return user data for Redux state
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
/********************************************************************
 *                        FUNDS MANAGEMENT
 ********************************************************************/
  
  // Add Funds to User Account
  export const addFunds = async (userId, amount) => {
    try {
      const response = await fetch('/backend/user/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error adding funds');
      return data;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  };
  
  //  Withdraw Funds from User Account
  export const withdrawFunds = async (userId, amount) => {
    try {
      const response = await fetch('/backend/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error removing funds');
      return data;
    } catch (error) {
      console.error('Error removing funds:', error);
      throw error;
    }
  };

/********************************************************************
 *                      FETCH USER HISTORY 
 ********************************************************************/
// Fetch user history by userId
export const fetchUserHistory = async (userId) => {
    try {
        const response = await fetch(`/backend/history/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user history:', error.message);
        throw error;
    }
};

 //Fetch user portfolio by userId
export const fetchUserPortfolio = async (userId) => {
    const url = `/backend/portfolio/${userId}`;
    console.log(`Fetching user portfolio from URL: ${url}`);

    const fetchWithRetry = async (retries) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch user portfolio: ${errorText}`);
            }
            const data = await response.json();
            console.log('Fetched User Portfolio:', data);
            return data;
        } catch (error) {
            if (retries > 0) {
                console.warn(`Retrying fetch user portfolio... (${retries} retries left)`);
                return fetchWithRetry(retries - 1);
            } else {
                console.error('Error fetching user portfolio:', error.message);
                throw error;
            }
        }
    };

    return fetchWithRetry(3); // Retry up to 3 times
};




