const mongoose = require('mongoose');

const dematHoldingSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'DematAccount', required: true },
  symbol: { type: String, required: [true, 'Equity ticker identifier required'], uppercase: true, trim: true },
  companyName: { type: String, trim: true },
  exchange: { type: String, enum: ['NSE', 'BSE'], default: 'NSE' },
  tradeType: { type: String, enum: ['delivery', 'intraday', 'sip'], default: 'delivery' },
  buyDate: { type: Date, required: true },
  buyPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  investedAmount: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  profitLoss: { type: Number, default: 0 },
  profitLossPercent: { type: Number, default: 0 },
  stopLoss: { type: Number },
  targetPrice: { type: Number },
  linkedPortfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  lastPriceUpdate: { type: Date, default: Date.now }
});

dematHoldingSchema.pre('validate', function(next) {
  if (this.buyPrice && this.quantity) {
    this.investedAmount = parseFloat((this.buyPrice * this.quantity).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('DematHolding', dematHoldingSchema);
