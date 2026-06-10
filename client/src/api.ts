import axios from 'axios';
import { NiftyStatus, StockDetails } from './types';

// Mock API responses for stocks
const mockStocks: Record<string, Partial<StockDetails>> = {
  IRFC: { symbol: 'IRFC', name: 'Indian Railway Finance', price: 154.20, dma200: 130.50, rsScore: 85 },
  TCS: { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3954.00, dma200: 3800.00, rsScore: 60 },
  RELIANCE: { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2854.10, dma200: 2500.00, rsScore: 78 },
  ZOMATO: { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 184.50, dma200: 110.00, rsScore: 92 },
  HDFCBANK: { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1450.00, dma200: 1550.00, rsScore: 45 },
};

const API_URL = import.meta.env.VITE_API_URL || 'https://mock-api.alpha-harvester.com';

export async function fetchStockDetails(symbol: string): Promise<StockDetails> {
  const upperSymbol = symbol.toUpperCase();
  
  try {
    // Attempt real API call via Axios if enabled
    if (import.meta.env.VITE_API_URL) {
      const response = await axios.get(`${API_URL}/api/stocks/${upperSymbol}`);
      return response.data;
    }
  } catch (error) {
    console.warn("API call failed, falling back to mock data");
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  if (mockStocks[upperSymbol]) {
    return mockStocks[upperSymbol] as StockDetails;
  }
  
  // Return some generic generated data if not found in mock
  const randomPrice = Math.random() * 2000 + 50;
  return {
    symbol: upperSymbol,
    name: `${upperSymbol} Limited`,
    price: randomPrice,
    dma200: randomPrice * (Math.random() * 0.4 + 0.8), // 80% to 120% of current price
    rsScore: Math.floor(Math.random() * 100),
  };
}

export async function fetchNiftyStatus(): Promise<NiftyStatus> {
  try {
    if (import.meta.env.VITE_API_URL) {
      const response = await axios.get(`${API_URL}/api/nifty`);
      return response.data;
    }
  } catch (error) {
    console.warn("API call failed, falling back to mock data");
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    currentPrice: 22450.50,
    dma200: 20100.00,
    isBullish: true,
  };
}
