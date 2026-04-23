import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import FeedPage from './pages/FeedPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import TrendingPage from './pages/TrendingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ScamDetailPage from './pages/ScamDetailPage';
import NewsFeedPage from './pages/NewsFeedPage';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatWidget from './components/AIChatWidget';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-navy flex flex-col">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#00FF88', secondary: '#111827' } },
              error: { iconTheme: { primary: '#FF2D55', secondary: '#111827' } },
            }}
          />
          <Navbar />
          <main className="flex-1 pt-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/news" element={<NewsFeedPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/scam/:id" element={<ScamDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="text-8xl font-black text-red/20 mb-4">404</div>
                  <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
                  <p className="text-white/40 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <AIChatWidget />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
