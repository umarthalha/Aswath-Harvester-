import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getDematAccounts, saveDematAccount, getDematTrades, saveDematTrade, deleteDematTrade, getRealizedTrades, saveRealizedTrade, initialBrokers, colorTags } from '../store/demat-storage';
import { DematAccount, DematTrade, RealizedTrade } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { allUniverseData } from '../data/mockUniverse';
import { Plus, Building2, TrendingUp, Search, Clock, Trash2, Edit2, AlertCircle, RefreshCw, BarChart3, Receipt, Tag, Target, Download, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';

export function Demat() {
  const [activeTab, setActiveTab] = useState<'holdings' | 'pnl' | 'alerts'>('holdings');
  const [accounts, setAccounts] = useState<DematAccount[]>(getDematAccounts());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [trades, setTrades] = useState<DematTrade[]>(getDematTrades());
  const [realizedTrades, setRealizedTrades] = useState<RealizedTrade[]>(getRealizedTrades());
  const [showAddAccount, setShowAddAccount] = useState(accounts.length === 0);

  // Live Price Simulator
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [marketStatus, setMarketStatus] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Initialize prices for all unique holdings
    const uniqueSymbols = Array.from(new Set(trades.map(t => t.symbol)));
    const initialPrices: Record<string, number> = {};
    uniqueSymbols.forEach(sym => {
       const uStock = allUniverseData.find(s => s.symbol === sym);
       initialPrices[sym] = uStock ? uStock.price : (Math.random() * 1000 + 50);
    });
    setLivePrices(initialPrices);
  }, [trades]);

  useEffect(() => {
    if (!marketStatus) return;
    const interval = setInterval(() => {
       setLivePrices(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(sym => {
             const move = 1 + (Math.random() * 0.006 - 0.003); // -0.3% to +0.3%
             next[sym] = Number((next[sym] * move).toFixed(2));
          });
          return next;
       });
       setLastUpdated(new Date());
    }, 5000); // 5 seconds for visual demo purpose instead of 30, feels more alive
    return () => clearInterval(interval);
  }, [marketStatus]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newAcc: DematAccount = {
      id: Date.now().toString(),
      name: fd.get('name') as string,
      broker: fd.get('broker') as string,
      color: fd.get('color') as string,
    };
    saveDematAccount(newAcc);
    setAccounts(getDematAccounts());
    setSelectedAccountId(newAcc.id);
    setShowAddAccount(false);
  };

  const currentAccount = accounts.find(a => a.id === selectedAccountId);
  
  const displayTrades = selectedAccountId === 'all' 
                        ? trades 
                        : trades.filter(t => t.accountId === selectedAccountId);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-8 h-8 accent-text" fill="currentColor"/> Demat Portfolio
          </h1>
          <p className="text-gray-400 mt-1">Multi-broker virtual holdings & analysis</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-white/5">
             <div className={cn("w-2 h-2 rounded-full", marketStatus ? "bg-green-500 animate-pulse" : "bg-red-500")} />
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
               {marketStatus ? 'Market Open' : 'Market Closed'}
             </span>
             <span className="text-xs text-gray-500 ml-2">{lastUpdated.toLocaleTimeString()}</span>
             <button onClick={() => setMarketStatus(!marketStatus)} className="ml-2 text-[10px] uppercase text-gray-500 hover:text-white transition-colors">
                Toggle
             </button>
          </div>
          <button 
             onClick={() => setShowAddAccount(true)}
             disabled={accounts.length >= 4}
             className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
             <Plus className="w-4 h-4"/> Add Account
          </button>
        </div>
      </div>

      {showAddAccount && (
        <Card className="mb-6 border-white/10 flex-shrink-0 animate-in fade-in slide-in-from-top-4">
          <CardHeader className="py-4 bg-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#00d4a3]"><Plus className="w-3 h-3 inline mr-2"/> Link New Demat Account</CardTitle>
            <button onClick={() => setShowAddAccount(false)} className="text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest">Cancel</button>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleCreateAccount} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Account Nickname</label>
                <input required name="name" type="text" placeholder="e.g. Zerodha - Main" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00d4a3]" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Broker</label>
                <select required name="broker" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00d4a3]">
                  {initialBrokers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex-1 w-full max-w-[150px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Color Tag</label>
                <div className="flex gap-2 p-1 border border-white/10 rounded bg-[#111] py-2 px-3">
                   {colorTags.slice(0, 5).map((color, i) => (
                     <label key={color} className="cursor-pointer">
                        <input type="radio" name="color" value={color} defaultChecked={i === 0} className="sr-only peer" />
                        <div className="w-5 h-5 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-[#111] peer-checked:ring-blue-500 transition-all" style={{ backgroundColor: color }} />
                     </label>
                   ))}
                </div>
              </div>
              <button type="submit" className="accent-bg text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded hover:opacity-90 transition-colors w-full sm:w-auto h-9">
                 Save Account
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account Tabs */}
      {accounts.length > 0 && (
         <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0 scrollbar-hide">
             <button 
                onClick={() => setSelectedAccountId('all')}
                className={cn("px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px] transition-colors whitespace-nowrap", 
                  selectedAccountId === 'all' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                )}
             >
                All Accounts
             </button>
             {accounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={cn("px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2 whitespace-nowrap",
                    selectedAccountId === acc.id ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }}/>
                  {acc.name}
                </button>
             ))}
         </div>
      )}

      {/* Main Content Area */}
      {accounts.length > 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-1 flex flex-col overflow-hidden">
          {/* Internal Tabs */}
          <div className="flex border-b border-white/5 bg-black/20">
             {[
               { id: 'holdings', label: 'Holdings', icon: Receipt },
               { id: 'pnl', label: 'P&L Analysis', icon: BarChart3 },
               { id: 'alerts', label: 'Alerts', icon: AlertCircle }
             ].map(t => (
               <button
                 key={t.id}
                 onClick={() => setActiveTab(t.id as any)}
                 className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2",
                    activeTab === t.id ? "border-[#00d4a3] text-[#00d4a3]" : "border-transparent text-gray-500 hover:text-gray-300"
                 )}
               >
                 <t.icon className="w-4 h-4"/> {t.label}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-auto p-6">
             {activeTab === 'holdings' && (
                <HoldingsView 
                  trades={displayTrades} 
                  accounts={accounts} 
                  livePrices={livePrices} 
                  setTrades={setTrades}
                  setRealizedTrades={setRealizedTrades}
                />
             )}
             {activeTab === 'pnl' && (
                <PnlView 
                  realized={realizedTrades} 
                  unrealized={displayTrades} 
                  livePrices={livePrices} 
                />
             )}
             {activeTab === 'alerts' && (
                <div className="text-center text-gray-500 py-12 font-medium">Alerts feature coming soon.</div>
             )}
          </div>
        </div>
      ) : (
        <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Demat Accounts Found</h3>
            <p className="text-gray-400 max-w-md">Add a virtual demat account to start tracking your holdings, simulating trades, and analyzing your P&L seamlessly across multiple brokers.</p>
        </div>
      )}
    </div>
  );
}

