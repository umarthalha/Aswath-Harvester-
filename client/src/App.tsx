/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Universe } from './pages/Universe';
import { Screener } from './pages/Screener';
import { Watchlist } from './pages/Watchlist';
import { PositionCalculator } from './pages/PositionCalculator';
import { Demat } from './pages/Demat';
import { Compounding } from './pages/Compounding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="universe" element={<Universe />} />
          <Route path="screener" element={<Screener />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="calculator" element={<PositionCalculator />} />
          <Route path="portfolio" element={<Demat />} />
          <Route path="compounding" element={<Compounding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
