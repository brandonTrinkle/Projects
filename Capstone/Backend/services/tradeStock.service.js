import Portfolio from '../Models/portfolio.model.js';
import Stock from '../models/stocks.model.js';
import History from '../Models/history.model.js';  // Make sure this path is correct


/**
 * ================================================
 *              PROCESS STOCK SALE
 * ================================================
 *
 * This function processes a stock sale by:
 * 1. Retrieving the user's portfolio and verifying stock ownership.
 * 2. Getting the current stock price from the stocks collection.
 * 3. Calculating the weighted average purchase price from buy histories.
 * 4. Determining sale proceeds, profit (or loss), and deal quality.
 * 5. Updating the portfolio by reducing the user's shares and increasing available funds.
 * 6. Update stock volume: deposit the sold shares back into the stocks database.
 * 7. Record the sale in history.
 */

export const processStockSale = async (userId, ticker, sharesToSell) => {
  const sharesToSellNum = Number(sharesToSell);

  // 1. Retrieve user's portfolio and verify ownership.
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
      throw new Error('Portfolio not found');
  }
  const stockHolding = portfolio.stocks.find(stock => stock.ticker === ticker);
  if (!stockHolding || stockHolding.shares < sharesToSellNum) {
      throw new Error('Insufficient shares to sell');
  }

  // 2. Retrieve current stock price.
  const stockData = await Stock.findOne({ ticker: ticker.toUpperCase() });
  if (!stockData) {
      throw new Error('Stock data not found');
  }
  const currentPrice = stockData.price;
  console.log(`DEBUG: Current Market Price for ${ticker}: ${currentPrice}`);

  // 3. Retrieve buy transactions and calculate cost basis using FIFO.
  const buyHistories = await History.find({ 
      userId, 
      stockTicker: ticker, 
      transactionType: 'buy' 
  }).sort({ createdAt: 1 });

  if (!buyHistories.length) {
      throw new Error('No purchase history found for this stock');
  }

  let totalSharesBought = 0;
  let totalCost = 0;
  let sharesToDeduct = sharesToSellNum;

  for (const h of buyHistories) {
      if (sharesToDeduct <= 0) break;

      const sharesUsed = Math.min(sharesToDeduct, h.shares);
      totalSharesBought += sharesUsed;
      totalCost += sharesUsed * h.price;

      h.shares -= sharesUsed;
      await h.save();

      sharesToDeduct -= sharesUsed;
  }

  if (totalSharesBought === 0) {
      throw new Error('Error calculating cost basis');
  }

  const averagePurchasePrice = totalCost / totalSharesBought;

  // 4. Calculate sale proceeds, cost basis, profit/loss.
  const saleProceeds = sharesToSellNum * currentPrice;
  console.log(`DEBUG: Current Price for ${ticker}: ${currentPrice}`);
  console.log(`DEBUG: Sale Proceeds Calculation: ${sharesToSellNum} * ${currentPrice} = ${saleProceeds}`);
  const costBasis = sharesToSellNum * averagePurchasePrice;
  const profit = (currentPrice - averagePurchasePrice) * sharesToSellNum;
  console.log(`DEBUG: Cost Basis Calculation: ${sharesToSellNum} * ${averagePurchasePrice} = ${costBasis}`);

  const deal = profit > 0 ? 'good deal' : profit < 0 ? 'bad deal' : 'break-even';

  // Logs for Debugging 
  console.log(`DEBUG: Selling at market price!`);
  console.log(`DEBUG: Market Price Per Share: ${currentPrice}`);
  console.log(`DEBUG: Cost Basis Per Share: ${averagePurchasePrice}`);
  console.log(`DEBUG: Sale Proceeds (${sharesToSellNum} * ${currentPrice}): ${saleProceeds}`);
  console.log(`DEBUG: Profit Calculation [(${currentPrice} - ${averagePurchasePrice}) * ${sharesToSellNum}]: ${profit}`);
  

  // 5. Update portfolio
  stockHolding.shares -= sharesToSellNum;
  if (stockHolding.shares === 0) {
      portfolio.stocks = portfolio.stocks.filter(stock => stock.ticker !== ticker);
  }
  portfolio.availableFunds += saleProceeds;
  await portfolio.save();
  console.log(`DEBUG: Available Funds AFTER: ${portfolio.availableFunds}`);

  // 6. Update stock volume
  stockData.volume += sharesToSellNum;
  await stockData.save();

  // 7. Record sale in history
  const saleHistory = new History({
      userId,
      stockTicker: ticker,
      shares: sharesToSellNum,
      price: currentPrice,
      totalCost: costBasis,
      transactionType: 'sell',
      createdAt: new Date()
  });
  await saleHistory.save();

  return {
      ticker,
      sharesSold: sharesToSellNum,
      currentPrice,
      saleProceeds,
      averagePurchasePrice,
      profit,
      deal,
      availableFunds: portfolio.availableFunds
  };
};

/**
 * ================================================
 *           PROCESS STOCK PURCHASE
 * ================================================
 *
 * This function processes a stock purchase by:
 * 1. Retrieving the user's portfolio.
 * 2. Getting current stock data.
 * 3. Calculating total cost and validating available funds.
 * 4. Updating the portfolio with the new stock purchase.
 * 5. Recording the purchase in the history collection.
 */
export const processStockPurchase = async (userId, ticker, shares, price, companyName) => {
  try {
      const portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) {
          throw new Error('Portfolio not found.');
      }

      const stock = await Stock.findOne({ ticker });
      if (!stock) {
          throw new Error('Stock not found.');
      }

      const stockPrice = price || stock.price;
      const totalCost = stockPrice * shares;

      if (portfolio.availableFunds < totalCost) {
          throw new Error('Not enough available funds.');
      }

      portfolio.availableFunds -= totalCost;

      let existingStock = portfolio.stocks.find(s => s.ticker === ticker);
      if (existingStock) {
          existingStock.shares += shares;
      } else {
          portfolio.stocks.push({ 
              ticker, 
              shares, 
              price: stockPrice, 
              companyName: stock.companyName 
          });
      }
      portfolio.markModified('stocks');
      await portfolio.save();
      console.log(`DEBUG: Available Funds AFTER: ${portfolio.availableFunds}`);

      const newHistory = new History({
          userId,
          stockTicker: ticker,
          shares,
          price: stockPrice,
          totalCost: totalCost, 
          transactionType: 'buy',
          createdAt: new Date()
      });
      await newHistory.save();

      return { message: 'Stock purchase successful', portfolio };
  } catch (error) {
      console.error('Error processing stock purchase:', error.message);
      throw new Error(error.message);
  }
};