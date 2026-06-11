import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Save, Wallet, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { getCompoundingEntries, saveCompoundingEntry } from '../store/local-storage';
import { CompoundingEntry } from '../types';

export function Compounding() {
  const [entries, setEntries] = useState<CompoundingEntry[]>([]);
  const [profitBooked, setProfitBooked] = useState<number | ''>('');
  const [reinvestPercent, setReinvestPercent] = useState<number>(100);

  useEffect(() => {
    setEntries(getCompoundingEntries().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, []);

  const profitNum = Number(profitBooked) || 0;
  const reinvestedAmt = profitNum * (reinvestPercent / 100);
  const withdrawnAmt = profitNum - reinvestedAmt;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profitNum <= 0) return;

    const entry: CompoundingEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      profitBooked: profitNum,
      reinvested: reinvestedAmt,
      withdrawn: withdrawnAmt,
    };
    saveCompoundingEntry(entry);
    setEntries(getCompoundingEntries().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setProfitBooked('');
  };

  const totalReinvested = entries.reduce((acc, e) => acc + e.reinvested, 0);
  const totalWithdrawn = entries.reduce((acc, e) => acc + e.withdrawn, 0);
  const totalProfitSum = entries.reduce((acc, e) => acc + e.profitBooked, 0);

  // Generate chart data (Cumulative Reinvested over time)
  let cumulative = 0;
  const chartData = entries.map(e => {
    cumulative += e.reinvested;
    return {
      date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
      CompoundingCapital: cumulative,
      Withdrawn: e.withdrawn,
    };
  });

  // Base starting capital for aesthetics if chart is empty
  if (chartData.length === 0) {
    chartData.push({ date: 'Start', CompoundingCapital: 0, Withdrawn: 0 });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Compounding Engine</h1>
          <p className="text-gray-400 mt-1">Track profit reinvestment and capital growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#0a1a15] to-[#111] border-[#00d4a3]/20">
          <CardHeader className="pb-2 border-none">
            <CardTitle className="text-[10px] uppercase font-bold tracking-widest accent-text flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Added to Compounding Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold accent-text italic">{formatCurrency(totalReinvested)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-none">
          <CardHeader className="pb-2 border-none">
            <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Realized Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalWithdrawn)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-none">
          <CardHeader className="pb-2 border-none">
            <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Total Profits Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalProfitSum)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-[#333]">
          <CardHeader className="border-b border-white/5 py-4 bg-white/5 rounded-t-xl">
            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Log Profit Entry</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Total Trade Profit Booked (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={profitBooked}
                  onChange={e => setProfitBooked(Number(e.target.value))}
                  className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-[#00d4a3] outline-none transition-colors"
                  placeholder="e.g. 5000"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  <span>Reinvestment Plan</span>
                  <span className="accent-text">{reinvestPercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={reinvestPercent}
                  onChange={e => setReinvestPercent(Number(e.target.value))}
                  className="w-full accent-[#00d4a3]"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-1">
                  <span>Withdraw 100%</span>
                  <span>50/50</span>
                  <span>Reinvest 100%</span>
                </div>
              </div>

              <div className="bg-white/5 rounded p-4 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Added to Capital:</span>
                  <span className="accent-text font-bold">+{formatCurrency(reinvestedAmt)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Withdrawn (Bank):</span>
                  <span className="text-white font-bold">+{formatCurrency(withdrawnAmt)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={profitNum <= 0}
                className="w-full accent-bg hover:opacity-90 text-black font-bold uppercase tracking-widest text-sm py-2.5 rounded transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Log
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-[#333]">
          <CardHeader className="border-b border-white/5 py-4 bg-white/5 rounded-t-xl">
            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Capital Compounding Curve</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReinvest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4a3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4a3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} dy={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} dx={-10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#00d4a3', fontWeight: 'bold' }}
                    labelStyle={{ color: '#999', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="CompoundingCapital" stroke="#00d4a3" strokeWidth={2} fillOpacity={1} fill="url(#colorReinvest)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {entries.length === 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Log your first profit entry to start visualizing your compounding curve.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="border-b border-white/5 py-4 bg-white/5 rounded-t-xl">
          <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-gray-500">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#111] text-gray-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Total Profit</th>
                <th className="px-6 py-4 font-medium text-right accent-text">Reinvested</th>
                <th className="px-6 py-4 font-medium text-right">Withdrawn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
              ) : (
                entries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors group border-l-4 border-transparent hover:border-active">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-white text-right">{formatCurrency(e.profitBooked)}</td>
                    <td className="px-6 py-4 font-bold accent-text text-right">+{formatCurrency(e.reinvested)}</td>
                    <td className="px-6 py-4 text-gray-300 text-right font-medium">{formatCurrency(e.withdrawn)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
