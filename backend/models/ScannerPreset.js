const mongoose = require('mongoose');

const scannerPresetSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Preset scan template configuration identity name required'], trim: true },
  filters: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScannerPreset', scannerPresetSchema);
