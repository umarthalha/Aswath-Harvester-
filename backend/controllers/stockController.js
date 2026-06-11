const Stock = require('../models/Stock');
const { getStockData } = require('../services/marketDataService');

exports.getAllWatchlist = async (req, res, next) => {
  try {
    const stocks = await Stock.find().sort({ addedToWatchlist: -1 });
    res.status(200).json(stocks);
  } catch (error) { next(error); }
};

exports.addToWatchlist = async (req, res, next) => {
  try {
    const { symbol, companyName, sector, checklistData, notes } = req.body;
    if(!symbol) return res.status(400).json({ error: 'Valid ticker symbol required' });

    let score = 0;
    if (checklistData && typeof checklistData === 'object') {
      score = Object.values(checklistData).filter(Boolean).length;
    }

    const newStock = new Stock({
      symbol: symbol.toUpperCase(), companyName, sector, checklistScore: score, checklistData, notes
    });
    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (error) { next(error); }
};

exports.updateChecklistScore = async (req, res, next) => {
  try {
    const { checklistData, notes, companyName, sector } = req.body;
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ error: 'Watchlist entry missing' });

    if (checklistData && typeof checklistData === 'object') {
      stock.checklistData = checklistData;
      stock.checklistScore = Object.values(checklistData).filter(Boolean).length;
    }
    if (notes !== undefined) stock.notes = notes;
    if (companyName !== undefined) stock.companyName = companyName;
    if (sector !== undefined) stock.sector = sector;

    const updatedStock = await stock.save();
    res.status(200).json(updatedStock);
  } catch (error) { next(error); }
};

exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);
    if (!deletedStock) return res.status(404).json({ error: 'Watchlist record lookup failed' });
    res.status(200).json({ message: 'Stock removed from watchlist successfully' });
  } catch (error) { next(error); }
};

exports.getLiveStockPrice = async (req, res, next) => {
  try {
    const marketMetrics = await getStockData(req.params.symbol);
    res.status(200).json({ symbol: marketMetrics.symbol, currentPrice: marketMetrics.currentPrice });
  } catch (error) { next(error); }
};
