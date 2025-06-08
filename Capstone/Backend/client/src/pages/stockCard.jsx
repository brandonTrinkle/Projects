// StockCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StockCard = ({ stockData }) => {
  if (!stockData) return null;

    // Destructure values
    const { ticker, price, high, low, trend } = stockData;

    return (
        <Card sx={{ maxWidth: 400, margin: '20px auto', boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {ticker}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                Current Price: ${price != null ? price.toFixed(2) : 'N/A'}
              </Typography>
              <Typography variant="body1">
                Daily High: ${high != null ? high.toFixed(2) : 'N/A'}
              </Typography>
              <Typography variant="body1">
                Daily Low: ${low != null ? low.toFixed(2) : 'N/A'}
              </Typography>
              {trend && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: trend === 'Up' ? 'green' : 'red' }}
                >
                  Trend: {trend}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    };
StockCard.propTypes = {
  stockData: PropTypes.shape({
    ticker: PropTypes.string.isRequired,
    companyName: PropTypes.string,
    price: PropTypes.number.isRequired,
    high: PropTypes.number,
    low: PropTypes.number,
    trend: PropTypes.string,
  }).isRequired,
};

export default StockCard;