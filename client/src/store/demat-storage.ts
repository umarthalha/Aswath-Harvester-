import { DematAccount, DematTrade, RealizedTrade } from '../types';

export const getDematAccounts = (): DematAccount[] => {
  const data = localStorage.getItem('alpha_demat_accounts');
  if (data) return JSON.parse(data);
  return [];
};

export const saveDematAccount = (account: DematAccount) => {
  const accounts = getDematAccounts();
  if (accounts.length >= 4) return;
  accounts.push(account);
  localStorage.setItem('alpha_demat_accounts', JSON.stringify(accounts));
};

export const getDematTrades = (): DematTrade[] => {
  const data = localStorage.getItem('alpha_demat_trades');
  if (data) return JSON.parse(data);
  return [];
};

export const saveDematTrade = (trade: DematTrade) => {
  const trades = getDematTrades();
  trades.push(trade);
  localStorage.setItem('alpha_demat_trades', JSON.stringify(trades));
};

export const deleteDematTrade = (id: string) => {
  const trades = getDematTrades().filter(t => t.id !== id);
  localStorage.setItem('alpha_demat_trades', JSON.stringify(trades));
};

export const getRealizedTrades = (): RealizedTrade[] => {
  const data = localStorage.getItem('alpha_demat_realized');
  if (data) return JSON.parse(data);
  return [];
};

export const saveRealizedTrade = (trade: RealizedTrade) => {
  const realize = getRealizedTrades();
  realize.push(trade);
  localStorage.setItem('alpha_demat_realized', JSON.stringify(realize));
};

export const initialBrokers = [
  'Zerodha', 'Groww', 'Upstox', 'Angel One', 'ICICI Direct', 
  'HDFC Securities', 'Kotak Securities', '5Paisa', 'Motilal Oswal', 
  'Sharekhan', 'Other'
];

export const colorTags = [
  '#00d4a3', '#3b82f6', '#ec4899', '#fada5e', '#a855f7', '#64748b'
];
