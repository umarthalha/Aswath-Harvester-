const CompoundingLog = require('../models/CompoundingLog');

exports.getAllLogs = async (req, res, next) => {
  try {
    const logs = await CompoundingLog.find().sort({ date: 1 });
    res.status(200).json(logs);
  } catch (error) { next(error); }
};

exports.addLogEntry = async (req, res, next) => {
  try {
    const newLog = new CompoundingLog(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) { next(error); }
};

exports.getCompoundingStats = async (req, res, next) => {
  try {
    const logs = await CompoundingLog.find().sort({ date: 1 });
    const totalReinvested = logs.reduce((sum, item) => sum + (item.amountReinvested || 0), 0);
    const totalWithdrawn = logs.reduce((sum, item) => sum + (item.amountWithdrawn || 0), 0);
    const growthChartData = logs.map(item => ({
      date: item.date, portfolioValue: item.totalPortfolioValue, profitBooked: item.profitBooked
    }));
    res.status(200).json({ totalReinvested, totalWithdrawn, growthChartData });
  } catch (error) { next(error); }
};
