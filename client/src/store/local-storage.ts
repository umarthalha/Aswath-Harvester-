import { WatchlistItem, PortfolioTrade, CompoundingEntry } from '../types';

export const getWatchlist = (): WatchlistItem[] => {
  const data = localStorage.getItem('alpha_watchlist');
  return data ? JSON.parse(data) : [];
};

export const saveToWatchlist = (item: WatchlistItem) => {
  const list = getWatchlist();
  const index = list.findIndex(i => i.symbol === item.symbol);
  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }
  localStorage.setItem('alpha_watchlist', JSON.stringify(list));
};

export const removeFromWatchlist = (id: string) => {
  const list = getWatchlist().filter(i => i.id !== id);
  localStorage.setItem('alpha_watchlist', JSON.stringify(list));
};


export const getPortfolio = (): PortfolioTrade[] => {
  const data = localStorage.getItem('alpha_portfolio');
  return data ? JSON.parse(data) : [];
};

export const saveToPortfolio = (trade: PortfolioTrade) => {
  const list = getPortfolio();
  list.push(trade);
  localStorage.setItem('alpha_portfolio', JSON.stringify(list));
};

export const removeFromPortfolio = (id: string) => {
  const list = getPortfolio().filter(i => i.id !== id);
  localStorage.setItem('alpha_portfolio', JSON.stringify(list));
};

export const getCompoundingEntries = (): CompoundingEntry[] => {
  const data = localStorage.getItem('alpha_compounding');
  return data ? JSON.parse(data) : [];
};

export const saveCompoundingEntry = (entry: CompoundingEntry) => {
  const list = getCompoundingEntries();
  list.push(entry);
  localStorage.setItem('alpha_compounding', JSON.stringify(list));
};
