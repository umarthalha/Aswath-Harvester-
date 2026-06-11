const { getStockData } = require('../services/marketDataService');

exports.getNiftyIndexStatus = async (req, res, next) => {
  try {
    const indexData = await getStockData('^NSEI');
    const operationalBiasTrend = indexData.currentPrice >= indexData.dma200 ? 'Bullish' : 'Bearish';
    res.status(200).json({
      symbol: 'NIFTY 50', currentPrice: indexData.currentPrice, dma200: indexData.dma200, marketStatus: operationalBiasTrend, timestamp: indexData.timestamp
    });
  } catch (error) { next(error); }
};

exports.getStockAnalysisMetrics = async (req, res, next) => {
  try {
    const [stockMetrics, benchmarkNiftyMetrics] = await Promise.all([
      getStockData(req.params.symbol), getStockData('^NSEI')
    ]);
    const finalRelativeStrengthScore = parseFloat((stockMetrics.performanceSixMonths / benchmarkNiftyMetrics.performanceSixMonths).toFixed(3));
    res.status(200).json({
      symbol: stockMetrics.symbol, currentPrice: stockMetrics.currentPrice, dma200: stockMetrics.dma200,
      fiftyTwoWeekHigh: stockMetrics.fiftyTwoWeekHigh, fiftyTwoWeekLow: stockMetrics.fiftyTwoWeekLow,
      performanceSixMonths: stockMetrics.performanceSixMonths, relativeStrengthVsNifty: finalRelativeStrengthScore,
      relativeStrengthStatus: finalRelativeStrengthScore > 1.0 ? 'Outperforming (Bullish RS)' : 'Underperforming (Bearish RS)',
      timestamp: stockMetrics.timestamp
    });
  } catch (error) { next(error); }
};
