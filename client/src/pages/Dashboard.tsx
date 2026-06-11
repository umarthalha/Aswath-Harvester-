import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TrendingUp, TrendingDown, IndianRupee, PieChart, Activity, AlertCircle } from 'lucide-react';
import { getDematTrades } from '../store/demat-storage';
import { DematTrade, NiftyStatus } from '../types';
import { formatCurrency } from '../lib/utils';
import { fetchNiftyStatus, fetchStockDetails } from '../api';

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<DematTrade[]>([]);
  const [nifty, setNifty] = useState<NiftyStatus | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [investedValue, setInvestedValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const trades = getDematTrades();
      setPortfolio(trades);
      
      const niftyData = await fetchNiftyStatus();
      setNifty(niftyData);

      let totalInvested = 0;
      let totalValue = 0;

      // Group trades by symbol
      const symbols = [...new Set(trades.map(t => t.symbol))];
      
      for (const t of trades) {
        totalInvested += t.buyPrice * t.qty;
      }
      setInvestedValue(totalInvested);

      // Fetch current prices to get current value
      for (const sym of symbols) {
        const details = await fetchStockDetails(sym);
        const qtyForSym = trades.filter(t => t.symbol === sym).reduce((acc, t) => acc + t.qty, 0);
        totalValue += details.price * qtyForSym;
      }
      setPortfolioValue(totalValue);

      setLoading(false);
    };

    loadData();
  }, []);

  const pnl = portfolioValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  const isProfit = pnl >= 0;

  // Group positions for list
  const positionsMap = portfolio.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { symbol: trade.symbol, qty: 0, invested: 0, layers: new Set<number>() };
    }
    acc[trade.symbol].qty += trade.qty;
    acc[trade.symbol].invested += (trade.buyPrice * trade.qty);
    if (trade.layerNumber) acc[trade.symbol].layers.add(trade.layerNumber);
    return acc;
  }, {} as Record<string, { symbol: string; qty: number; invested: number; layers: Set<number> }>);

  const activePositions = Object.values(positionsMap);

  const getLayerBadgeInfo = (layers: Set<number>) => {
    if (layers.has(1) && layers.has(2) && layers.has(3)) return { text: 'Full position', variant: 'success' as const };
    if (layers.has(1) && layers.has(2)) return { text: 'Layer 2 filled', variant: 'warning' as const };
    if (layers.has(1)) return { text: 'Layer 1 filled', variant: 'warning' as const };
    return { text: 'Pending', variant: 'outline' as const };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Portfolio overview and market regime</p>
        </div>
      </div>

      {nifty && (
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${nifty.isBullish ? 'bg-green-900/20 border-green-800/50' : 'bg-red-900/20 border-red-800/50'}`}>
          <div className={`p-2 rounded-lg ${nifty.isBullish ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {nifty.isBullish ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${nifty.isBullish ? 'text-green-400' : 'text-red-400'}`}>
              Market Regime: {nifty.isBullish ? 'Bullish' : 'Bearish'}
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Nifty 50 ({formatCurrency(nifty.currentPrice)}) is {nifty.isBullish ? 'above' : 'below'} its 200 DMA ({formatCurrency(nifty.dma200)}).
              {nifty.isBullish ? ' Green light for fresh entries.' : ' Caution: Strict stop losses and half quantities recommended.'}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#1a1a1a] rounded-xl border border-[#333]"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Invested</CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold italic">{formatCurrency(investedValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Value</CardTitle>
              <PieChart className="h-4 w-4 text-[#00d4a3]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total P&L</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isProfit ? 'accent-text' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{formatCurrency(pnl)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Net Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isProfit ? 'accent-text' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activePositions.length > 7 && (
        <div className="bg-red-900/30 border border-red-800/50 rounded p-3 flex items-center gap-3 text-red-200">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm">Rule Violation: You have more than 7 active stocks. Consider consolidating to focus on highest conviction setups.</p>
        </div>
      )}

      <Card className="flex flex-col flex-1">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Active Positions Status</CardTitle>
          <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/10">{activePositions.length}/7 Stocks</span>
        </CardHeader>
        <CardContent className="p-0">
          {activePositions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active positions found. Add trades in the Portfolio tab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium text-right">Invested</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activePositions.map((pos) => {
                    const layerInfo = getLayerBadgeInfo(pos.layers);
                    return (
                      <tr key={pos.symbol} className="hover:bg-white/5 border-l-4 border-transparent hover:border-active transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {pos.symbol}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(pos.invested)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400">
                          {pos.qty}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={layerInfo.variant}>{layerInfo.text}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
