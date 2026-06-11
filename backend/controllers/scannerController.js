const StockMaster = require('../models/StockMaster');
const ScannerPreset = require('../models/ScannerPreset');

exports.scanStocks = async (req, res, next) => {
  try {
    const {
      index, marketCap, sector, minRS, maxRS, above200DMA, weeklyTrend, minChecklistScore,
      minROCE, minROE, maxDE, minSalesGrowth, minProfitGrowth, maxPE, excludeASM, excludePledge,
      minPrice, sortBy, sortOrder, page, limit
    } = req.query;

    const mongoQuery = {};

    if (index) {
      mongoQuery.indices = { $in: index.split(',').map(i => i.trim()) };
    }
    if (marketCap) {
      mongoQuery.marketCap = marketCap.toLowerCase();
    }
    if (sector) {
      mongoQuery.sector = { $in: sector.split(',').map(s => s.trim()) };
    }
    if (minRS || maxRS) {
      mongoQuery.rsVsNifty = {};
      if (minRS) mongoQuery.rsVsNifty.$gte = parseFloat(minRS);
      if (maxRS) mongoQuery.rsVsNifty.$lte = parseFloat(maxRS);
    }
    if (above200DMA !== undefined) {
      if (above200DMA === 'true') {
        mongoQuery.$expr = { $gte: ['$currentPrice', '$ma200'] };
      } else if (above200DMA === 'false') {
        mongoQuery.$expr = { $lt: ['$currentPrice', '$ma200'] };
      }
    }
    if (weeklyTrend) mongoQuery.weeklyTrend = weeklyTrend.toLowerCase();
    if (minChecklistScore) mongoQuery.checklistScore = { $gte: parseInt(minChecklistScore) };
    if (minROCE) mongoQuery.roce = { $gte: parseFloat(minROCE) };
    if (minROE) mongoQuery.roe = { $gte: parseFloat(minROE) };
    if (maxDE) mongoQuery.debtToEquity = { $lte: parseFloat(maxDE) };
    if (minSalesGrowth) mongoQuery.salesGrowth3Y = { $gte: parseFloat(minSalesGrowth) };
    if (minProfitGrowth) mongoQuery.profitGrowth3Y = { $gte: parseFloat(minProfitGrowth) };
    if (maxPE) mongoQuery.pe = { $lte: parseFloat(maxPE) };

    if (excludeASM === 'true') mongoQuery.isASM = false;
    if (excludePledge === 'true') mongoQuery.promoterPledge = 0;

    if (minPrice) {
      mongoQuery.currentPrice = { $gte: parseFloat(minPrice) };
    }

    const activePage = parseInt(page) || 1;
    const itemsLimit = parseInt(limit) || 25;
    const recordsSkipIndex = (activePage - 1) * itemsLimit;

    const sortingCriteriaField = sortBy || 'rsVsNifty';
    const sortingDirectionIndex = sortOrder === 'asc' ? 1 : -1;
    const sortParams = { [sortingCriteriaField]: sortingDirectionIndex };

    const [stocks, aggregateTotalCount] = await Promise.all([
      StockMaster.find(mongoQuery).sort(sortParams).skip(recordsSkipIndex).limit(itemsLimit),
      StockMaster.countDocuments(mongoQuery)
    ]);

    res.status(200).json({
      meta: {
        totalRecords: aggregateTotalCount,
        currentPage: activePage,
        itemsLimit,
        totalPages: Math.ceil(aggregateTotalCount / itemsLimit)
      },
      data: stocks
    });
  } catch (error) { next(error); }
};

exports.getSavedPresets = async (req, res, next) => {
  try {
    const presets = await ScannerPreset.find().sort({ createdAt: -1 });
    res.status(200).json(presets);
  } catch (error) { next(error); }
};

exports.savePreset = async (req, res, next) => {
  try {
    const { name, filters } = req.body;
    if (!name || !filters) return res.status(400).json({ error: 'Name and analytical configurations required' });
    
    const presetNode = new ScannerPreset({ name, filters });
    const savedNode = await presetNode.save();
    res.status(201).json(savedNode);
  } catch (error) { next(error); }
};

exports.deletePreset = async (req, res, next) => {
  try {
    const targetPreset = await ScannerPreset.findByIdAndDelete(req.params.id);
    if (!targetPreset) return res.status(404).json({ error: 'Preset allocation mismatch.' });
    res.status(200).json({ message: 'Filter preset erased successfully' });
  } catch (error) { next(error); }
};
