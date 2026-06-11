const cron = require('node-cron');
const StockMaster = require('../models/StockMaster');
const { getStockData } = require('../services/marketDataService');

cron.schedule('0 9 * * *', async () => {
  console.log('Automated Market Data Refresh Engine Initiated at 09:00 AM IST.');
  try {
    const trackingLedgerArr = await StockMaster.find();
    if (trackingLedgerArr.length === 0) return;

    let benchmarkNiftyMetrics;
    try {
      benchmarkNiftyMetrics = await getStockData('^NSEI');
    } catch (err) {
      console.error('Critical Fail: Could not fetch Nifty 50 base index metrics.', err.message);
      return;
    }

    for (const asset of trackingLedgerArr) {
      try {
        const freshMetrics = await getStockData(asset.symbol);
        const updatedRSValue = parseFloat((freshMetrics.performanceSixMonths / benchmarkNiftyMetrics.performanceSixMonths).toFixed(3));

        asset.currentPrice = freshMetrics.currentPrice;
        asset.ma200 = freshMetrics.dma200 || asset.ma200;
        asset.rsVsNifty = updatedRSValue;
        asset.lastUpdated = new Date();

        await asset.save();
      } catch (assetErr) { }
    }
    console.log('Automated Core Market Sync Job Complete.');
  } catch (globalErr) {
    console.error('Exception inside Cron engine framework scheduling runtime pipelines:', globalErr.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});
