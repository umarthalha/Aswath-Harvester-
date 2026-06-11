const DematAccount = require('../models/DematAccount');
const DematHolding = require('../models/DematHolding');
const DematSoldHolding = require('../models/DematSoldHolding');
const { getStockData } = require('../services/marketDataService');

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await DematAccount.find().sort({ accountName: 1 });
    res.status(200).json(accounts);
  } catch (error) { next(error); }
};

exports.createAccount = async (req, res, next) => {
  try {
    const account = new DematAccount(req.body);
    const saved = await account.save();
    res.status(201).json(saved);
  } catch (error) { next(error); }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const updated = await DematAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Target Demat profile missing' });
    res.status(200).json(updated);
  } catch (error) { next(error); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const target = await DematAccount.findByIdAndDelete(req.params.id);
    if (!target) return res.status(404).json({ error: 'Target Demat identity trace void' });
    await DematHolding.deleteMany({ accountId: req.params.id });
    res.status(200).json({ message: 'Demat workspace entity clean exit completed' });
  } catch (error) { next(error); }
};

exports.getHoldings = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.accountId) filter.accountId = req.query.accountId;
    const positions = await DematHolding.find(filter).populate('accountId', 'accountName brokerName');
    res.status(200).json(positions);
  } catch (error) { next(error); }
};

exports.addHolding = async (req, res, next) => {
  try {
    const rawData = req.body;
    let liveMarketPrice = rawData.buyPrice;
    
    try {
      const realTimeTick = await getStockData(rawData.symbol);
      liveMarketPrice = realTimeTick.currentPrice;
    } catch (err) { console.warn(`Fallback live valuation placeholder bound for token: ${rawData.symbol}`); }

    const holding = new DematHolding({
      ...rawData,
      currentPrice: liveMarketPrice,
      currentValue: liveMarketPrice * rawData.quantity
    });

    holding.profitLoss = parseFloat((holding.currentValue - holding.investedAmount).toFixed(2));
    holding.profitLossPercent = holding.investedAmount > 0 ? parseFloat(((holding.profitLoss / holding.investedAmount) * 100).toFixed(2)) : 0;

    const saved = await holding.save();
    res.status(201).json(saved);
  } catch (error) { next(error); }
};

exports.updateHolding = async (req, res, next) => {
  try {
    const target = await DematHolding.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Position tracker reference unmapped' });

    Object.assign(target, req.body);
    await target.save();
    res.status(200).json(target);
  } catch (error) { next(error); }
};

exports.deleteHolding = async (req, res, next) => {
  try {
    const target = await DematHolding.findByIdAndDelete(req.params.id);
    if (!target) return res.status(404).json({ error: 'Position instance not found' });
    res.status(200).json({ message: 'Position cleared from tracking matrix successfully' });
  } catch (error) { next(error); }
};