// ============== HOLDINGS VIEW COMPONENT ==============

function HoldingsView({ trades, accounts, livePrices, setTrades, setRealizedTrades }: { trades: DematTrade[], accounts: DematAccount[], livePrices: Record<string, number>, setTrades: any, setRealizedTrades: any }) {
  // Stats
  const totalInvested = trades.reduce((sum, t) => sum + (t.buyPrice * t.qty), 0);
  const currentValue = trades.reduce((sum, t) => {
     const price = livePrices[t.symbol] || t.buyPrice;
     return sum + (price * t.qty);
  }, 0);
  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  
  // Today's Pnl calculation (mocked assumption: previous close was 0.5% away, or just using a randomized realistic diff for demo)
  // Since we don't have real previous close, let's just make it a small random fraction of current PNL or randomized if it's new.
  // Actually, we can assume today's open price was livePrices * 0.99 for demo.
  const todaysPnl = trades.reduce((sum, t) => {
      const live = livePrices[t.symbol] || t.buyPrice;
      const prevClose = live * 0.992; // fixed static simulated previous close
      return sum + ((live - prevClose) * t.qty);
  }, 0);

  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="space-y-6">
       {/* Summary Cards */}
       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard title="Total Invested" value={formatCurrency(totalInvested)} />
          <SummaryCard title="Current Value" value={formatCurrency(currentValue)} live />
          <SummaryCard title="Total P&L" value={(totalPnl >= 0 ? '+' : '') + formatCurrency(totalPnl)} color={totalPnl >= 0 ? 'text-[#00d4a3]' : 'text-red-400'} />
          <SummaryCard title="Total P&L %" value={(totalPnl >= 0 ? '+' : '') + totalPnlPercent.toFixed(2) + '%'} color={totalPnlPercent >= 0 ? 'text-[#00d4a3]' : 'text-red-400'} />
          <SummaryCard title="1D P&L" value={(todaysPnl >= 0 ? '+' : '') + formatCurrency(todaysPnl)} color={todaysPnl >= 0 ? 'text-[#00d4a3]' : 'text-red-400'} live />
       </div>

       {/* Actions */}
       <div className="flex items-center justify-between">
           <h2 className="text-xs font-bold uppercase tracking-widest text-[#00d4a3] border-b-2 border-[#00d4a3] pb-1">Current Holdings ({trades.length})</h2>
           <div className="flex gap-2">
             <button onClick={() => {setShowImport(!showImport); setShowAddTrade(false);}} className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-2">
               <Download className="w-3 h-3"/> Import
             </button>
             <button onClick={() => {setShowAddTrade(!showAddTrade); setShowImport(false);}} className="accent-bg text-black px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:opacity-90 flex items-center gap-2">
               <Plus className="w-3 h-3"/> Log Trade
             </button>
           </div>
       </div>

       {showAddTrade && <AddTradeForm accounts={accounts} onClose={() => setShowAddTrade(false)} onAdd={() => {
         setTrades(getDematTrades());
         setShowAddTrade(false);
       }} />}

       {showImport && <ImportTradeForm accounts={accounts} onClose={() => setShowImport(false)} onImport={() => {
         setTrades(getDematTrades());
         setShowImport(false);
       }} />}

       {/* Table */}
       {trades.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium border border-white/5 rounded">No active holdings in this selection.</div>
       ) : (
          <div className="overflow-x-auto border border-white/5 rounded">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#111] text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                 <tr>
                   <th className="px-4 py-3 font-medium">Stock Name</th>
                   <th className="px-4 py-3 font-medium">Demat A/C</th>
                   <th className="px-4 py-3 font-medium text-right">Qty</th>
                   <th className="px-4 py-3 font-medium text-right">Avg Price</th>
                   <th className="px-4 py-3 font-medium text-right">LTP (Live)</th>
                   <th className="px-4 py-3 font-medium text-right">Invested</th>
                   <th className="px-4 py-3 font-medium text-right">Current Value</th>
                   <th className="px-4 py-3 font-medium text-right">P&L</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {trades.map(t => {
                    const ltp = livePrices[t.symbol] || t.buyPrice;
                    const invested = t.buyPrice * t.qty;
                    const curVal = ltp * t.qty;
                    const pnl = curVal - invested;
                    const pnlPercent = (pnl / invested) * 100;
                    const dayChange = livePrices[t.symbol] ? (ltp - (ltp * 0.992)) / (ltp * 0.992) * 100 : 0;
                    
                    const acc = accounts.find(a => a.id === t.accountId);

                    return (
                      <DematExpandableRow 
                        key={t.id} 
                        trade={t} 
                        acc={acc} 
                        ltp={ltp} 
                        invested={invested} 
                        curVal={curVal} 
                        pnl={pnl} 
                        pnlPercent={pnlPercent} 
                        dayChange={dayChange}
                        onRefresh={() => setTrades(getDematTrades())}
                        onRealizeRefresh={() => setRealizedTrades(getRealizedTrades())}
                      />
                    );
                 })}
               </tbody>
            </table>
          </div>
       )}
    </div>
  );
}

