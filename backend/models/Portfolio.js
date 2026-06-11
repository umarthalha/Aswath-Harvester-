const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true
  },
  companyName: { type: String, trim: true },
  layerNumber: { type: Number, required: true, enum: [1, 2, 3] },
  buyPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  investedAmount: { type: Number, required: true },
  buyDate: { type: Date, default: Date.now },
  stopLoss: { type: Number, required: [true, 'Stop Loss is mandatory for systemic risk coverage.'] },
  targetPrice: { type: Number },
  status: { type: String, enum: ['active', 'partial-exit', 'exited'], default: 'active' },
  exitPrice: { type: Number },
  exitDate: { type: Date },
  profitLoss: { type: Number, default: 0 },
  notes: { type: String, trim: true }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
