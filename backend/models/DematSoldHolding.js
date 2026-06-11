const mongoose = require('mongoose');

const dematSoldHoldingSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'DematAccount', required: true },
  symbol: { type: String, required: true, uppercase: true },
  companyName: { type: String },
  buyDate: { type: Date, required: true },
  buyPrice: { type: Number, required: true },
  sellDate: { type: Date, required: true, default: Date.now },
  sellPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  investedAmount: { type: Number, required: true },
  saleAmount: { type: Number, required: true },
  profitLoss: { type: Number, required: true },
  profitLossPercent: { type: Number, required: true },
  holdingDays: { type: Number, required: true },
  taxType: { type: String, enum: ['STCG', 'LTCG'], required: true },
  approximateTax: { type: Number, required: true, default: 0 },
  netProfit: { type: Number, required: true },
  disclaimer: { type: String, default: 'Approximate calculation. Consult CA for exact tax filing.' }
});

module.exports = mongoose.model('DematSoldHolding', dematSoldHoldingSchema);
