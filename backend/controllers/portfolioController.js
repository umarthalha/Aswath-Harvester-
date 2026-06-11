const Portfolio = require('../models/Portfolio');
const { getStockData } = require('../services/marketDataService');

exports.getAllPositions = async (req, res, next) => {
  try {
    const positions = await Portfolio.find().sort({ buyDate: -1 });
    res.status(200).json(positions);
  } catch (error) { next(error); }
};

exports.addPosition = async (req, res, next) => {
  try {
    const { symbol, companyName, layerNumber, buyPrice, quantity, stopLoss, targetPrice, notes, buyDate } = req.body;
    if (!stopLoss) return res.status(400).json({ error: 'Risk Management Rule: Stop Loss is mandatory' });

    const calculatedInvestedAmount = buyPrice * quantity;
    const systemWarnings = [];

    const activeUniqueSymbols = await Portfolio.distinct('symbol', { status: 'active' });
    if (activeUniqueSymbols.length >= 7 && !activeUniqueSymbols.includes(symbol.toUpperCase())) {
      systemWarnings.push('Alpha Risk Warning: Exposure exceeds structural boundary constraint profile (Max 7 Active Stocks rule breached).');
    }

    const executionSiblings = await Portfolio.find({ symbol: symbol.toUpperCase(), status: 'active' });
    const layer1Asset = executionSiblings.find(s => s.layerNumber === 1);
    
    if (layerNumber === 2 && layer1Asset) {
      const varianceRatio = calculatedInvestedAmount / layer1Asset.investedAmount;
      if (varianceRatio < 1.2 || varianceRatio > 1.45) {
        systemWarnings.push('Allocation structural warning: Layer 2 target positioning sizing deviation detected from standard 3:4:3 ratio.');
      }
    } else if (layerNumber === 3 && layer1Asset) {
      const varianceRatio = calculatedInvestedAmount / layer1Asset.investedAmount;
      if (varianceRatio < 0.9 || varianceRatio > 1.1) {
        systemWarnings.push('Allocation structural warning: Layer 3 target deployment sizing variant skew detected relative to base deployment.');
      }
    }

    const newPosition = new Portfolio({
      symbol: symbol.toUpperCase(), companyName, layerNumber, buyPrice, quantity,
      investedAmount: calculatedInvestedAmount, stopLoss, targetPrice, notes, buyDate, status: 'active'
    });

    const savedPosition = await newPosition.save();
    res.status(201).json({ position: savedPosition, warnings: systemWarnings.length > 0 ? systemWarnings : null });
  } catch (error) { next(error); }
};

exports.updatePosition = async (req, res, next) => {
  try {
    const { status, exitPrice, exitDate, notes, targetPrice, stopLoss, quantity, buyPrice } = req.body;
    const position = await Portfolio.findById(req.params.id);
    if (!position) return res.status(404).json({ error: 'Target position tracking node not located' });

    if (buyPrice !== undefined) position.buyPrice = buyPrice;
    if (quantity !== undefined) {
      position.quantity = quantity;
      position.investedAmount = position.buyPrice * position.quantity;
    }
    if (targetPrice !== undefined) position.targetPrice = targetPrice;
    if (stopLoss !== undefined) position.stopLoss = stopLoss;
    if (notes !== undefined) position.notes = notes;
    if (status !== undefined) position.status = status;

    if (status === 'exited' || status === 'partial-exit') {
      if (!exitPrice) return res.status(400).json({ error: 'Exit computational parameter tracking requires clear valuation target mapping price points.' });
      position.exitPrice = exitPrice;
      position.exitDate = exitDate || new Date();
      position.profitLoss = parseFloat(((exitPrice * position.quantity) - position.investedAmount).toFixed(2));
    } else {
      position.exitPrice = undefined;
      position.exitDate = undefined;
      position.profitLoss = 0;
    }

    const updatedPosition = await position.save();
    res.status(200).json(updatedPosition);
  } catch (error) { next(error); }
};

exports.deletePosition = async (req, res, next) => {
  try {
    const deletedPosition = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deletedPosition) return res.status(404).json({ error: 'Position target identification missing.' });
    res.status(200).json({ message: 'Position asset record destroyed successfully' });
  } catch (error) { next(error); }
};

exports.getPortfolioSummary = async (req, res, next) => {
  try {
    const activePositions = await Portfolio.find({ status: { $in: ['active', 'partial-exit'] } });
    let totalInvested = 0, currentTotalValue = 0;
    const sectorDistributionMap = {};

    for (const position of activePositions) {
      totalInvested += position.investedAmount;
      let assetLiveValuationPrice = position.buyPrice; 
      try {
        const liveMarketTick = await getStockData(position.symbol);
        assetLiveValuationPrice = liveMarketTick.currentPrice;
      } catch (err) { console.warn(`Fallback validation routing executed for tracker: ${position.symbol}`); }

      const positionCurrentValue = assetLiveValuationPrice * position.quantity;
      currentTotalValue += positionCurrentValue;

      const sectorTag = position.companyName || 'Unassigned Sector';
      sectorDistributionMap[sectorTag] = (sectorDistributionMap[sectorTag] || 0) + positionCurrentValue;
    }

    const absoluteProfitLoss = parseFloat((currentTotalValue - totalInvested).toFixed(2));
    const profitLossPercentage = totalInvested > 0 ? parseFloat(((absoluteProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

    res.status(200).json({
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentTotalValue.toFixed(2)),
      overallProfitLoss: absoluteProfitLoss,
      overallProfitLossPercentage: profitLossPercentage,
      sectorBreakdown: sectorDistributionMap
    });
  } catch (error) { next(error); }
};
