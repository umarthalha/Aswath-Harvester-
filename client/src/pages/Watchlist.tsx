import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Trash2, ExternalLink, Calculator } from 'lucide-react';
import { getWatchlist, removeFromWatchlist } from '../store/local-storage';
import { WatchlistItem } from '../types';
import { Link } from 'react-router-dom';

export function Watchlist() {
  const [list, setList] = useState<WatchlistItem[]>([]);
  const [filterScore, setFilterScore] = useState<number | 'all'>('all');

  useEffect(() => {
    setList(getWatchlist());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this from the watchlist?')) {
      removeFromWatchlist(id);
      setList(getWatchlist());
    }
  };

  const filteredList = list.filter(item => {
    if (filterScore === 'all') return true;
    return item.score >= filterScore;
  }).sort((a,b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Watchlist</h1>
          <p className="text-gray-400 mt-1">Shortlisted high-probability setups</p>
        </div>
        <div className="flex bg-[#1a1a1a] border border-[#333] rounded-lg p-1">
          {[
            { label: 'All', value: 'all' },
            { label: 'Score 10+', value: 10 },
            { label: 'Score 12+', value: 12 },
          ].map(f => (
            <button
              key={f.label}
              onClick={() => setFilterScore(f.value as any)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterScore === f.value ? 'bg-[#333] text-white font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Sector</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No stocks found in the watchlist. Go to the Screener to add some.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 border-l-4 border-transparent hover:border-active transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{item.symbol}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        {item.sector ? <Badge variant="outline">{item.sector}</Badge> : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.score >= 10 ? 'success' : 'warning'}>
                          {item.score}/14
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <Link 
                          to={`/calculator?symbol=${item.symbol}`}
                          className="text-gray-400 hover:accent-text transition-colors"
                          title="Open in Calculator"
                        >
                          <Calculator className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
