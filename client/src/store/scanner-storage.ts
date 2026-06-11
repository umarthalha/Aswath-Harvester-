import { ScannerFilters, ScannerPreset } from '../types';

export const getScannerPresets = (): ScannerPreset[] => {
  const data = localStorage.getItem('alpha_scanner_presets');
  if (data) return JSON.parse(data);

  // Default presets
  return [
    {
      id: 'default-1',
      name: 'Alpha Harvester Ready',
      filters: { ...defaultFilters, minRsRatio: 1.0, priceVs200Dma: 'Above', minChecklistScore: 10, excludeAsmGsm: true }
    },
    {
      id: 'default-2',
      name: 'Nifty 50 Bullish',
      filters: { ...defaultFilters, indices: ['Nifty 50'], priceVs200Dma: 'Above', weeklyTrend: 'Bullish' }
    },
    {
      id: 'default-3',
      name: 'Midcap Opportunities',
      filters: { ...defaultFilters, indices: ['Nifty Midcap 150'], minRsRatio: 1.0, minRoce: 15 }
    },
    {
      id: 'default-4',
      name: 'Small Cap Gems',
      filters: { ...defaultFilters, indices: ['Nifty Smallcap 250'], maxDebtToEquity: 0.5, minProfitGrowth: 15 }
    },
    {
      id: 'default-5',
      name: 'Large Cap Safe',
      filters: { ...defaultFilters, marketCap: 'Large Cap', minRoce: 20, maxDebtToEquity: 0.3 }
    },
    {
      id: 'default-6',
      name: 'High RS Momentum',
      filters: { ...defaultFilters, minRsRatio: 1.5, priceVs200Dma: 'Above' }
    }
  ];
};

export const saveScannerPreset = (preset: ScannerPreset) => {
  const presets = getScannerPresets();
  presets.push(preset);
  localStorage.setItem('alpha_scanner_presets', JSON.stringify(presets));
};

export const defaultFilters: ScannerFilters = {
  indices: [],
  marketCap: 'All',
  sectors: [],
  minRsRatio: 0,
  priceVs200Dma: 'All',
  weeklyTrend: 'All',
  dailyTrend: 'All',
  minChecklistScore: 0,
  minRoce: 0,
  minRoe: 0,
  maxDebtToEquity: 3,
  minSalesGrowth: 0,
  minProfitGrowth: 0,
  maxPeRatio: 100,
  minMarketCapCr: 0,
  maxMarketCapCr: 1000000,
  excludeAsmGsm: true,
  excludeHighPledge: true,
  minPrice: '',
  minVolume: ''
};
