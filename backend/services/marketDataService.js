const axios = require('axios');

const cache = {};
const CACHE_DURATION_MS = 15 * 60 * 1000;

const getStockData = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase().replace('.NS', '');
  const yahooSymbol = cleanSymbol === '^NSEI' ? '^NSEI' : `${cleanSymbol}.NS`;
  
  const now = Date.now();
  if (cache[yahooSymbol] && (now - cache[yahooSymbol].timestamp < CACHE_DURATION_MS)) {
    return cache[yahooSymbol].data;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1y&interval=1d`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const result = response.data.chart.result[0];
    const indicators = result.indicators.quote[0];
    const closes = indicators.close.filter(price => price !== null);
    const highs = indicators.high.filter(h => h !== null);
    const lows = indicators.low.filter(l => l !== null);

    const currentPrice = result.meta.regularMarketPrice || closes[closes.length - 1];

    let dma200 = null;
    if (closes.length >= 200) {
      const last200Days = closes.slice(-200);
      dma200 = parseFloat((last200Days.reduce((acc, val) => acc + val, 0) / 200).toFixed(2));
    } else if (closes.length > 0) {
      dma200 = parseFloat((closes.reduce((acc, val) => acc + val, 0) / closes.length).toFixed(2));
    }

    const fiftyTwoWeekHigh = parseFloat(Math.max(...highs).toFixed(2));
    const fiftyTwoWeekLow = parseFloat(Math.min(...lows).toFixed(2));

    const totalDaysAvailable = closes.length;
    const sixMonthsAgoIndex = Math.max(0, totalDaysAvailable - 126);
    const priceSixMonthsAgo = closes[sixMonthsAgoIndex];
    const performanceSixMonths = parseFloat((((currentPrice - priceSixMonthsAgo) / priceSixMonthsAgo) * 100).toFixed(2));

    const processedData = {
      symbol: cleanSymbol,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      dma200,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      performanceSixMonths,
      timestamp: result.meta.regularMarketTime * 1000
    };

    cache[yahooSymbol] = { timestamp: now, data: processedData };
    return processedData;
  } catch (error) {
    console.error(`Error querying Yahoo Finance API for token: ${yahooSymbol}`, error.message);
    throw new Error(`Could not recover live market pricing metrics for: ${yahooSymbol}`);
  }
};

module.exports = { getStockData };
