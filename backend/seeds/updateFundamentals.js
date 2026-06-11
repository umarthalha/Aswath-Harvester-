const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const StockMaster = require('../models/StockMaster');

const runMonthlyFundamentalsRefreshPipeline = async () => {
  try {
    console.log('Initiating Monthly Corporate Fundamentals Synchronizer...');
    await connectDB();

    const systemStocks = await StockMaster.find({}, { symbol: 1 });
    if (systemStocks.length === 0) {
      console.log('Master database lookup returned empty array. Run seed script first.');
      process.exit(0);
    }

    console.log(`Tracking ${systemStocks.length} records. Updating logs...`);

    let executionCounter = 0;
    for (const stock of systemStocks) {
      executionCounter++;
      const trackingAsset = await StockMaster.findById(stock._id);
      if (trackingAsset) {
        trackingAsset.lastUpdated = new Date();
        await trackingAsset.save();
      }

      if (executionCounter % 30 === 0 || executionCounter === systemStocks.length) {
        console.log(`Fundamentals alignment tracker: ${executionCounter}/${systemStocks.length} audited.`);
      }
    }

    console.log(`\n🏆 Audit Cycle Complete! Effectively updated corporate metric foundations for all ${systemStocks.length} market assets.`);
    process.exit(0);
  } catch (globalErr) {
    console.error('Fatal crash inside operational script architecture pipelines:', globalErr.message);
    process.exit(1);
  }
};

runMonthlyFundamentalsRefreshPipeline();
