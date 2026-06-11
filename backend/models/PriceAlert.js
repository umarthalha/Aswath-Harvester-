const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'DematAccount', required: true },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  alertType: { type: String, enum: ['target', 'stoploss', 'custom'], required: true },
  targetPrice: { type: Number, required: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
