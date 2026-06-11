import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Save, Download, ChevronDown, Filter, ChevronLeft, ChevronRight, Activity, Zap } from 'lucide-react';
import { allUniverseData, INDEX_LIST, SECTOR_LIST } from '../data/mockUniverse';
import { ScannerFilters, UniverseStock, ScannerPreset } from '../types';
import { getScannerPresets, saveScannerPreset, defaultFilters } from '../store/scanner-storage';
import { formatCurrency, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function Universe() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ScannerFilters>(defaultFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const presets = useMemo(() => getScannerPresets(), []);
  
  // Pagination and Sorting
  const [page, setPage] = useState(1);
  const itemsPerPage = 25;
  const [sortConfig, setSortConfig] = useState<{ key: keyof UniverseStock; direction: 'asc'|'desc' } | null>({ key: 'rsRatio', direction: 'desc' });

  // Filter Logic
  const filteredStocks = useMemo(() => {
    return allUniverseData.filter(stock => {
      // Index Filter
      if (filters.indices.length > 0 && !stock.indices.some(idx => filters.indices.includes(idx))) return false;
      
      // Market Cap Filter
      if (filters.marketCap !== 'All' && stock.marketCapCategory !== filters.marketCap) return false;
      
      // Sector Filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(stock.sector)) return false;
      
      // Alpha Filters
      if (stock.rsRatio < filters.minRsRatio) return false;
      if (filters.priceVs200Dma === 'Above' && !stock.above200DMA) return false;
      if (filters.priceVs200Dma === 'Below' && stock.above200DMA) return false;
      if (filters.weeklyTrend !== 'All' && stock.weeklyTrend !== filters.weeklyTrend) return false;
      if (filters.dailyTrend !== 'All' && stock.dailyTrend !== filters.dailyTrend) return false;
      if (stock.checklistScore < filters.minChecklistScore) return false;

      // Fundamentals
      if (stock.roce < filters.minRoce) return false;
      if (stock.roe < filters.minRoe) return false;
      if (stock.debtToEquity > filters.maxDebtToEquity) return false;
      if (stock.salesGrowth < filters.minSalesGrowth) return false;
      if (stock.profitGrowth < filters.minProfitGrowth) return false;
      if (stock.peRatio > filters.maxPeRatio) return false;
      if (stock.marketCapCr < filters.minMarketCapCr || stock.marketCapCr > filters.maxMarketCapCr) return false;

      // Safety
      if (filters.excludeAsmGsm && stock.asmGsm) return false;
      if (filters.excludeHighPledge && stock.promoterPledge > 10) return false;
      if (filters.minPrice !== '' && stock.price < Number(filters.minPrice)) return false;
      if (filters.minVolume !== '' && stock.averageVolume < Number(filters.minVolume)) return false;

      return true;
    });
  }, [filters]);

  const sortedStocks = useMemo(() => {
    let sortableItems = [...filteredStocks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStocks, sortConfig]);

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const paginatedStocks = sortedStocks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const requestSort = (key: keyof UniverseStock) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleApplyPreset = (preset: ScannerPreset) => {
    setFilters(preset.filters);
    setPage(1);
  };

  const handleSavePreset = () => {
    const name = prompt("Enter a name for your preset:");
    if (name) {
      saveScannerPreset({
        id: Date.now().toString(),
        name,
        filters
      });
      alert("Preset saved!");
    }
  };

  const exportCSV = () => {
    const headers = "Symbol,Name,Sector,Market Cap Category,Price,RS Ratio,200 DMA Status,Score,ROCE,D/E,Weekly Trend\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + sortedStocks.map(e => 
      `${e.symbol},"${e.name}",${e.sector},${e.marketCapCategory},${e.price},${e.rsRatio.toFixed(2)},${e.above200DMA ? 'Above' : 'Below'},${e.checklistScore},${e.roce.toFixed(2)},${e.debtToEquity.toFixed(2)},${e.weeklyTrend}`
    ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alpha_harvester_scan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleIndex = (idx: string) => {
    setFilters(prev => ({
      ...prev,
      indices: prev.indices.includes(idx) ? prev.indices.filter(i => i !== idx) : [...prev.indices, idx]
    }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-8 h-8 accent-text" fill="currentColor"/> Universe Scanner
          </h1>
          <p className="text-gray-400 mt-1">Multi-factor algorithmic screening</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.slice(0, 4).map(p => (
            <button 
              key={p.id} 
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors text-gray-300 hover:text-white"
            >
              {p.name}
            </button>
          ))}
          <select 
            onChange={(e) => {
              const p = presets.find(x => x.id === e.target.value);
              if (p) handleApplyPreset(p);
              e.target.value = "";
            }}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 rounded text-gray-300 outline-none"
          >
            <option value="">More Presets...</option>
            {presets.slice(4).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <div className={cn("flex flex-col w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden transition-all duration-300", 
          isSidebarOpen ? "translate-x-0" : "-ml-80 hidden"
        )}>
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4"/> Filters
            </h2>
            <button onClick={handleReset} className="text-[10px] uppercase text-gray-500 hover:text-white font-bold transition-colors">Reset</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 sidebar-scroll">
            
            {/* Strategy Filters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Alpha Harvester Rules</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold flex justify-between">
                  <span>Min RS Ratio vs Nifty</span>
                  <span className="accent-text">{filters.minRsRatio.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="2" step="0.1" value={filters.minRsRatio} onChange={e => setFilters({...filters, minRsRatio: Number(e.target.value)})} className="w-full accent-[#00d4a3] h-1" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold">Price vs 200 DMA</label>
                <select value={filters.priceVs200Dma} onChange={e => setFilters({...filters, priceVs200Dma: e.target.value as any})} className="w-full bg-[#111] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
                  <option value="All">All</option>
                  <option value="Above">Price &gt; 200 DMA</option>
                  <option value="Below">Price &lt; 200 DMA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold flex justify-between">
                  <span>Min Checklist Score</span>
                  <span className="accent-text">{filters.minChecklistScore}/13</span>
                </label>
                <input type="range" min="0" max="13" step="1" value={filters.minChecklistScore} onChange={e => setFilters({...filters, minChecklistScore: Number(e.target.value)})} className="w-full accent-[#00d4a3] h-1" />
              </div>
            </div>

            {/* Indices */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Index Category</h3>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                {INDEX_LIST.map(idx => (
                  <label key={idx} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white cursor-pointer">
                    <input type="checkbox" checked={filters.indices.includes(idx)} onChange={() => toggleIndex(idx)} 
                           className="w-3.5 h-3.5 rounded border-white/10 bg-[#111] accent-[#00d4a3]" />
                    {idx}
                  </label>
                ))}
              </div>
            </div>

            {/* Market Cap */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Market Cap</h3>
              <div className="space-y-2">
                {['All', 'Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap'].map(cap => (
                  <label key={cap} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input type="radio" name="mcap" value={cap} checked={filters.marketCap === cap} onChange={() => setFilters({...filters, marketCap: cap as any})} 
                           className="accent-[#00d4a3]" />
                    {cap}
                  </label>
                ))}
              </div>
            </div>

            {/* Fundamentals */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Fundamentals</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold flex justify-between">
                  <span>Min ROCE %</span>
                  <span className="accent-text">{filters.minRoce}%</span>
                </label>
                <input type="range" min="0" max="50" step="1" value={filters.minRoce} onChange={e => setFilters({...filters, minRoce: Number(e.target.value)})} className="w-full accent-[#00d4a3] h-1" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold flex justify-between">
                  <span>Max D/E Ratio</span>
                  <span className="accent-text">{filters.maxDebtToEquity.toFixed(1)}</span>
                </label>
                <input type="range" min="0" max="3" step="0.1" value={filters.maxDebtToEquity} onChange={e => setFilters({...filters, maxDebtToEquity: Number(e.target.value)})} className="w-full accent-[#00d4a3] h-1" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 font-bold flex justify-between">
                  <span>Min Profit Growth %</span>
                  <span className="accent-text">{filters.minProfitGrowth}%</span>
                </label>
                <input type="range" min="0" max="50" step="1" value={filters.minProfitGrowth} onChange={e => setFilters({...filters, minProfitGrowth: Number(e.target.value)})} className="w-full accent-[#00d4a3] h-1" />
              </div>
            </div>

            {/* Safety */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Safety Filters</h3>
              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                <span>Exclude ASM/GSM</span>
                <input type="checkbox" checked={filters.excludeAsmGsm} onChange={(e) => setFilters({...filters, excludeAsmGsm: e.target.checked})} className="accent-[#00d4a3] w-4 h-4 rounded" />
              </label>
              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer mt-2">
                <span>Exclude Pledge &gt;10%</span>
                <input type="checkbox" checked={filters.excludeHighPledge} onChange={(e) => setFilters({...filters, excludeHighPledge: e.target.checked})} className="accent-[#00d4a3] w-4 h-4 rounded" />
              </label>
            </div>

          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Results Header */}
          <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded flex items-center justify-center text-gray-400 transition-colors">
                <Filter className="w-5 h-5"/>
              </button>
              <div>
                <span className="font-bold text-lg text-white">{filteredStocks.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-2">Matches Found</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSavePreset} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-widest transition-colors text-white">
                <Save className="w-3 h-3"/> Save Preset
              </button>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 accent-bg hover:opacity-90 rounded text-xs font-bold uppercase tracking-widest transition-colors text-black">
                <Download className="w-3 h-3"/> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col relative">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
                <thead className="bg-[#111] text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white" onClick={() => requestSort('symbol')}>Stock Symbol {sortConfig?.key === 'symbol' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium">Name & Sector</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white" onClick={() => requestSort('marketCapCr')}>Market Cap {sortConfig?.key === 'marketCapCr' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white text-right" onClick={() => requestSort('price')}>CMP {sortConfig?.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white text-right" onClick={() => requestSort('rsRatio')}>RS Ratio {sortConfig?.key === 'rsRatio' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white text-center" onClick={() => requestSort('above200DMA')}>200 DMA {sortConfig?.key === 'above200DMA' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white text-center" onClick={() => requestSort('checklistScore')}>Score {sortConfig?.key === 'checklistScore' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-white text-right" onClick={() => requestSort('roce')}>ROCE {sortConfig?.key === 'roce' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 font-medium text-center">Trend</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedStocks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-500 font-medium">No stocks match all the selected criteria. Try relaxing your filters.</td>
                    </tr>
                  ) : (
                    paginatedStocks.map((stock) => {
                      let rowStyle = "";
                      if (stock.checklistScore >= 11) rowStyle = "bg-green-900/10 hover:bg-green-900/20";
                      else if (stock.checklistScore >= 8) rowStyle = "bg-yellow-900/10 hover:bg-yellow-900/20";
                      else rowStyle = "hover:bg-white/5";

                      return (
                        <tr key={stock.symbol} className={cn("border-l-4 border-transparent transition-colors group", rowStyle)}>
                          <td className="px-4 py-3">
                            <span className="font-bold text-white block cursor-pointer" onClick={() => navigate(`/screener?symbol=${stock.symbol}`)}>{stock.symbol}</span>
                            {stock.indices.slice(0,1).map(idx => (
                              <span key={idx} className="text-[9px] text-gray-500 border border-white/10 rounded px-1 mt-1 inline-block">{idx}</span>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300 max-w-[200px] truncate text-sm" title={stock.name}>{stock.name}</div>
                            <div className="text-[10px] text-gray-500 uppercase">{stock.sector}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{stock.marketCapCategory}</Badge>
                            <div className="text-xs text-gray-500 mt-1">₹{Math.round(stock.marketCapCr)}Cr</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-white">
                            {formatCurrency(stock.price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn("font-bold text-sm", stock.rsRatio >= 1 ? 'text-green-400' : 'text-gray-400')}>{stock.rsRatio.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {stock.above200DMA ? (
                              <Badge variant="success" className="px-2 py-0.5">Above ✅</Badge>
                            ) : (
                              <Badge variant="danger" className="px-2 py-0.5">Below ❌</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                             <div className={cn(
                               "inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-xs",
                               stock.checklistScore >= 11 ? "border-green-500 text-green-400" : 
                               stock.checklistScore >= 8 ? "border-yellow-500 text-yellow-400" : 
                               "border-red-500/50 text-red-400"
                             )}>
                               {stock.checklistScore}
                             </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                             <span className={cn("font-medium", stock.roce >= 15 ? 'text-green-400' : 'text-gray-400')}>{stock.roce.toFixed(1)}%</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                             <div className="flex flex-col gap-1 items-center">
                               {stock.weeklyTrend === 'Bullish' ? 
                                  <span className="text-[9px] bg-green-500/20 text-green-400 px-1 rounded uppercase font-bold tracking-widest">W.BULL</span> :
                                  <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded uppercase font-bold tracking-widest">W.BEAR</span>
                               }
                             </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => navigate(`/screener?symbol=${stock.symbol}`)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-widest transition-colors text-white"
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Box */}
            <div className="bg-[#111] border-t border-white/5 p-3 flex items-center justify-between text-sm">
              <div className="text-gray-500 font-medium">
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredStocks.length)} of {filteredStocks.length}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5"/>
                </button>
                <div className="text-[10px] uppercase font-bold tracking-widest text-white px-2">Page {page} / {Math.max(1, totalPages)}</div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