function SummaryCard({ title, value, color = "text-white", live = false }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded flex flex-col">
       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex justify-between items-center">
         {title} {live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-2" title="Live update" />}
       </span>
       <span className={cn("text-xl font-bold font-mono tracking-tight", color)}>{value}</span>
    </div>
  )
}

function AddTradeForm({ accounts, onClose, onAdd }: any) {
  const [symbolSearch, setSymbolSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);

  const matchedStocks = allUniverseData.filter(s => s.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) || s.name.toLowerCase().includes(symbolSearch.toLowerCase())).slice(0, 5);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const tr: DematTrade = {
      id: Date.now().toString(),
      accountId: fd.get('accountId') as string,
      symbol: selectedStock?.symbol || fd.get('symbol') as string,
      name: selectedStock?.name || fd.get('symbol') as string,
      buyDate: fd.get('buyDate') as string,
      buyPrice: Number(fd.get('buyPrice')),
      qty: Number(fd.get('qty')),
      exchange: fd.get('exchange') as any,
      tradeType: fd.get('tradeType') as any,
    };
    saveDematTrade(tr);
    onAdd();
  };

  return (
    <div className="bg-[#151515] p-6 border border-white/10 rounded my-4">
       <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Demat Account *</label>
             <select required name="accountId" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none">
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.broker})</option>)}
             </select>
          </div>
          <div className="space-y-1 relative">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Stock Symbol *</label>
             <input required type="text" name="symbol" value={selectedStock ? selectedStock.symbol : symbolSearch} onChange={e => {setSymbolSearch(e.target.value); setSelectedStock(null);}} placeholder="Search stock..." className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none uppercase" />
             {!selectedStock && symbolSearch && matchedStocks.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[#222] border border-white/10 rounded mt-1 z-10 max-h-40 overflow-y-auto">
                   {matchedStocks.map(s => (
                     <div key={s.symbol} onClick={() => {setSelectedStock(s); setSymbolSearch(s.symbol)}} className="p-2 hover:bg-white/10 cursor-pointer text-sm">
                       <span className="font-bold text-white block">{s.symbol}</span>
                       <span className="text-[10px] text-gray-400">{s.name}</span>
                     </div>
                   ))}
                </div>
             )}
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Buy Date *</label>
             <input required type="date" name="buyDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Buy Price (₹) *</label>
             <input required type="number" step="0.01" name="buyPrice" placeholder="0.00" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quantity *</label>
             <input required type="number" name="qty" placeholder="10" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Exchange</label>
             <select name="exchange" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none">
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Trade Type</label>
             <select name="tradeType" className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#00d4a3] outline-none">
                <option value="Delivery">Delivery / CNC</option>
                <option value="Intraday">Intraday / MIS</option>
                <option value="SIP">SIP</option>
             </select>
          </div>
          <div className="col-span-1 lg:col-span-4 flex items-end justify-end gap-3 pt-2">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2 accent-bg text-black font-bold uppercase tracking-widest text-xs rounded hover:opacity-90 transition-colors">Add Trade</button>
          </div>
       </form>
    </div>
  )
}

