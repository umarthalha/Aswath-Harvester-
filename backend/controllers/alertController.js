const PriceAlert = require('../models/PriceAlert');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find().sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) { next(error); }
};

exports.createAlert = async (req, res, next) => {
  try {
    const alert = new PriceAlert({
      ...req.body,
      symbol: req.body.symbol.toUpperCase()
    });
    const saved = await alert.save();
    res.status(201).json(saved);
  } catch (error) { next(error); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const target = await PriceAlert.findByIdAndDelete(req.params.id);
    if (!target) return res.status(404).json({ error: 'Target trigger identification item missing' });
    res.status(200).json({ message: 'Target checkpoint verification alert tracking destroyed successfully.' });
  } catch (error) { next(error); }
};
