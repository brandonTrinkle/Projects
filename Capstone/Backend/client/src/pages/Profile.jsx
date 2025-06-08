import React, { 
  useState, 
  useEffect, 
  useCallback 
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../redux/User/UserSlice';
import StockCard from './stockCard.jsx';
import {
  fetchStockAndIntraday,
  buyStock,
  fetchAllStocks,
  fetchAllUsers,
  updateUserLevel,
  addFunds,
  withdrawFunds,
  fetchUserHistory,
  sellStock,
  fetchStockData,
  fetchUserPortfolio,
} from '../services/apiService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HolidayModal from '../components/HolidayModal';
import TradeHoursForm from '../components/TradeHoursForm';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import axios from 'axios';
import { socket } from '../webSocketService.js'

export default function Profile() {
  /*
  ********************************************************************
  *  REDUX & LOCAL STORAGE
  ********************************************************************
  */
  const { currentUser: reduxUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentUser = reduxUser?.user || reduxUser || storedUser?.user || storedUser;

 

  /*
  ********************************************************************
  *  STATE
  ********************************************************************
  */
  const [profileChoice, setProfileChoice] = useState(null);

  // Stock/Trading Data
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [shares, setShares] = useState(0);
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [selectedSellStock, setSelectedSellStock] = useState('');
  const [sellStockData, setSellStockData] = useState(null);
  const [sellShares, setSellShares] = useState(0);
  const [lastTime, setLastTime] = useState(null)
 

  // Admin Data
  const [availableUsers, setUsers] = useState([]);
  const [supportedStocks, setSupportedStocks] = useState([]);
  const [finnhubSymbols, setFinnhubSymbols] = useState([]);
  const [sp500List, setSp500List] = useState([]);
  const [quoteData, setQuoteData] = useState(null);
  const [searchTicker, setSearchTicker] = useState('');

  // Holidays & Trade Hours
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState(JSON.parse(localStorage.getItem('holidays')) || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tradeHours, setTradeHours] = useState(
    JSON.parse(localStorage.getItem('tradeHours')) || {
      startTime: '09:30',
      endTime: '16:00',
    }
  );

  // User History
    const [userHistory, setUserHistory] = useState([]);

    // User Portfolio
    const [userPortfolio, setUserPortfolio] = useState(null);

  // Misc
  const [errorMessage, setErrorMessage] = useState('');

  /*
  ********************************************************************
  *  USE EFFECTS: DATA FETCHING & INITIALIZATION
  ********************************************************************
  */

  // 1) Initialize available funds from current user
  useEffect(() => {
    if (currentUser) {
      setAvailableFunds(currentUser.availableFunds || 0);
    }
  }, [currentUser]);

  // 2) Debug: Log current user from Redux & LocalStorage
  useEffect(() => {
    console.log('Redux Current User:', reduxUser);
    console.log('LocalStorage Current User:', storedUser);
    console.log('Final Current User:', currentUser);
  }, [reduxUser, storedUser, currentUser]);

  // 3) Fetch All Stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocks = await fetchAllStocks();
        setAvailableStocks(stocks);
      } catch (error) {
        console.error('Error fetching stocks:', error.message);
      }
    };
    fetchStocks();
  }, []);

  // 4) Fetch All Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await fetchAllUsers();
        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };
    fetchUsers();
  }, []);

  // 5) Fetch User History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await fetchUserHistory(currentUser.userId);
        console.log('User History:', history);
        setUserHistory(history);
      } catch (error) {
        console.error('Error fetching user history:', error.message);
      }
    };
    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  // 6) Fetch Admin-Specific Lists
  // a) S&P 500 from CSV
  useEffect(() => {
    if (currentUser?.level === 'Admin') {
      axios
        .get('/backend/stocks/sp500-static')
        .then((res) => {
          setSp500List(res.data);
        })
        .catch((err) => {
          console.error('Error fetching S&P 500 list:', err);
        });
    }
  }, [currentUser]);

  // b) "Supported" Stocks
  useEffect(() => {
    if (currentUser?.level === 'Admin') {
      axios
        .get('/backend/stocks/supported')
        .then((res) => setSupportedStocks(res.data))
        .catch((err) => console.error('Error fetching supported stocks:', err));
    }
  }, [currentUser]);

  // c) Finnhub US Tickers
  useEffect(() => {
    if (currentUser?.level === 'Admin') {
      axios
        .get('/backend/stocks/finnhub-us-tickers')
        .then((res) => {
          // e.g. [{ symbol: 'AAPL', description: 'Apple Inc' }, ...]
          setFinnhubSymbols(res.data);
        })
        .catch((err) => {
          console.error('Error fetching finnhub tickers:', err);
        });
    }
  }, [currentUser]);

  // 7) Fetch User Portfolio
  useEffect(() => {
      const fetchPortfolio = async () => {
          try {
            if (currentUser) {
                console.log('Fetching portfolio for user ID:', currentUser.userId);
                const portfolioData = await fetchUserPortfolio(currentUser.userId);
                console.log('Fetched Portfolio Data:', portfolioData);
                setUserPortfolio(portfolioData);
                    setUserPortfolio(portfolioData);                    
                } else {
                    console.error('User ID is missing');
                }
            } catch (error) {
                console.error('Error fetching user portfolio:', error.message);
            }
        };

        if (currentUser) {
            fetchPortfolio();
        }
    }, [currentUser]);

  /*
  ********************************************************************
  *  HELPER FUNCTIONS
  ********************************************************************
  */

  // Sign Out
  const handleSignOut = async () => {
    try {
      await fetch('/backend/auth/signout');
      dispatch(signOut());
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Date Click
  const handleDateClick = (clickedDate) => {
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  // Save Holiday
  const handleSaveHoliday = (holiday) => {
    const updatedHolidays = { ...holidays, [selectedDate.toDateString()]: holiday };
    setHolidays(updatedHolidays);
    localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
    setIsModalOpen(false);
  };

  // Delete Holiday
  const handleDeleteHoliday = (holidayDate) => {
    const updatedHolidays = { ...holidays };
    delete updatedHolidays[holidayDate.toDateString()];
    setHolidays(updatedHolidays);
    localStorage.setItem('holidays', JSON.stringify(updatedHolidays));
  };

  // Save Trade Hours
  const handleSaveTradeHours = (hours) => {
    setTradeHours(hours);
    localStorage.setItem('tradeHours', JSON.stringify(hours));
  };

  // User Level Update
  const handleUserLevelUpdate = async (userId, newLevel) => {
    try {
      await updateUserLevel(userId, newLevel);
      const updatedUsers = availableUsers.map((user) =>
        user._id === userId ? { ...user, level: newLevel } : user
      );
      setUsers(updatedUsers);
      alert('User level updated successfully.');
    } catch (error) {
      alert(error.message);
    }
  };

  // Sell Stocks
    const handleSellStockSelect = async (e) => {
        const ticker = e.target.value;
        setSelectedSellStock(ticker);
        try {
            // Fetch current price and intraday data from the stocks database
            const { price, high, low, trend, intradayData } = await fetchStockAndIntraday(ticker);
            setSellStockData({ ticker, price, high, low, trend, intradayData });
        } catch (error) {
            console.error('Error fetching sell stock data:', error.message);
        }
    };

    // SocketIO wrapped inside portfolio refresh for real-time updates
    const { userId } = currentUser || {};
    const refreshPortfolio = useCallback(async () => {
      if (!userId) {
        console.warn("No userId to refresh portfolio.");
        return;
      }
  
      try {
        const response = await fetch(`/backend/portfolio/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserPortfolio(data);
          setAvailableFunds(data.availableFunds);
        } else {
          console.error("Failed to refresh portfolio");
        }
      } catch (error) {
        console.error("Error refreshing portfolio:", error.message);
      }
    }, [userId]); 

    useEffect(() => {
      const updateHandler = (change) => {
        console.log("Database update received:", change);
        refreshPortfolio();
      };
  
      socket.on("databaseUpdate", updateHandler);
  
      return () => {
        socket.off("databaseUpdate", updateHandler);
      };
    }, [refreshPortfolio]);
  /*
  ********************************************************************
  *  TRADING & STOCK ACTIONS
  ********************************************************************
  */

  // Select a Stock (Buy Flow)
  const handleStockSelect = async (e) => {
    const ticker = e.target.value;
    setSelectedStock(ticker);
    if (!ticker) return;
  
    try {
      const { price, high, low, trend, intradayData: fullData } =
        await fetchStockAndIntraday(ticker);
  
      // 1) Find the timestamp of the most recent bar
      const lastTime = fullData[fullData.length - 1].time;
      setLastTime(lastTime);
  
      // 2) Subtract 8 hours (in ms) from that timestamp
      const eightHoursAgo = lastTime - 8 * 60 * 60 * 1000;
  
      // 3) Only keep points within the last 8h of trading data
      const recentData = fullData.filter(point => point.time >= eightHoursAgo);
  
      setStockData({ ticker, price, high, low, trend });
      setTotalValue(price * shares);
      setChartData(recentData);
    } catch (error) {
      console.error('Error fetching stock and intraday data:', error.message);
    }
  };

  // Buy Stock
  const handleBuyStock = async (e) => {
    e.preventDefault();

    if (totalValue > availableFunds) {
      alert('Not enough available funds.');
      return;
    }

    const sharesToBuy = parseInt(shares, 10);

    if (!selectedStock || !stockData) {
      alert('Please select a stock.');
      return;
    }
    if (isNaN(sharesToBuy) || sharesToBuy <= 0) {
      alert('Please enter a valid number of shares.');
      return;
    }

    try {
      const companyName =
        availableStocks.find((stock) => stock.ticker === selectedStock)?.companyName || 'Unknown';
      const response = await buyStock(
        currentUser.userId,
        selectedStock,
        sharesToBuy,
        stockData.price,
        companyName
      );

      if (response.portfolio) {
        setAvailableFunds(response.portfolio.availableFunds);
        alert(`Successfully bought ${sharesToBuy} shares of ${selectedStock}!`);
      } else {
        throw new Error('Failed to update portfolio.');
      }
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  };

  // Add Stock (Admin)
  const handleAddStock = async (e) => {
    e.preventDefault();
    const ticker = e.target.elements.ticker.value;
    const volume = e.target.elements.volume.value;
    const selected = sp500List.find((item) => item.symbol === ticker);
    const companyName = selected ? selected.name : 'Unknown';

    try {
      await axios.post('/backend/stocks/add', {
        companyName,
        ticker,
        volume,
      });
      alert(`Successfully added stock: ${companyName} (${ticker})`);
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      alert(`Error adding stock: ${errMsg}`);
    }
  };

  // Ticker Change (Admin)
  const handleTickerChange = async (e) => {
    const selectedTicker = e.target.value;
    if (!selectedTicker) {
      setQuoteData(null);
      return;
    }
    try {
      const res = await axios.get(`/backend/stocks/quote?ticker=${selectedTicker}`);
      setQuoteData(res.data);
    } catch (err) {
      console.error('Error fetching quote data:', err);
    }
  };

  /*
  ********************************************************************
  *  FUNDS MANAGEMENT
  ********************************************************************
  */

  // Deposit
  const handleUserDeposit = async (e) => {
    e.preventDefault();
    let { amount } = e.target.elements;
    let depositAmount = amount.value.trim().replace(/^0+/, '');

    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    if (!currentUser?.userId) {
      alert('Error: User ID not found. Please log in again.');
      return;
    }

    try {
      await addFunds(currentUser.userId, parseFloat(depositAmount));
      alert(`Successfully added $${depositAmount} to your account.`);
      setAvailableFunds((prevFunds) => prevFunds + parseFloat(depositAmount));
    } catch (error) {
      alert(`Error depositing funds: ${error.message}`);
    }
  };

  // Withdraw
  const handleUserWithdraw = async (e) => {
    e.preventDefault();
    let { amount } = e.target.elements;
    let withdrawAmount = amount.value.trim().replace(/^0+/, '');

    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > availableFunds) {
      alert('Not enough available funds.');
      return;
    }
    if (!currentUser?.userId) {
      alert('Error: User ID not found. Please log in again.');
      return;
    }

    try {
      await withdrawFunds(currentUser.userId, parseFloat(withdrawAmount));
      alert(`Successfully withdrew $${withdrawAmount} from your account.`);
      setAvailableFunds((prevFunds) => prevFunds - parseFloat(withdrawAmount));
    } catch (error) {
      alert(`Error withdrawing funds: ${error.message}`);
    }
  };

  // Calculate Sell Estimates
  const calculateSellEstimates = () => {
    if (!sellStockData || !sellShares || !selectedSellStock) return null;
    const currentPrice = sellStockData.price;

    // Filter only relevant buy transactions
    const buyTransactions = userHistory
        .filter(txn => txn.stockTicker === selectedSellStock && txn.transactionType === 'buy')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

    if (buyTransactions.length === 0) return null;

    let sharesRemaining = sellShares;
    let totalCost = 0;
    let totalShares = 0;

    // Apply FIFO to match shares sold to oldest buy transactions
    for (const txn of buyTransactions) {
        if (sharesRemaining <= 0) break;
        const sharesToUse = Math.min(txn.shares, sharesRemaining);
        totalShares += sharesToUse;
        totalCost += sharesToUse * txn.price;
        sharesRemaining -= sharesToUse;
    }

    const avgPurchasePrice = totalCost / totalShares;
    const saleProceeds = sellShares * currentPrice;
    const costBasis = sellShares * avgPurchasePrice;
    const profit = saleProceeds - costBasis;

    return { currentPrice, avgPurchasePrice, saleProceeds, profit };
};

  /*
  ********************************************************************
  *  RENDER UI COMPONENTS
  ********************************************************************
  */

    // Render Sell Stocks UI
    const renderSellStocks = () => {
        const estimates = calculateSellEstimates();
        return (
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#1e1e1e', color: 'white', mt: 2, mb: 80  }}>
                <Typography variant="h5" gutterBottom>
                    Sell Stocks
                </Typography>
                {!userPortfolio ? (
                    <Typography>Loading portfolio...</Typography>
                ) : (
                    <>
                        <Select
                            fullWidth
                            value={selectedSellStock}
                            onChange={handleSellStockSelect}
                            displayEmpty
                            sx={{ bgcolor: 'white', mb: 2 }}
                        >
                            <MenuItem value="" disabled>
                                Select a Stock to Sell
                            </MenuItem>
                            {userPortfolio.stocks.map((stock) => (
                                <MenuItem key={stock.ticker} value={stock.ticker}>
                                    {stock.ticker} - {stock.companyName} ({stock.shares} shares)
                                </MenuItem>
                            ))}
                        </Select>
                        {selectedSellStock && (
                            <>
                                <TextField
                                    label="Number of Shares to Sell"
                                    type="number"
                                    fullWidth
                                    value={sellShares || ''}
                                    onChange={(e) => setSellShares(Number(e.target.value))}
                                    sx={{ bgcolor: 'white', mb: 2}}
                                    inputProps={{ min: 1 }}
                                    InputLabelProps={{
                                       style: { padding: '10px' },
                                     }}
                                />
                                {sellStockData && (
                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="h6">{selectedSellStock}</Typography>
                                        <Typography variant="subtitle2" color="info.main">
                                            Current Price: ${sellStockData.price.toFixed(2)}
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={200}>
                                          <LineChart data={chartData}>
                                            <XAxis
                                              dataKey="time"
                                              type="number"
                                              scale="time"
                                              // 3) zoom the axis to exactly [8h ago .. newest]
                                              domain={['dataMin', 'dataMax']}
                                              tickCount={8}
                                              tickFormatter={ms =>
                                                new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                              }
                                            />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip labelFormatter={ms =>
                                              new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            }
                                            contentStyle={{
                                              backgroundColor: 'transparent',
                                              border: 'none',
                                            }}/>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <Line
                                              type="monotone"
                                              dataKey="price"
                                              stroke={stockData.trend === 'Up' ? '#00ff00' : '#ff0000'}
                                              dot={false}
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                )}
                                {estimates && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography>
                                            Current Sell Price: ${estimates.currentPrice.toFixed(2)}
                                        </Typography>
                                        <Typography>
                                            Sale Proceeds: ${estimates.saleProceeds.toFixed(2)}
                                        </Typography>
                                        <Typography>
                                            Avg Purchase Price: ${estimates.avgPurchasePrice.toFixed(2)}
                                        </Typography>
                                        <Typography sx={{ color: estimates.profit >= 0 ? 'lightgreen' : 'red' }}>
                                            {estimates.profit >= 0 ? 'Gain' : 'Loss'}: ${Math.abs(estimates.profit).toFixed(2)}
                                        </Typography>
                                    </Box>
                                )}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={async () => {
                                        console.log('Sell Request Payload:', {
                                            userId: currentUser.userId,
                                            ticker: selectedSellStock,
                                            shares: sellShares,
                                        });
                                        try {
                                            const result = await sellStock(currentUser.userId, selectedSellStock, sellShares);
                                            // Display details in the alert
                                            alert(
                                                `Successfully sold ${sellShares} shares of ${selectedSellStock}!\n` +
                                                `New Available Funds: $${result.availableFunds.toFixed(2)}`
                                            );
                                            // Refresh portfolio data after sale
                                            await refreshPortfolio();
                                            setSelectedSellStock('');
                                            setSellStockData(null);
                                            setSellShares(0);
                                        } catch (error) {
                                            alert(error.message);
                                        }
                                    }}
                                    sx={{ mt: 2 }}
                                >
                                    Sell Stock
                                </Button>
                            </>
                        )}
                    </>
                )}
            </Paper>
        );
    };


  

  // Render Buy Stocks UI (case 1)
  const renderBuyStocks = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="h4">Welcome, {currentUser?.firstname}</Typography>
        <Typography variant="h6">Available Funds: ${availableFunds.toFixed(2)}</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, bgcolor: '#1e1e1e', color: 'white', mb: 80 }}>
          <Typography variant="h5">Buy Stocks</Typography>
          <Typography variant="subtitle1" color="success.main">
            Available Funds: ${availableFunds.toFixed(2)}
          </Typography>

          <Select
            fullWidth
            value={selectedStock}
            onChange={handleStockSelect}
            displayEmpty
            sx={{ my: 2, bgcolor: 'white' }}
          >
            <MenuItem value="" disabled>
              Select a Stock
            </MenuItem>
            {availableStocks.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.ticker} - {stock.companyName}
              </MenuItem>
            ))}
          </Select>

          {stockData && (
            <Box sx={{ my: 2 }}>
              <Typography variant="h6">{stockData.ticker}</Typography>
              <Typography variant="subtitle2" color="info.main">
                Current Price: ${stockData.price.toFixed(2)}
              </Typography>
              <Typography variant="subtitle2" color="warning.main">
                High: ${stockData.high.toFixed(2)}
              </Typography>
              <Typography variant="subtitle2" color="error.main">
                Low: ${stockData.low.toFixed(2)}
              </Typography>
              <Typography
                variant="subtitle2"
                color={stockData.trend === 'Up' ? 'success.main' : 'error.main'}
              >
                Trend: {stockData.trend}
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    // 3) zoom the axis to exactly [8h ago .. newest]
                    domain={['dataMin', 'dataMax']}
                    tickCount={8}
                    tickFormatter={ms =>
                      new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={ms =>
                    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                  contentStyle={{
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={stockData.trend === 'Up' ? '#00ff00' : '#ff0000'}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              Shares
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              type="number"
              placeholder="Number of shares"
              value={shares || ''}
              onChange={(e) => {
                let inputValue = e.target.value;
                if (inputValue === '') {
                  setShares(0);
                  setTotalValue(0);
                  return;
                }
                const numericValue = Math.max(
                  parseInt(inputValue.replace(/^0+/, ''), 10) || 0,
                  0
                );
                setShares(numericValue);
                setTotalValue(numericValue * (stockData?.price || 0));
              }}
              sx={{ bgcolor: 'white', mt: 1 }}
              inputProps={{ min: 0 }}
            />
          </Box>

          <Typography variant="h6">Total Cost: ${totalValue.toFixed(2)}</Typography>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleBuyStock}
            sx={{ mt: 2 }}
          >
            Buy Stock
          </Button>
        </Paper>
      </Box>

      <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
        <Typography variant="body2" align="center">
          TTU Platform © All rights reserved
        </Typography>
      </Box>
    </Box>
    );

    // -- Render User History (case 8)
    const renderUserHistory = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h4">Transaction History</Typography>
            </Box>

            <Box sx={{ flex: 1, p: 3 }}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: '#dae8eb', color: 'black' }}>
                    <Typography variant="h5">Your Transactions</Typography>
                    <Box sx={{ mt: 2 }}>
                        {userHistory.length === 0 ? (
                            <Typography variant="body1" color="textSecondary">
                                No transaction history available.
                            </Typography>
                        ) : (
                            userHistory.map((historyItem) => (
                                <Box
                                    key={historyItem._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        mb: 2,
                                        bgcolor: '#f0f0f0',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" color="primary">
                                            {historyItem.stockTicker}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(historyItem.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            Shares: {historyItem.shares}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Price: ${historyItem.price.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color={
                                                historyItem.transactionType === 'buy'
                                                    ? 'success.main'
                                                    : historyItem.transactionType === 'sell'
                                                        ? 'error.main'
                                                        : 'info.main'
                                            }
                                        >
                                            {historyItem.transactionType.charAt(0).toUpperCase() +
                                                historyItem.transactionType.slice(1)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>

            <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
                <Typography variant="body2" align="center">
                    TTU Platform © All rights reserved
                </Typography>
            </Box>
        </Box>
    );

    // -- Render User Management (case 7)
    const renderUserManagement = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h4">User Management</Typography>
            </Box>

            <Box sx={{ flex: 1, p: 3 }}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: '#dae8eb', color: 'black' }}>
                    <Typography variant="h5">Manage Users</Typography>
                    <Box sx={{ mt: 2 }}>
                        {availableUsers.length === 0 ? (
                            <Typography variant="body1" color="textSecondary">
                                No users available.
                            </Typography>
                        ) : (
                            availableUsers.map((user) => (
                                <Box
                                    key={user._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        mb: 2,
                                        bgcolor: '#f0f0f0',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" color="primary">
                                            {user.username}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {user.firstname} {user.lastname}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            Level: {user.level}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Button
                                            variant="contained"
                                            color={user.level === 'User' ? 'primary' : 'secondary'}
                                            onClick={() =>
                                                handleUserLevelUpdate(user._id, user.level === 'User' ? 'Admin' : 'User')
                                            }
                                        >
                                            {user.level === 'User' ? 'Promote to Admin' : 'Demote to User'}
                                        </Button>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>

            <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
                <Typography variant="body2" align="center">
                    TTU Platform © All rights reserved
                </Typography>
            </Box>
        </Box>
    );

    // -- Render Calendar and Trade Hours (case 10)
    const renderCalendarAndTradeHours = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h4">Calendar and Trade Hours</Typography>
            </Box>

            <Box sx={{ flex: 1, p: 3 }}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: '#dae8eb', color: 'black' }}>
                    <Typography variant="h5">Manage Holidays and Trade Hours</Typography>
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Calendar
                            onClickDay={handleDateClick}
                            value={date}
                            onChange={setDate}
                            tileClassName={({ date: dayDate }) =>
                                holidays[dayDate.toDateString()] ? 'holiday' : null
                            }
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add Holiday
                        </Button>
                        <TradeHoursForm tradeHours={tradeHours} onSave={handleSaveTradeHours} />
                        <HolidayModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSave={handleSaveHoliday}
                            date={selectedDate}
                        />
                        <Box sx={{ mt: 4, width: '100%' }}>
                            <Typography variant="h6">Trade Hours</Typography>
                            <ul>
                                {Object.keys(holidays).map((holidayDate) => (
                                    <li key={holidayDate} className="flex items-center gap-2">
                                        {holidayDate}: {holidays[holidayDate]}
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteHoliday(new Date(holidayDate))}
                                        >
                                            Delete
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
                <Typography variant="body2" align="center">
                    TTU Platform © All rights reserved
                </Typography>
            </Box>
        </Box>
    );





    //Render portfolio
    const renderUserPortfolio = () => {
        if (!userPortfolio) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="h4">Portfolio</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                            Loading portfolio...
                        </Typography>
                    </Box>
                </Box>
            );
        }

        console.log('User Portfolio:', userPortfolio);
        console.log('User Portfolio Stocks:', userPortfolio.stocks);

        // Calculate the total value of the stocks
        const totalStockValue = userPortfolio.stocks.reduce((total, stock) => {
            return total + (stock.shares * stock.price);
        }, 0);

        // Calculate the total account balance
        const totalAccountBalance = totalStockValue + availableFunds;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h4">Portfolio</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 3 }}>
                    <Paper elevation={3} sx={{ p: 3, bgcolor: '#dae8eb', color: 'black' }}>
                        <Typography variant="h5">Your Portfolio</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6">
                                Available Funds: ${availableFunds ? availableFunds.toFixed(2) : '0.00'}
                            </Typography>
                            <Typography variant="h6">
                                Total Account Balance: ${totalAccountBalance.toFixed(2)}
                            </Typography>
                            <Typography variant="h6">Stocks:</Typography>
                            {(!userPortfolio.stocks || userPortfolio.stocks.length === 0) ? (
                                <Typography variant="body1" color="textSecondary">
                                    No stocks in portfolio.
                                </Typography>
                            ) : (
                                userPortfolio.stocks.map((stock) => (
                                    <Box
                                        key={stock.ticker}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            bgcolor: '#f0f0f0',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" color="primary">
                                                {stock.ticker}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Shares: {stock.shares}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Current Price: ${stock.price.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Total Value: ${(stock.shares * stock.price).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Box>
                <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
                    <Typography variant="body2" align="center">
                        TTU Platform © All rights reserved
                    </Typography>
                </Box>
            </Box>
        );
    };




    const renderSearch = () => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h4">Search Stock</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 3 }}>
                    <Paper elevation={3} sx={{ p: 3, bgcolor: '#dae8eb', color: 'black' }}>
                        <Typography variant="h5">Available Stocks</Typography>
                        <Box sx={{ mt: 2 }}>
                            {availableStocks.length === 0 ? (
                                <Typography variant="body1" color="textSecondary">
                                    No stocks available.
                                </Typography>
                            ) : (
                                availableStocks.map((stock) => (
                                    <Box
                                        key={stock.ticker}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            bgcolor: '#f0f0f0',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" color="primary">
                                                {stock.ticker}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {stock.companyName}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Current Price: ${stock.price.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Low Price: ${stock.low.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                High Price: ${stock.high.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Box>
                <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
                    <Typography variant="body2" align="center">
                        TTU Platform © All rights reserved
                    </Typography>
                </Box>
            </Box>
        );
    };










  // Render Main Form (switching on profileChoice)
  const renderForm = () => {
    switch (profileChoice) {
      case 1:
        return renderBuyStocks();
      case 2:
        return renderSellStocks();
      case 3:
        return (
          <form className="flex flex-col gap-4 my-7" onSubmit={handleUserDeposit}>
            <Typography variant="h5">Deposit Funds</Typography>
            <TextField
              name="amount"
              label="Amount"
              type="number"
              variant="outlined"
              fullWidth
              required
              inputProps={{ min: 1, pattern: '[1-9][0-9]*' }}
            />
            <Button type="submit" variant="contained" color="primary">
              Deposit
            </Button>
          </form>
        );
      case 4:
        return (
          <form className="flex flex-col gap-4 my-7" onSubmit={handleUserWithdraw}>
            <Typography variant="h5">Withdraw Funds</Typography>
            <TextField
              name="amount"
              label="Amount"
              type="number"
              variant="outlined"
              fullWidth
              required
              inputProps={{ min: 1, pattern: '[1-9][0-9]*' }}
            />
            <Button type="submit" variant="contained" color="primary">
              Withdraw
            </Button>
          </form>
        );
      case 5:
            return renderSearch();
      case 6:
        return (
          <form onSubmit={handleAddStock} className="flex flex-col gap-4 my-7">
            <select
              name="ticker"
              onChange={handleTickerChange}
              required
              className="bg-slate-200 p-3 rounded-lg"
            >
              <option value="">Select a Stock</option>
              {sp500List.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.symbol} - {item.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="volume"
              placeholder="Volume"
              className="bg-slate-200 p-3 rounded-lg"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-3 rounded-lg">
              Add Stock
            </button>
            {quoteData && (
              <div className="mt-4">
                <StockCard stockData={quoteData} />
              </div>
            )}
          </form>
        );
      case 7:
            return renderUserManagement();
      case 8:
            return renderUserHistory();
      case 9:
            return renderUserPortfolio();
      case 10:
       return renderCalendarAndTradeHours();
      default:
        return null;
    }
  };

  /*
  ********************************************************************
  *  MAIN RENDER
  ********************************************************************
  */
  return (
    <div>
      <h1 className="text-3xl font-semibold text-center my-7">
        Welcome {currentUser?.firstname || 'User'}
        <p>Available Funds: ${availableFunds.toFixed(2)}</p>
      </h1>
      <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
        Sign Out
      </span>

      {/* Admin Options */}
      {currentUser.level === 'Admin' && (
        <div>
          <h2 className="text-xl font-semibold text-center my-7">Admin</h2>
          <div className="flex flex-row justify-center gap-10 bg-slate-200 p-3 rounded-lg">
            <button onClick={() => setProfileChoice(6)}>Add Stock</button>
            <button onClick={() => setProfileChoice(7)}>Change User Level</button>
            <button onClick={() => setProfileChoice(10)}>Calendar and Trade Hours</button>
          </div>
          {renderForm()}
        </div>
      )}

      {/* User Options */}
      {currentUser.level === 'User' && (
        <div>
          <div className="flex flex-row justify-center gap-10 bg-slate-200 p-3 rounded-lg">
            <button onClick={() => setProfileChoice(1)}>Buy Stock</button>
            <button onClick={() => setProfileChoice(2)}>Sell Stock</button>
            <button onClick={() => setProfileChoice(3)}>Deposit</button>
            <button onClick={() => setProfileChoice(4)}>Withdraw</button>
            <button onClick={() => setProfileChoice(5)}>Search Stock</button>
            <button onClick={() => setProfileChoice(8)}>History</button>
            <button onClick={() => setProfileChoice(9)}>Portfolio</button>
          </div>
          {renderForm()}
        </div>
      )}
    </div>
  );
}