function DematExpandableRow({ trade, acc, ltp, invested, curVal, pnl, pnlPercent, dayChange, onRefresh, onRealizeRefresh }: any) {
   const [expanded, setExpanded] = useState(false);
   const [isSelling, setIsSelling] = useState(false);

   const handleSell = (e: React.FormEvent) => {
     e.preventDefault();
     const fd = new FormData(e.target as HTMLFormElement);
     const qtyToSell = Number(fd.get('sellQty'));
     const sellPrice = Number(fd.get('sellPrice'));
     const sellDate = fd.get('sellDate') as string;

     if (qtyToSell > trade.qty) return alert("Cannot sell more than held quantity");

     const holdingDays = Math.floor((new Date(sellDate).getTime() - new Date(trade.buyDate).getTime()) / (1000*3600*24));
     let taxType: 'STCG' | 'LTCG' | 'Intraday' = 'STCG';
     if (trade.tradeType === 'Intraday' || holdingDays === 0) taxType = 'Intraday';
     else if (holdingDays > 365) taxType = 'LTCG';

     const realizedValue = sellPrice * qtyToSell;
     const costBase = trade.buyPrice * qtyToSell;
     const realizedPnl = realizedValue - costBase;
     const realizedPnlPct = (realizedPnl / costBase) * 100;

     const rt: RealizedTrade = {
        id: Date.now().toString(),
        accountId: trade.accountId,
        symbol: trade.symbol,
        name: trade.name,
        buyDate: trade.buyDate,
        buyPrice: trade.buyPrice,
        sellDate: sellDate,
        sellPrice: sellPrice,
        qty: qtyToSell,
        pnl: realizedPnl,
        pnlPercent: realizedPnlPct,
        holdingPeriodDays: holdingDays,
        taxType
     };

     saveRealizedTrade(rt);

     if (qtyToSell === trade.qty) {
        deleteDematTrade(trade.id);
     } else {
        deleteDematTrade(trade.id);
        const remaining: DematTrade = { ...trade, qty: trade.qty - qtyToSell, id: Date.now().toString() + "-rem" };
        saveDematTrade(remaining);
     }

     setIsSelling(false);
     setExpanded(false);
     onRefresh();
     onRealizeRefresh();
   };

   return (
     <>
       <tr onClick={() => setExpanded(!expanded)} className="hover:bg-white/5 cursor-pointer transition-colors border-l-4 border-transparent hover:border-[#00d4a3] group">
          <td className="px-4 py-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center font-bold text-[#00d4a3] text-xs">
                 {trade.symbol.slice(0,2)}
               </div>
               <div>
                 <span className="font-bold text-white block uppercase">{trade.symbol}</span>
                 <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                   {trade.exchange} <span className="bg-white/10 rounded px-1">{trade.tradeType}</span>
                 </span>
               </div>
             </div>
          </td>
          <td className="px-4 py-3">
             {acc && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: acc.color}}/>
                  <span className="text-xs text-gray-300">{acc.broker}</span>
                </div>
             )}
          </td>
          <td className="px-4 py-3 text-right">
             <span className="text-white font-mono">{trade.qty}</span>
          </td>
          <td className="px-4 py-3 text-right">
             <span className="text-gray-300 font-mono">{formatCurrency(trade.buyPrice)}</span>
             <span className="block text-[9px] text-gray-500 uppercase">{new Date(trade.buyDate).toLocaleDateString()}</span>
          </td>
          <td className="px-4 py-3 text-right">
             <span className="text-white font-bold font-mono">{formatCurrency(ltp)}</span>
             <span className={cn("block text-[10px] font-bold uppercase", dayChange >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
               {dayChange >= 0 ? '▲' : '▼'} {Math.abs(dayChange).toFixed(2)}%
             </span>
          </td>
          <td className="px-4 py-3 text-right text-gray-400 font-mono">{formatCurrency(invested)}</td>
          <td className="px-4 py-3 text-right text-white font-mono">{formatCurrency(curVal)}</td>
          <td className="px-4 py-3 text-right">
             <span className={cn("block font-bold font-mono", pnl >= 0 ? 'text-[#00d4a3]' : 'text-red-400')}>
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
             </span>
             <span className={cn("text-[10px] uppercase font-bold tracking-widest", pnl >= 0 ? 'text-[#00d4a3]' : 'text-red-400')}>
                {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
             </span>
          </td>
       </tr>
       {expanded && (
          <tr className="bg-[#111]">
            <td colSpan={8} className="p-0 border-b border-white/5">
              <div className="p-4 flex gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1 border border-white/5 p-4 rounded bg-[#151515] text-sm text-gray-400 space-y-2">
                   <div className="flex justify-between"><span className="text-[10px] uppercase tracking-widest font-bold">Days Held</span> <span className="text-white">{Math.floor((new Date().getTime() - new Date(trade.buyDate).getTime())/(1000*3600*24))} days</span></div>
                   <div className="flex justify-between"><span className="text-[10px] uppercase tracking-widest font-bold">Full Name</span> <span className="text-white">{trade.name}</span></div>
                   <div className="flex justify-between"><span className="text-[10px] uppercase tracking-widest font-bold">Account Name</span> <span className="text-white">{acc?.name}</span></div>
                   {trade.layerNumber && <div className="flex justify-between"><span className="text-[10px] uppercase tracking-widest font-bold">Alpha Layer</span> <Badge variant="outline">L{trade.layerNumber}</Badge></div>}
                </div>
                
                <div className="flex-1 border border-white/5 p-4 rounded bg-[#151515]">
                  {!isSelling ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                       <button onClick={() => setIsSelling(true)} className="w-full max-w-[200px] border border-[#00d4a3] text-[#00d4a3] hover:bg-[#00d4a3]/10 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                         <Target className="w-4 h-4"/> Book Profit / Sell
                       </button>
                       <button onClick={() => {
                          if (confirm("Are you sure you want to delete this trade completely?")) {
                             deleteDematTrade(trade.id);
                             onRefresh();
                          }
                       }} className="w-full max-w-[200px] border border-red-900/50 text-red-400 hover:bg-red-900/20 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                         <Trash2 className="w-4 h-4"/> Delete Trade
                       </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSell} className="space-y-3">
                       <div className="flex items-center justify-between">
                         <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#00d4a3]">Sell / Book Profit</h4>
                         <button type="button" onClick={() => setIsSelling(false)} className="text-[10px] uppercase font-bold text-gray-500 hover:text-white">Cancel</button>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Sell Date</label>
                            <input required type="date" name="sellDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#111] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Quantity (Max: {trade.qty})</label>
                            <input required type="number" name="sellQty" max={trade.qty} defaultValue={trade.qty} className="w-full bg-[#111] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Sell Price (₹)</label>
                            <input required type="number" step="0.01" name="sellPrice" defaultValue={ltp} className="w-full bg-[#111] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
                          </div>
                       </div>
                       <button type="submit" className="w-full bg-[#00d4a3] text-black text-xs font-bold uppercase tracking-widest py-2 rounded hover:opacity-90">Confirm Sell</button>
                    </form>
                  )}
                </div>
              </div>
            </td>
          </tr>
       )}
     </>
   );
}


