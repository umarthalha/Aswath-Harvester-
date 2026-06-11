import { UniverseStock } from '../types';

const SECTORS = [
  'Banking & Finance', 'IT & Technology', 'Pharma & Healthcare', 'Auto & Auto Ancillary',
  'FMCG & Consumer', 'Energy & Oil & Gas', 'Metals & Mining', 'Infrastructure & Construction',
  'Real Estate', 'Chemicals & Fertilizers', 'Telecom', 'Media & Entertainment',
  'Textiles', 'Agriculture & Food', 'Defence & Aerospace'
];

const INDICES = [
  'Nifty 50', 'Nifty Next 50', 'Nifty 100', 'Nifty 200', 'Nifty 500', 
  'Nifty Midcap 50', 'Nifty Midcap 100', 'Nifty Midcap 150', 'Nifty Midcap Select', 
  'Nifty Smallcap 50', 'Nifty Smallcap 100', 'Nifty Smallcap 250', 
  'Nifty Largecap 250', 'Nifty LargeMidcap 250', 'Nifty MicroCap 250', 
  'Nifty Total Market', 'Nifty Alpha 50', 'Nifty High Beta 50', 
  'Nifty Low Volatility 50', 'Nifty Quality 30'
];

const CAPS = ['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap'] as const;

function randomElement<T>(arr: T[] | readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateMockStocks(count: number): UniverseStock[] {
  const stocks: UniverseStock[] = [];
  
  for (let i = 0; i < count; i++) {
    const symbol = `STOCK${i + 1}`;
    const mcCat = randomElement(CAPS);
    
    let mcCr = 0;
    if (mcCat === 'Large Cap') mcCr = randomFloat(50000, 1000000);
    else if (mcCat === 'Mid Cap') mcCr = randomFloat(10000, 50000);
    else if (mcCat === 'Small Cap') mcCr = randomFloat(2000, 10000);
    else mcCr = randomFloat(100, 2000);

    const price = randomFloat(10, 10000);
    
    // Assign 1-3 random indices
    const numIndices = Math.floor(Math.random() * 3) + 1;
    const stockIndices = new Set<string>();
    for (let j=0; j<numIndices; j++) stockIndices.add(randomElement(INDICES));
    
    // Nifty 50 only for Large Caps typically, let's just make it slightly realistic
    if (mcCat === 'Large Cap' && Math.random() > 0.5) stockIndices.add('Nifty 50');

    stocks.push({
      symbol,
      name: `${symbol} Limited`,
      sector: randomElement(SECTORS),
      marketCapCategory: mcCat,
      marketCapCr: mcCr,
      indices: Array.from(stockIndices),
      price,
      rsRatio: randomFloat(0.2, 2.0),
      above200DMA: Math.random() > 0.4,
      checklistScore: Math.floor(Math.random() * 14),
      roce: randomFloat(-10, 45),
      roe: randomFloat(-15, 40),
      debtToEquity: randomFloat(0, 3.5),
      salesGrowth: randomFloat(-10, 40),
      profitGrowth: randomFloat(-20, 50),
      peRatio: randomFloat(5, 120),
      weeklyTrend: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
      dailyTrend: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
      asmGsm: Math.random() > 0.85,  // 15% chance of being in ASM/GSM
      promoterPledge: Math.random() > 0.7 ? randomFloat(10, 50) : randomFloat(0, 5),
      averageVolume: Math.floor(randomFloat(10000, 5000000)),
    });
  }

  return stocks;
}

// Generate 400 mock stocks
export const universeData = generateMockStocks(400);

// Specific popular stocks for realistic feel
export const POPULAR_STOCKS: UniverseStock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy & Oil & Gas', marketCapCategory: 'Large Cap', marketCapCr: 1950000, indices: ['Nifty 50', 'Nifty 100'], price: 2950, rsRatio: 1.1, above200DMA: true, checklistScore: 11, roce: 12, roe: 10, debtToEquity: 0.4, salesGrowth: 15, profitGrowth: 12, peRatio: 25, weeklyTrend: 'Bullish', dailyTrend: 'Bullish', asmGsm: false, promoterPledge: 0, averageVolume: 6500000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT & Technology', marketCapCategory: 'Large Cap', marketCapCr: 1450000, indices: ['Nifty 50', 'Nifty 100'], price: 3950, rsRatio: 0.9, above200DMA: true, checklistScore: 10, roce: 55, roe: 45, debtToEquity: 0.05, salesGrowth: 14, profitGrowth: 10, peRatio: 30, weeklyTrend: 'Bullish', dailyTrend: 'Bearish', asmGsm: false, promoterPledge: 0, averageVolume: 2500000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking & Finance', marketCapCategory: 'Large Cap', marketCapCr: 1150000, indices: ['Nifty 50', 'Nifty Bank'], price: 1450, rsRatio: 0.8, above200DMA: false, checklistScore: 8, roce: 8, roe: 16, debtToEquity: 1.2, salesGrowth: 18, profitGrowth: 19, peRatio: 15, weeklyTrend: 'Bearish', dailyTrend: 'Bullish', asmGsm: false, promoterPledge: 0, averageVolume: 18500000 },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'FMCG & Consumer', marketCapCategory: 'Large Cap', marketCapCr: 160000, indices: ['Nifty 100'], price: 184, rsRatio: 1.8, above200DMA: true, checklistScore: 12, roce: 4, roe: 5, debtToEquity: 0.01, salesGrowth: 55, profitGrowth: 120, peRatio: 95, weeklyTrend: 'Bullish', dailyTrend: 'Bullish', asmGsm: false, promoterPledge: 0, averageVolume: 50000000 },
  { symbol: 'IRFC', name: 'Indian Railway Finance', sector: 'Banking & Finance', marketCapCategory: 'Mid Cap', marketCapCr: 195000, indices: ['Nifty Midcap 100'], price: 150, rsRatio: 1.5, above200DMA: true, checklistScore: 9, roce: 5, roe: 14, debtToEquity: 8.5, salesGrowth: 20, profitGrowth: 25, peRatio: 32, weeklyTrend: 'Bullish', dailyTrend: 'Bearish', asmGsm: false, promoterPledge: 0, averageVolume: 80000000 },
  { symbol: 'SUZLON', name: 'Suzlon Energy', sector: 'Energy & Oil & Gas', marketCapCategory: 'Mid Cap', marketCapCr: 55000, indices: ['Nifty Midcap 100'], price: 42, rsRatio: 1.6, above200DMA: true, checklistScore: 6, roce: 22, roe: -5, debtToEquity: 2.1, salesGrowth: 10, profitGrowth: 8, peRatio: 85, weeklyTrend: 'Bullish', dailyTrend: 'Bullish', asmGsm: true, promoterPledge: 15, averageVolume: 120000000 },
];

export const allUniverseData = [...POPULAR_STOCKS, ...universeData];

export const SECTOR_LIST = SECTORS;
export const INDEX_LIST = INDICES;
