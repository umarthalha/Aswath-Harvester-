const mongoose = require('mongoose');

const compoundingLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  profitBooked: { type: Number, required: true, default: 0 },
  amountReinvested: { type: Number, required: true, default: 0 },
  amountWithdrawn: { type: Number, required: true, default: 0 },
  notes: { type: String, trim: true },
  totalPortfolioValue: { type: Number, required: true }
});

module.exports = mongoose.model('CompoundingLog', compoundingLogSchema);
