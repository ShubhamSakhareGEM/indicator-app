
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const axios =require('axios');
const app=express();

// --- Caching strategy-
const cache = {};
const CACHE_TTL = 120 * 1000;


app.get('/api/data', async (req, res) => {
  const symbol=req.query.symbol; // e.g.,'SPY' or'QQQ'
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  const now=Date.now();

  // --- 1. check cache --
  if (cache[symbol] && (now - cache[symbol].timestamp < CACHE_TTL)) {
    console.log(`Serving from cache for: ${symbol}`);
    return res.json(cache[symbol].data);
  }

  // --- 2. cache miss or stale - fetch from API ---
  console.log(`Fetching new data from API for: ${symbol}`);
  try {
    const url= `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.API_KEY}&outputsize=compact`;
    
    const response=await axios.get(url);

    if (response.data["Note"]) {
      throw new Error('Alpha Vantage API limit reached. Try again later.');
    }
    if (!response.data["Time Series (Daily)"]) {
        throw new Error('Invalid symbol or no data found.');
    }

    // --- 3. Parse and format data ---
    const timeSeries = response.data["Time Series (Daily)"];
    
    const dates=Object.keys(timeSeries).slice(0, 30).reverse(); 
    const prices=dates.map(date => {
      return timeSeries[date]["4. close"]; 
    });

    const formattedData = {
      symbol: response.data["Meta Data"]["2. Symbol"],
      labels: dates, // X-axis
      values: prices, // Y-axis
    };

    // --- 4. Update cache ---
    cache[symbol] = {
      timestamp: now,
      data: formattedData,
    };

    // --- 5. send response -
    res.json(formattedData);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;