// ============== PnL VIEW COMPONENT ==============

function PnlView({ realized, unrealized, livePrices }: any) {
   const totalRealizedPnl = realized.reduce((s: number, t: any) => s + t.pnl, 0);
   const totalUnrealizedPnl = unrealized.reduce((s: number, t: any) => {
      const price = livePrices[t.symbol] || t.buyPrice;
      return s + ((price - t.buyPrice) * t.qty);
   }, 0);

   const combinedPnl = totalRealizedPnl + totalUnrealizedPnl;

   // Best/Worst realized
   const bestRealized = [...realized].sort((a,b) => b.pnlPercent - a.pnlPercent)[0];
   const worstRealized = [...realized].sort((a,b) => a.pnlPercent - b.pnlPercent)[0];

   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-[#111] border border-white/10 p-5 rounded">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Total Combined P&L</div>
                <div className={cn("text-3xl font-bold font-mono tracking-tighter", combinedPnl >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
                   {combinedPnl >= 0 ? '+' : ''}{formatCurrency(combinedPnl)}
                </div>
             </div>
             <div className="bg-[#111] border border-white/10 p-5 rounded">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex justify-between">
                  <span>Realized P&L (Booked)</span>
                  <span className="text-gray-400">{realized.length} Trades</span>
                </div>
                <div className={cn("text-2xl font-bold font-mono tracking-tighter", totalRealizedPnl >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
                   {totalRealizedPnl >= 0 ? '+' : ''}{formatCurrency(totalRealizedPnl)}
                </div>
             </div>
             <div className="bg-[#111] border border-white/10 p-5 rounded">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Unrealized P&L (Holding)</div>
                <div className={cn("text-2xl font-bold font-mono tracking-tighter", totalUnrealizedPnl >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
                   {totalUnrealizedPnl >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnl)}
                </div>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="border border-white/5 bg-white/5 rounded p-4 flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#00d4a3]"/> Best Trade</div>
                    <div className="text-xl font-bold text-white uppercase">{bestRealized ? bestRealized.symbol : '---'}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[#00d4a3] font-bold font-mono">+{formatCurrency(bestRealized?.pnl || 0)}</div>
                    <div className="text-[10px] font-bold uppercase text-[#00d4a3] bg-[#00d4a3]/10 px-1 rounded inline-block mt-1">+{bestRealized?.pnlPercent.toFixed(2)}%</div>
                 </div>
             </div>
             <div className="border border-white/5 bg-white/5 rounded p-4 flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-red-500 rotate-180"/> Worst Trade</div>
                    <div className="text-xl font-bold text-white uppercase">{worstRealized ? worstRealized.symbol : '---'}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-red-400 font-bold font-mono">{formatCurrency(worstRealized?.pnl || 0)}</div>
                    <div className="text-[10px] font-bold uppercase text-red-400 bg-red-400/10 px-1 rounded inline-block mt-1">{worstRealized?.pnlPercent.toFixed(2)}%</div>
                 </div>
             </div>
         </div>

         {/* Realized History Table */}
         <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-white/5 pb-2">Realized Trade History</h3>
            {realized.length === 0 ? (
               <div className="text-center py-8 text-gray-500 border border-white/5 rounded text-sm">No booked trades yet.</div>
            ) : (
               <div className="overflow-x-auto border border-white/5 rounded max-h-[300px]">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111] text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium text-right">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Buy Avg</th>
                        <th className="px-4 py-3 font-medium text-right">Sell Avg</th>
                        <th className="px-4 py-3 font-medium text-center">Days Held</th>
                        <th className="px-4 py-3 font-medium text-center">Tax Type</th>
                        <th className="px-4 py-3 font-medium text-right">Profit / Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {realized.map((t: any) => (
                         <tr key={t.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-bold text-white uppercase">{t.symbol}</td>
                            <td className="px-4 py-3 text-right font-mono">{t.qty}</td>
                            <td className="px-4 py-3 text-right font-mono text-gray-400">{formatCurrency(t.buyPrice)}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{formatCurrency(t.sellPrice)}</td>
                            <td className="px-4 py-3 text-center text-gray-400">{t.holdingPeriodDays}d</td>
                            <td className="px-4 py-3 text-center">
                               <Badge variant="outline" className="text-[9px]">{t.taxType}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <span className={cn("block font-bold font-mono", t.pnl >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
                                  {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
                               </span>
                               <span className={cn("text-[9px] uppercase tracking-widest font-bold", t.pnl >= 0 ? "text-[#00d4a3]" : "text-red-400")}>
                                  {t.pnl >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                               </span>
                            </td>
                         </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            )}
         </div>
      </div>
   );
}


// ============== IMPORT TRADE FORM COMPONENT ==============

function ImportTradeForm({ accounts, onClose, onImport }: any) {
  const [csvText, setCsvText] = useState('');

  const downloadTemplate = () => {
    const header = "Symbol,Qty,BuyPrice,BuyDate(YYYY-MM-DD),AccountName\n";
    const example = "RELIANCE,10,2500,2024-01-15,Zerodha - Main\nTCS,5,3800,2024-02-10,Groww - Wife";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demat_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Check if it's a valid CSV (at least contains symbol, qty, buyprice)
    if (!headers.includes('symbol') || !headers.includes('qty')) {
       alert("Invalid CSV format. Please use the template.");
       return;
    }

    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
       const row = lines[i].split(',').map(r => r.trim());
       if (row.length < 3) continue;

       const symbolData = row[headers.indexOf('symbol')];
       const qtyData = Number(row[headers.indexOf('qty')]);
       const priceData = Number(row[headers.indexOf('buyprice')]);
       const dateIdx = headers.indexOf('buydate(yyyy-mm-dd)');
       const dateData = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];
       
       const accIdx = headers.indexOf('accountname');
       let accId = accounts[0].id;
       if (accIdx !== -1 && row[accIdx]) {
          const matchAcc = accounts.find((a: any) => a.name.toLowerCase() === row[accIdx].toLowerCase());
          if (matchAcc) accId = matchAcc.id;
       }

       if (symbolData && !isNaN(qtyData) && !isNaN(priceData)) {
          const tr: DematTrade = {
            id: Date.now().toString() + "-" + i,
            accountId: accId,
            symbol: symbolData.toUpperCase(),
            name: symbolData.toUpperCase(),
            buyDate: dateData,
            buyPrice: priceData,
            qty: qtyData,
            exchange: 'NSE',
            tradeType: 'Delivery'
          };
          saveDematTrade(tr);
          importedCount++;
       }
    }

    alert(`Successfully imported ${importedCount} trades.`);
    onImport();
  };

  return (
    <div className="bg-[#151515] p-6 border border-white/10 rounded my-4 animate-in fade-in slide-in-from-top-2">
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d4a3] flex items-center gap-2"><Download className="w-4 h-4"/> Bulk Import Portfolio</h3>
          <button onClick={downloadTemplate} className="text-[10px] uppercase font-bold text-gray-400 hover:text-white underline underline-offset-4 decoration-white/20">Download CSV Template</button>
       </div>
       <form onSubmit={handleImport} className="space-y-4">
          <div>
             <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Paste CSV Content Here</label>
             <textarea 
                required 
                rows={6} 
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="Symbol,Qty,BuyPrice,BuyDate(YYYY-MM-DD),AccountName&#10;RELIANCE,10,2500,2024-01-15,Zerodha - Main" 
                className="w-full bg-[#111] border border-white/10 rounded p-3 text-sm text-gray-300 font-mono focus:border-[#00d4a3] outline-none placeholder:text-gray-700" 
             />
          </div>
          <div className="flex items-center justify-between">
             <span className="text-[10px] text-gray-500">Ensure AccountName matches EXACTLY to avoid defaulting to the first account.</span>
             <div className="flex items-center gap-3">
               <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">Cancel</button>
               <button type="submit" className="px-6 py-2 accent-bg text-black font-bold uppercase tracking-widest text-xs rounded hover:opacity-90 transition-colors">Import Trades</button>
             </div>
          </div>
       </form>
    </div>
  )
}

