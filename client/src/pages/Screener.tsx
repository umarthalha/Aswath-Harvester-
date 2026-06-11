import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Save, Search, CheckCircle2, XCircle } from 'lucide-react';
import { saveToWatchlist } from '../store/local-storage';
import { allUniverseData } from '../data/mockUniverse';

const CHECKLIST_ITEMS = [
  { id: 'rs', label: 'High Relative Strength vs Nifty 50', section: 'SECTION A - Trend & RS Filter' },
  { id: 'weekly_bullish', label: 'Weekly chart bullish trend', section: 'SECTION A - Trend & RS Filter' },
  { id: 'daily_bullish', label: 'Daily chart bullish trend', section: 'SECTION A - Trend & RS Filter' },
  { id: 'above_200dma', label: 'Price above 200 DMA', section: 'SECTION A - Trend & RS Filter' },
  
  { id: 'roce', label: 'ROCE > 15%', section: 'SECTION B - Fundamentals' },
  { id: 'roe', label: 'ROE > 15%', section: 'SECTION B - Fundamentals' },
  { id: 'debt_equity', label: 'Debt to Equity < 0.5', section: 'SECTION B - Fundamentals' },
  { id: 'sales_growth', label: 'Sales Growth > 12% (3 years)', section: 'SECTION B - Fundamentals' },
  { id: 'profit_growth', label: 'Profit Growth > 12% (3 years)', section: 'SECTION B - Fundamentals' },
  { id: 'fair_valuation', label: 'Fair Valuation (P/E reasonable)', section: 'SECTION B - Fundamentals' },
  
  { id: 'promoter_pledge', label: 'Promoter Pledging < 10%', section: 'SECTION C - Red Flags' },
  { id: 'no_sebi_asm', label: 'No SEBI ASM/GSM surveillance', section: 'SECTION C - Red Flags' },
  { id: 'no_corp_gov', label: 'No corporate governance issues', section: 'SECTION C - Red Flags' },
  
  { id: 'smart_money', label: 'Institutional volume footprints visible', section: 'SECTION D - Smart Money' },
];

export function Screener() {
  const [searchParams] = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || '';
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialSymbol) {
      const stock = allUniverseData.find(s => s.symbol === initialSymbol);
      if (stock) {
        setCompanyName(stock.name);
        setSector(stock.sector);
        // Pre-fill some checks based on mock data safely
        setChecks({
          'rs': stock.rsRatio >= 1,
          'weekly_bullish': stock.weeklyTrend === 'Bullish',
          'daily_bullish': stock.dailyTrend === 'Bullish',
          'above_200dma': stock.above200DMA,
          'roce': stock.roce >= 15,
          'roe': stock.roe >= 15,
          'debt_equity': stock.debtToEquity < 0.5,
          'sales_growth': stock.salesGrowth > 12,
          'profit_growth': stock.profitGrowth > 12,
          'promoter_pledge': stock.promoterPledge < 10,
          'no_sebi_asm': !stock.asmGsm,
        });
      }
    }
  }, [initialSymbol]);

  const handleToggle = (id: string) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isPass = score >= 10; // Passing arbitrary threshold
  
  const sections = Array.from(new Set(CHECKLIST_ITEMS.map(i => i.section)));

  const handleSave = () => {
    if (!symbol) {
      alert("Please enter a stock symbol");
      return;
    }
    const watchlistItem = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      name: companyName || symbol.toUpperCase(),
      sector,
      score,
      checklist: checks,
      timestamp: Date.now(),
    };
    saveToWatchlist(watchlistItem);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Stock Screener</h1>
        <p className="text-gray-400 mt-1">13-Point Entry Checklist</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stock Symbol</label>
              <input
                type="text"
                placeholder="e.g. RELIANCE"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4a3] transition-colors uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company Name <span className="opacity-50">(optional)</span></label>
              <input
                type="text"
                placeholder="Reliance Industries"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4a3] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sector <span className="opacity-50">(optional)</span></label>
              <input
                type="text"
                placeholder="Energy"
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4a3] transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-4 card rounded-xl sticky top-16 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] text-gray-500 block uppercase tracking-widest font-bold">Score</span>
            <span className={`text-2xl font-bold ${isPass ? 'accent-text' : 'text-yellow-400'}`}>
              {score}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div>
            {isPass ? (
              <Badge variant="success" className="px-3 py-1 text-xs"><CheckCircle2 className="w-3 h-3"/> Passed Setup</Badge>
            ) : (
              <Badge variant="warning" className="px-3 py-1 text-xs"><XCircle className="w-3 h-3"/> Requires Conviction</Badge>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={!symbol}
          className={`flex items-center gap-2 px-6 py-2.5 rounded font-bold text-sm uppercase tracking-widest transition-colors ${
            saved 
              ? 'bg-green-600 text-white cursor-default' 
              : 'accent-bg text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved' : 'Add to Watchlist'}
        </button>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <Card key={section}>
            <CardHeader className="bg-white/5 rounded-t-xl border-b border-white/5 py-4">
              <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{section}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {CHECKLIST_ITEMS.filter(i => i.section === section).map(item => (
                  <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!checks[item.id]}
                        onChange={() => handleToggle(item.id)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/10 bg-[#111] checked:border-[#00d4a3] checked:bg-[#00d4a3] transition-all"
                      />
                      <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={`text-sm select-none transition-colors ${checks[item.id] ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
