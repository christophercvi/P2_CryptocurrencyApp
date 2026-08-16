/* Design direction: Route orchestration for the Midnight Market Terminal experience. */
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { MarketDataProvider } from '@/contexts/MarketDataContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CreateAccountPage } from '@/pages/CreateAccountPage';
import { CoinDetailPage } from '@/pages/CoinDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { MarketOverviewPage } from '@/pages/MarketOverviewPage';
import { MarketsPage } from '@/pages/MarketsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { AppThemeProvider } from '@/theme/AppThemeProvider';

export default function App() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <AuthProvider>
          <MarketDataProvider>
            <WatchlistProvider>
              <BrowserRouter>
                <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-account" element={<CreateAccountPage />} />
              </Route>
              <Route element={<DashboardLayout />}>
                <Route index element={<MarketOverviewPage />} />
                <Route path="markets" element={<MarketsPage />} />
                <Route path="coin/:coinId" element={<CoinDetailPage />} />
                <Route
                  path="watchlist"
                  element={
                    <ProtectedRoute>
                      <WatchlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="portfolio"
                  element={
                    <ProtectedRoute>
                      <PortfolioPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
                </Routes>
              </BrowserRouter>
            </WatchlistProvider>
          </MarketDataProvider>
        </AuthProvider>
      </AppThemeProvider>
    </ErrorBoundary>
  );
}
