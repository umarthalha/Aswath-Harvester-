const cron = require('node-cron');
const DematHolding = require('../models/DematHolding');
const PriceAlert = require('../models/PriceAlert');
const { getStockData } = require('../services/marketDataService');

cron.schedule('*/30 * * * * *', async () => {
  const currentTimestamp = new Date();
  const localizedTimeStr = currentTimestamp.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const localizedDateObject = new Date(localizedTimeStr);
  
  const currentHour = localizedDateObject.getHours();
  const currentMinute = localizedDateObject.getMinutes();
  const currentWeekDay = localizedDateObject.getDay();

  const isWithinMarketWindow = 
    currentWeekDay >= 1 && currentWeekDay <= 5 &&
    ((currentHour === 9 && currentMinute >= 15) || 
     (currentHour > 9 && currentHour < 15) || 
     (currentHour === 15 && currentMinute <= 30));

  if (!isWithinMarketWindow) return;

  try {
    const activePositions = await DematHolding.find({ isActive: true });
    if (activePositions.length === 0) return;

    const loopPricingCache = {};

    for (const position of activePositions) {
      try {
        let tickerPrice = 0;
        if (loopPricingCache[position.symbol]) {
          tickerPrice = loopPricingCache[position.symbol];
        } else {
          const freshData = await getStockData(position.symbol);
          tickerPrice = freshData.currentPrice;
          loopPricingCache[position.symbol] = tickerPrice;
        }

        position.currentPrice = tickerPrice;
        position.currentValue = parseFloat((tickerPrice * position.quantity).toFixed(2));
        position.profitLoss = parseFloat((position.currentValue - position.investedAmount).toFixed(2));
        position.profitLossPercent = position.investedAmount > 0 ? parseFloat(((position.profitLoss / position.investedAmount) * 100).toFixed(2)) : 0;
        position.lastPriceUpdate = new Date();
        await position.save();

        const activeAlerts = await PriceAlert.find({ symbol: position.symbol, isTriggered: false });
        for (const alert of activeAlerts) {
          let hasTriggered = false;

          if (alert.alertType === 'target' && tickerPrice >= alert.targetPrice) hasTriggered = true;
          else if (alert.alertType === 'stoploss' && tickerPrice <= alert.targetPrice) hasTriggered = true;
          else if (alert.alertType === 'custom' && Math.abs(tickerPrice - alert.targetPrice) <= (alert.targetPrice * 0.005)) hasTriggered = true;

          if (hasTriggered) {
            alert.isTriggered = true;
            alert.triggeredAt = new Date();
            await alert.save();
            console.log(`\n🚨 [ALERT TRIGGERED] ${alert.symbol} crossed boundary value pricing at ₹${tickerPrice}\n`);
          }
        }
      } catch (innerErr) { }
    }
  } catch (err) {
    console.error('High-frequency tracker error:', err.message);
  }
});
