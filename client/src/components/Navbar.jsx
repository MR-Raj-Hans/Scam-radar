import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shield, Search, Menu, X, Bell, LogOut, User, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/feed', label: 'Scam Feed' },
    { to: '/search', label: 'Search' },
    { to: '/news', label: 'News Feed' },
    { to: '/trending', label: 'Trending' },
    { to: '/report', label: 'Report Scam', highlight: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-7 h-7 text-red group-hover:animate-glow transition-all" fill="currentColor" />
              <div className="absolute inset-0 bg-red/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Scam</span>
              <span className="text-red">Radar</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-red/20 text-red px-2 py-0.5 rounded-full border border-red/30 ml-1">
              <span className="glow-dot" />
              LIVE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, highlight }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  highlight
                    ? `btn-primary text-sm py-2 px-4 ml-2 ${isActive ? 'opacity-80' : ''}`
                    : `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive ? 'text-red bg-red/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link to="/search" className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all md:hidden">
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all border border-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-red/20 border border-red/30 flex items-center justify-center text-red text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white/80">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card border-white/10 shadow-xl py-1 animate-slide-in">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate">{user?.email}</p>
                      {user?.role !== 'user' && (
                        <span className="text-xs text-red bg-red/10 px-2 py-0.5 rounded-full mt-1 inline-block capitalize border border-red/30">
                          {user?.role}
                        </span>
                      )}
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'moderator') && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red/80 hover:text-red hover:bg-red/5 transition-all">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-navy/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, highlight }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    highlight
                      ? 'bg-red text-white'
                      : isActive
                      ? 'text-red bg-red/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