exports.sellHoldingPosition = async (req, res, next) => {
  try {
    const { holdingId, sellDate, sellPrice, quantitySold } = req.body;
    const activePosition = await DematHolding.findById(holdingId);
    if (!activePosition) return res.status(404).json({ error: 'Asset reference trace void' });
    if (quantitySold > activePosition.quantity) return res.status(400).json({ error: 'Volume requested exceeds current vault storage' });

    const targetedSellDate = sellDate ? new Date(sellDate) : new Date();
    const targetedBuyDate = new Date(activePosition.buyDate);

    const durationDeltaMs = targetedSellDate.getTime() - targetedBuyDate.getTime();
    const computedHoldingDays = Math.max(0, Math.floor(durationDeltaMs / (1000 * 60 * 60 * 24)));

    const derivedCostBasis = parseFloat((activePosition.buyPrice * quantitySold).toFixed(2));
    const rawRevenueGenerated = parseFloat((sellPrice * quantitySold).toFixed(2));
    const netTradePnl = parseFloat((rawRevenueGenerated - derivedCostBasis).toFixed(2));
    const netTradePnlPercentage = derivedCostBasis > 0 ? parseFloat(((netTradePnl / derivedCostBasis) * 100).toFixed(2)) : 0;

    let assetTaxType = 'STCG';
    let computedTaxObligation = 0;

    if (computedHoldingDays > 365) {
      assetTaxType = 'LTCG';
      if (netTradePnl > 100000) {
        computedTaxObligation = parseFloat(((netTradePnl - 100000) * 0.10).toFixed(2));
      }
    } else {
      assetTaxType = 'STCG';
      if (netTradePnl > 0) {
        computedTaxObligation = parseFloat((netTradePnl * 0.15).toFixed(2));
      }
    }

    const netRealizedReturn = parseFloat((netTradePnl - computedTaxObligation).toFixed(2));

    const closureLogArchive = new DematSoldHolding({
      accountId: activePosition.accountId,
      symbol: activePosition.symbol,
      companyName: activePosition.companyName,
      buyDate: activePosition.buyDate,
      buyPrice: activePosition.buyPrice,
      sellDate: targetedSellDate,
      sellPrice,
      quantity: quantitySold,
      investedAmount: derivedCostBasis,
      saleAmount: rawRevenueGenerated,
      profitLoss: netTradePnl,
      profitLossPercent: netTradePnlPercentage,
      holdingDays: computedHoldingDays,
      taxType: assetTaxType,
      approximateTax: computedTaxObligation,
      netProfit: netRealizedReturn
    });

    await closureLogArchive.save();

    if (activePosition.quantity === quantitySold) {
      await DematHolding.findByIdAndDelete(holdingId);
    } else {
      activePosition.quantity -= quantitySold;
      activePosition.investedAmount = parseFloat((activePosition.buyPrice * activePosition.quantity).toFixed(2));
      activePosition.currentValue = parseFloat((activePosition.currentPrice * activePosition.quantity).toFixed(2));
      activePosition.profitLoss = parseFloat((activePosition.currentValue - activePosition.investedAmount).toFixed(2));
      activePosition.profitLossPercent = activePosition.investedAmount > 0 ? parseFloat(((activePosition.profitLoss / activePosition.investedAmount) * 100).toFixed(2)) : 0;
      await activePosition.save();
    }

    res.status(201).json({
      message: 'Position trade realization cycle successfully archived',
      archivedRecord: closureLogArchive
    });
  } catch (error) { next(error); }
};

exports.bulkCSVImportHoldings = async (req, res, next) => {
  try {
    const { csvDataString } = req.body; 
    if (!csvDataString) return res.status(400).json({ error: 'Payload must contain a valid string array configuration mapping' });

    const lines = csvDataString.split('\n').map(line => line.trim()).filter(Boolean);
    const elementsProcessed = [];
    
    for (let i = 1; i < lines.length; i++) {
      const [symbol, companyName, quantity, buyPrice, buyDate, accountName] = lines[i].split(',').map(item => item?.trim());
      if (!symbol || !quantity || !buyPrice || !accountName) continue;

      let accountContext = await DematAccount.findOne({ accountName: new RegExp(`^${accountName}$`, 'i') });
      if (!accountContext) {
        accountContext = new DematAccount({ accountName, brokerName: 'other' });
        await accountContext.save();
      }

      const formattedSymbol = symbol.toUpperCase();
      const parsedQty = parseInt(quantity);
      const parsedPrice = parseFloat(buyPrice);

      let extractedLivePrice = parsedPrice;
      try {
        const payloadTick = await getStockData(formattedSymbol);
        extractedLivePrice = payloadTick.currentPrice;
      } catch (err) { }

      const targetHolding = new DematHolding({
        accountId: accountContext._id,
        symbol: formattedSymbol,
        companyName,
        quantity: parsedQty,
        buyPrice: parsedPrice,
        buyDate: buyDate ? new Date(buyDate) : new Date(),
        currentPrice: extractedLivePrice,
        currentValue: extractedLivePrice * parsedQty
      });

      targetHolding.profitLoss = parseFloat((targetHolding.currentValue - targetHolding.investedAmount).toFixed(2));
      targetHolding.profitLossPercent = targetHolding.investedAmount > 0 ? parseFloat(((targetHolding.profitLoss / targetHolding.investedAmount) * 100).toFixed(2)) : 0;

      await targetHolding.save();
      elementsProcessed.push(targetHolding);
    }

    res.status(201).json({ message: `Ingress sync complete. Populated ${elementsProcessed.length} entries.`, records: elementsProcessed });
  } catch (error) { next(error); }
};

