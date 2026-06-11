import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency, formatIndianNumber } from '../lib/utils';
import { Target, ShieldAlert, ArrowRight, Save, Crosshair } from 'lucide-react';
import { saveDematTrade, getDematAccounts, saveDematAccount } from '../store/demat-storage';
import { DematTrade, DematAccount } from '../types';

export function PositionCalculator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialSymbol = searchParams.get('symbol') || '';
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [totalCapital, setTotalCapital] = useState<number | ''>(100000);
  
  const [l1Price, setL1Price] = useState<number | ''>('');
  const [l2Price, setL2Price] = useState<number | ''>('');
  const [l3Price, setL3Price] = useState<number | ''>('');
  
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [target, setTarget] = useState<number | ''>('');

  const capital = Number(totalCapital) || 0;
  
  // 3:4:3 Rule Allocation
  const l1Cap = capital * 0.3;
  const l2Cap = capital * 0.4;
  const l3Cap = capital * 0.3;

  const l1Qty = Number(l1Price) > 0 ? Math.floor(l1Cap / Number(l1Price)) : 0;
  const l2Qty = Number(l2Price) > 0 ? Math.floor(l2Cap / Number(l2Price)) : 0;
  const l3Qty = Number(l3Price) > 0 ? Math.floor(l3Cap / Number(l3Price)) : 0;

  const totalQty = l1Qty + l2Qty + l3Qty;
  const totalActualInvested = (l1Qty * Number(l1Price)) + (l2Qty * Number(l2Price)) + (l3Qty * Number(l3Price));
  const avgPrice = totalQty > 0 ? totalActualInvested / totalQty : 0;

  const slPriceNum = Number(stopLoss);
  const targetPriceNum = Number(target);

  const totalRisk = totalQty > 0 && slPriceNum > 0 ? (avgPrice - slPriceNum) * totalQty : 0;
  const riskPercent = capital > 0 ? (totalRisk / capital) * 100 : 0;
  
  const totalPotentialProfit = totalQty > 0 && targetPriceNum > 0 ? (targetPriceNum - avgPrice) * totalQty : 0;
  const riskReward = totalRisk > 0 ? totalPotentialProfit / totalRisk : 0;

  const handleSaveLayer = (layerNum: 1|2|3) => {
    let price = 0;
    let qty = 0;
    if (layerNum === 1) { price = Number(l1Price); qty = l1Qty; }
    if (layerNum === 2) { price = Number(l2Price); qty = l2Qty; }
    if (layerNum === 3) { price = Number(l3Price); qty = l3Qty; }

    if (!symbol || price <= 0 || qty <= 0) {
      alert("Please fill symbol and valid prices to allocate this layer.");
      return;
    }

    let accounts = getDematAccounts();
    if (accounts.length === 0) {
       const defAcc: DematAccount = { id: Date.now().toString(), name: 'Default Account', broker: 'Other', color: '#00d4a3' };
       saveDematAccount(defAcc);
       accounts = [defAcc];
    }
    const accId = accounts[0].id;

    const trade: DematTrade = {
      id: Date.now().toString(),
      accountId: accId,
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      buyDate: new Date().toISOString().split('T')[0],
      buyPrice: price,
      qty: qty,
      exchange: 'NSE',
      tradeType: 'Delivery',
      layerNumber: layerNum,
    };
    saveDematTrade(trade);
    alert(`Layer ${layerNum} for ${symbol} saved to Demat Portfolio!`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Position Sizing</h1>
        <p className="text-gray-400 mt-1">3:4:3 Allocation Rule Calculator</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/5 pb-4 bg-white/5 rounded-t-xl">
              <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2"><Target className="w-3 h-3 accent-text"/> Trade Setup</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Stock Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white uppercase focus:border-[#00d4a3] outline-none"
                  placeholder="e.g. RELIANCE"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Total Allocated Capital (₹)</label>
                <input
                  type="number"
                  value={totalCapital}
                  onChange={e => setTotalCapital(Number(e.target.value))}
                  className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white outline-none focus:border-[#00d4a3]"
                />
              </div>
              <div className="pt-4 border-t border-white/5">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Stop Loss Price</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#111] border border-red-900/50 rounded px-3 py-2 text-white focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Target Price (optional)</label>
                <input
                  type="number"
                  value={target}
                  onChange={e => setTarget(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#111] border border-green-900/50 rounded px-3 py-2 text-white focus:border-green-500 outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {(totalRisk > 0 || riskReward > 0) && (
            <Card className="bg-white/5 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-red-400"/> Max Risk</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(totalRisk)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Risk %</span>
                  <span className={`block font-bold mt-1 ${riskPercent > 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {riskPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              {targetPriceNum > 0 && (
                <>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-1"><Crosshair className="w-3 h-3 accent-text"/> Projected Profit</span>
                      <span className="text-xl font-bold text-green-400">{formatCurrency(totalPotentialProfit)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Risk/Reward</span>
                      <span className={`block font-bold mt-1 ${riskReward >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                        1 : {riskReward.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <LayerCard 
            layerNum={1} 
            title="Layer 1: Anticipation" 
            allocation="30%" 
            cap={l1Cap} 
            price={l1Price} 
            setPrice={setL1Price} 
            qty={l1Qty} 
            onSave={() => handleSaveLayer(1)}
            description="Buy at Support 1. Low risk anticipation entry."
          />
          <LayerCard 
            layerNum={2} 
            title="Layer 2: Confirmation" 
            allocation="40%" 
            cap={l2Cap} 
            price={l2Price} 
            setPrice={setL2Price} 
            qty={l2Qty} 
            onSave={() => handleSaveLayer(2)}
            description="Buy at Support 2 or inside day break. Largest size."
          />
          <LayerCard 
            layerNum={3} 
            title="Layer 3: Breakout Pyramiding" 
            allocation="30%" 
            cap={l3Cap} 
            price={l3Price} 
            setPrice={setL3Price} 
            qty={l3Qty} 
            onSave={() => handleSaveLayer(3)}
            description="Buy at breakout. Adding to a winning position."
          />

          {totalQty > 0 && (
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00d4a3]">Blended Average</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(avgPrice)}
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00d4a3]">Total Quantity</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatIndianNumber(totalQty)}
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00d4a3]">Total Allocated</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(totalActualInvested)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LayerCard({ layerNum, title, allocation, cap, price, setPrice, qty, description, onSave }: any) {
  return (
    <Card className="overflow-hidden border-white/5 hover:border-white/10 transition-colors">
      <div className="flex flex-col sm:flex-row">
        <div className="bg-white/5 p-6 sm:w-1/3 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-white/10">{allocation}</span>
          </div>
          <h3 className="font-bold text-white mt-2">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{description}</p>
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Capital Limit</span>
            <span className="text-lg font-bold text-white underline decoration-white/20 underline-offset-4">{formatCurrency(cap)}</span>
          </div>
        </div>
        <div className="p-6 sm:w-2/3 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Entry Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00d4a3] transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Calculated Qty</label>
              <div className="w-full bg-[#111]/50 border border-white/5 rounded px-3 py-2 text-gray-300 font-mono flex items-center justify-between cursor-not-allowed">
                <span>{qty > 0 ? formatIndianNumber(qty) : '-'}</span>
                <span className="text-[10px] uppercase text-gray-600">shares</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={onSave}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Save className="w-4 h-4" /> Save Log
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
