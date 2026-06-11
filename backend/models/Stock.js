const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,
    trim: true
  },
  companyName: { type: String, trim: true },
  sector: { type: String, trim: true },
  checklistScore: { type: Number, min: 0, max: 13, default: 0 },
  checklistData: { type: Map, of: Boolean, default: {} },
  addedToWatchlist: { type: Date, default: Date.now },
  notes: { type: String, trim: true }
});

module.exports = mongoose.model('Stock', stockSchema);
