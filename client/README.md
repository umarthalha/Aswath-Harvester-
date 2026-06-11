# Alpha Harvester V3

A rule-based stock trading tracker and position sizer designed for Indian equity markets.

## Features

1. **Dashboard Overview**: Track market status (Nifty 50 vs 200 DMA) and current portfolio P&L in a professional terminal interface.
2. **Stock Screener**: 13-point objective checklist (Trend, Fundamentals, Red Flags, Smart Money) to validate trade setups before entering.
3. **Watchlist**: Save high-probability setups and score them automatically.
4. **Position Calculator (3:4:3 Rule)**: Dynamic layer calculator that determines position sizing, exact quantity for three anticipation layers, and strict stop-loss risk measurement.
5. **Portfolio Tracker**: Monitor precise quantities, layered entries, trailing P&L, and sector diversification. Strict limits alert you if active positions exceed 7.
6. **Compounding Engine**: Track realized profits, split withdrawals, and visualize compounding equity curves over time.

## Tech Stack
- Frontend: React 18, Vite
- Styling: Tailwind CSS
- Routing: React Router DOM
- Visualizations: Recharts
- Icons: Lucide React
- Persistence: LocalStorage (Offline Primary / Fallback ready)

## Architecture Notes
- This client-side application securely stores trade data directly in the browser's `localStorage`.
- No servers are needed to run the core features.
- All numbers are formatted using standard Indian Number systems (₹).

## Development
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```
