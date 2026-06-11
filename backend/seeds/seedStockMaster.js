const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const StockMaster = require('../models/StockMaster');
const marketUniverse = require('./dataMarketUniverse');

const seedUniverseDatabasePipeline = async () => {
  try {
    console.log('Connecting to MongoDB Atlas Cluster Node...');
    await connectDB();

    const totalRecordsToProcess = marketUniverse.length;
    console.log(`Located ${totalRecordsToProcess} structural universe items in memory buffer. Executing Upsert pipeline...`);

    const batchWriteOperations = marketUniverse.map((stock, index) => {
      if ((index + 1) % 25 === 0 || index + 1 === totalRecordsToProcess) {
        console.log(`Seeding stock mapping queue: ${index + 1}/${totalRecordsToProcess}...`);
      }

      return {
        updateOne: {
          filter: { symbol: stock.symbol.toUpperCase() },
          update: {
            $set: {
              companyName: stock.companyName,
              sector: stock.sector,
              marketCap: stock.marketCap,
              indices: stock.indices,
              roce: stock.roce,
              roe: stock.roe,
              debtToEquity: stock.debtToEquity,
              salesGrowth3Y: stock.salesGrowth3Y,
              profitGrowth3Y: stock.profitGrowth3Y,
              pe: stock.pe,
              isASM: false,
              isGSM: false,
              promoterPledge: 0,
              weeklyTrend: "neutral",
              dailyTrend: "neutral",
              checklistScore: 0,
              lastUpdated: new Date()
            }
          },
          upsert: true
        }
      };
    });

    console.log('Sending atomic batch command to remote collection storage matrices...');
    const executionSummary = await StockMaster.bulkWrite(batchWriteOperations);
    
    console.log('\n==================================================');
    console.log(`  🎉 Successfully seeded ${executionSummary.upsertedCount + executionSummary.matchedCount} stocks!`);
    console.log(`  Matched Records Checked: ${executionSummary.matchedCount}`);
    console.log(`  New Ingress Insertions (Upserts): ${executionSummary.upsertedCount}`);
    console.log(`  Modified Properties: ${executionSummary.modifiedCount}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Critical Fail during batch seeding deployment routine:', error.message);
    process.exit(1);
  }
};

seedUniverseDatabasePipeline();