exports.getUnifiedPortfolioSummary = async (req, res, next) => {
  try {
    const targetAccountId = req.params.accountId;
    const filterConditions = { isActive: true };
    if (targetAccountId) filterConditions.accountId = targetAccountId;

    const positions = await DematHolding.find(filterConditions).populate('accountId');

    let runningInvestedTotal = 0;
    let runningValueTotal = 0;

    let starAsset = null;
    let dragAsset = null;
    
    const sectorAggregations = {};
    const accountAggregations = {};

    positions.forEach(pos => {
      runningInvestedTotal += pos.investedAmount;
      runningValueTotal += pos.currentValue;

      if (!starAsset || pos.profitLossPercent > starAsset.profitLossPercent) {
        starAsset = { symbol: pos.symbol, profitLossPercent: pos.profitLossPercent };
      }
      if (!dragAsset || pos.profitLossPercent < dragAsset.profitLossPercent) {
        dragAsset = { symbol: pos.symbol, profitLossPercent: pos.profitLossPercent };
      }

      const industry = pos.notes || 'General Assets'; 
      sectorAggregations[industry] = (sectorAggregations[industry] || 0) + pos.currentValue;

      const profileName = pos.accountId?.accountName || 'External Ledgers';
      accountAggregations[profileName] = (accountAggregations[profileName] || 0) + pos.currentValue;
    });

    const netAbsolutePnl = parseFloat((runningValueTotal - runningInvestedTotal).toFixed(2));
    const netPercentagePnl = runningInvestedTotal > 0 ? parseFloat(((netAbsolutePnl / runningInvestedTotal) * 100).toFixed(2)) : 0;

    res.status(200).json({
      totalInvested: parseFloat(runningInvestedTotal.toFixed(2)),
      currentValue: parseFloat(runningValueTotal.toFixed(2)),
      totalProfitLoss: netAbsolutePnl,
      totalProfitLossPercent: netPercentagePnl,
      todayProfitLoss: 0.00,
      bestPerformer: starAsset,
      worstPerformer: dragAsset,
      sectorBreakdown: Object.entries(sectorAggregations).map(([name, val]) => ({ sector: name, value: parseFloat(val.toFixed(2)) })),
      accountBreakdown: Object.entries(accountAggregations).map(([name, val]) => ({ account: name, value: parseFloat(val.toFixed(2)) }))
    });
  } catch (error) { next(error); }
};

exports.forceTriggerManualPricingSync = async (req, res, next) => {
  try {
    const trackedPositions = await DematHolding.find({ isActive: true });
    let refreshCounter = 0;

    for (const position of trackedPositions) {
      try {
        const updateTick = await getStockData(position.symbol);
        position.currentPrice = updateTick.currentPrice;
        position.currentValue = parseFloat((updateTick.currentPrice * position.quantity).toFixed(2));
        position.profitLoss = parseFloat((position.currentValue - position.investedAmount).toFixed(2));
        position.profitLossPercent = position.investedAmount > 0 ? parseFloat(((position.profitLoss / position.investedAmount) * 100).toFixed(2)) : 0;
        position.lastPriceUpdate = new Date();
        await position.save();
        refreshCounter++;
      } catch (err) { }
    }
    res.status(200).json({ message: `System execution arrays refresh process completed on ${refreshCounter} items.` });
  } catch (error) { next(error); }
};
