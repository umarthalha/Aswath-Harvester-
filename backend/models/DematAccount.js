const mongoose = require('mongoose');

const dematAccountSchema = new mongoose.Schema({
  accountName: { type: String, required: [true, 'Account identity label required'], trim: true },
  brokerName: {
    type: String,
    required: true,
    enum: ['zerodha', 'groww', 'upstox', 'angelone', 'icicidirect', 'hdfcsec', 'kotaksec', 'fivepaisa', 'motilaloswal', 'sharekhan', 'other'],
    lowercase: true
  },
  colorTag: { type: String, default: '#1E293B', trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DematAccount', dematAccountSchema);
