export interface StockDetails {
  symbol: string;
  name: string;
  price: number;
  dma200: number;
  rsScore: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  score: number;
  sector?: string;
  checklist: Record<string, boolean>;
  timestamp: number;
}

export type LayerStatus = 'Layer 1 filled' | 'Layer 2 filled' | 'Full position' | 'Pending';

export interface PortfolioTrade {
  id: string;
  symbol: string;
  buyPrice: number;
  quantity: number;
  layerNumber: 1 | 2 | 3;
  date: string;
  sector?: string;
}

export interface NiftyStatus {
  currentPrice: number;
  dma200: number;
  isBullish: boolean;
}

export interface UniverseStock {
  symbol: string;
  name: string;
  sector: string;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';
  marketCapCr: number;
  indices: string[];
  price: number;
  rsRatio: number;
  above200DMA: boolean;
  checklistScore: number;
  roce: number;
  roe: number;
  debtToEquity: number;
  salesGrowth: number;
  profitGrowth: number;
  peRatio: number;
  weeklyTrend: 'Bullish' | 'Bearish';
  dailyTrend: 'Bullish' | 'Bearish';
  asmGsm: boolean;
  promoterPledge: number;
  averageVolume: number;
}

export interface ScannerFilters {
  indices: string[];
  marketCap: 'All' | 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';
  sectors: string[];
  minRsRatio: number;
  priceVs200Dma: 'All' | 'Above' | 'Below';
  weeklyTrend: 'All' | 'Bullish' | 'Bearish';
  dailyTrend: 'All' | 'Bullish' | 'Bearish';
  minChecklistScore: number;
  minRoce: number;
  minRoe: number;
  maxDebtToEquity: number;
  minSalesGrowth: number;
  minProfitGrowth: number;
  maxPeRatio: number;
  minMarketCapCr: number;
  maxMarketCapCr: number;
  excludeAsmGsm: boolean;
  excludeHighPledge: boolean;
  minPrice: number | '';
  minVolume: number | '';
}

export interface ScannerPreset {
  id: string;
  name: string;
  filters: ScannerFilters;
}

export interface DematAccount {
  id: string;
  name: string;
  broker: string;
  color: string;
}

export interface DematTrade {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  buyDate: string;
  buyPrice: number;
  qty: number;
  exchange: 'NSE' | 'BSE';
  tradeType: 'Delivery' | 'Intraday' | 'SIP';
  notes?: string;
  layerNumber?: 1 | 2 | 3;
}

export interface RealizedTrade {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  buyDate: string;
  buyPrice: number;
  sellDate: string;
  sellPrice: number;
  qty: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriodDays: number;
  taxType: 'STCG' | 'LTCG' | 'Intraday';
}

