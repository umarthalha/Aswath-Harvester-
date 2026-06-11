const mongoose = require('mongoose');

const stockMasterSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
  companyName: { type: String, trim: true },
  sector: { type: String, trim: true },
  marketCap: { type: String, enum: ['largecap', 'midcap', 'smallcap', 'microcap'], required: true },
  indices: [{ type: String, trim: true }],
  isASM: { type: Boolean, default: false },
  isGSM: { type: Boolean, default: false },
  promoterPledge: { type: Number, default: 0 },
  roce: { type: Number, default: 0 },
  roe: { type: Number, default: 0 },
  debtToEquity: { type: Number, default: 0 },
  salesGrowth3Y: { type: Number, default: 0 },
  profitGrowth3Y: { type: Number, default: 0 },
  pe: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  ma200: { type: Number, default: 0 },
  rsVsNifty: { type: Number, default: 0 },
  weeklyTrend: { type: String, enum: ['bullish', 'bearish', 'neutral'], default: 'neutral' },
  dailyTrend: { type: String, enum: ['bullish', 'bearish', 'neutral'], default: 'neutral' },
  checklistScore: { type: Number, min: 0, max: 13, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockMaster', stockMasterSchema);
