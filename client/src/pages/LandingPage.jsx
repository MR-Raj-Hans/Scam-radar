import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Search, AlertTriangle, TrendingUp, Users, Database, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import CountUp from 'react-countup';
import ScamCard, { ScamCardSkeleton } from '../components/ScamCard';
import UniversalChecker from '../components/UniversalChecker';
import api from '../utils/api';
import { SCAM_TYPES } from '../utils/constants';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('auto');
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [recentScams, setRecentScams] = useState([]);
  const [loadingScams, setLoadingScams] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendingRes, scamsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/scams/trending?days=7'),
          api.get('/scams?limit=6&status=verified&sort=newest'),
        ]);
        setStats(statsRes.data.stats);
        setTrending(trendingRes.data.trendingByType || []);
        setRecentScams(scamsRes.data.scams || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingScams(false);
      }
    };
    fetchData();
  }, []);



  return (
    <div className="animate-fade-in">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-hero-gradient">
          <div className="absolute inset-0 bg-glow-red opacity-40" />
          <div className="scan-line" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,45,85,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,85,0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red/10 border border-red/20 text-red text-sm font-semibold px-4 py-2 rounded-full mb-8 animate-fade-up">
            <span className="glow-dot" />
            India's #1 Scam Detection Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text">Detect Scams.</span>
            <br />
            <span className="text-white">Protect Yourself.</span>
            <br />
            <span className="text-white/60">Stay Safe Online.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Search any phone number, email, UPI ID or website to instantly check if it's been reported as a scam. Community-powered, AI-enhanced protection.
          </p>

          {/* Universal Checker */}
          <div className="mx-auto" style={{ animationDelay: '0.3s' }}>
            <UniversalChecker />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/report" className="btn-outline flex items-center gap-2 text-sm py-2 px-5">
              <AlertTriangle className="w-4 h-4" /> Report a Scam
            </Link>
            <Link to="/feed" className="btn-secondary flex items-center gap-2 text-sm py-2 px-5">
              <Database className="w-4 h-4" /> View Scam Database
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Live Stats ────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5 bg-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: AlertTriangle, label: 'Scams Reported', value: stats?.totalScams || 0, suffix: '+', color: '#FF2D55' },
              { icon: Users, label: 'Users Protected', value: stats?.usersProtected || 0, suffix: '+', color: '#00B4FF' },
              { icon: Database, label: 'Blacklisted', value: stats?.totalBlacklisted || 0, suffix: '', color: '#FFD700' },
              { icon: Shield, label: 'Verified Scams', value: stats?.verifiedScams || 0, suffix: '', color: '#00FF88' },
            ].map(({ icon: Icon, label, value, suffix, color }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-2xl md:text-3xl font-black" style={{ color }}>
                  {value > 0 ? <CountUp end={value} duration={2} separator="," suffix={suffix} /> : '—'}
                </div>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Scam Categories ───────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Scam Categories</h2>
            <p className="text-white/40 text-sm mt-1">Browse by type to understand and identify common scams</p>
          </div>
          <Link to="/feed" className="text-sm text-red hover:text-red-light flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SCAM_TYPES.map(({ value, label, color, icon }) => {
            const count = trending.find((t) => t.type === value)?.count || 0;
            return (
              <Link
                key={value}
                to={`/feed?type=${encodeURIComponent(value)}`}
                className="card p-5 text-center group flex flex-col items-center gap-3"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-red/80 transition-colors">{label}</p>
                  {count > 0 && <p className="text-xs text-white/30 mt-0.5">{count} this week</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Trending Scams ────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="py-12 bg-navy-light/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-red" />
                  <h2 className="section-title">Trending This Week</h2>
                </div>
                <p className="text-white/40 text-sm">Most reported scam types in the last 7 days</p>
              </div>
              <Link to="/trending" className="text-sm text-red hover:text-red-light flex items-center gap-1 transition-colors">
                Full Analysis <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trending.slice(0, 6).map(({ type, count, totalUpvotes }, i) => (
                <Link
                  key={type}
                  to={`/feed?type=${encodeURIComponent(type)}`}
                  className="card p-4 flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white/10">#{i + 1}</span>
                    <Zap className="w-4 h-4 text-red opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm font-bold text-white capitalize">{type}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red rounded-full"
                        style={{ width: `${Math.min((count / (trending[0]?.count || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-red font-bold">{count}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Recent Scams ──────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Latest Reports</h2>
            <p className="text-white/40 text-sm mt-1">Recently verified scams from the community</p>
          </div>
          <Link to="/feed" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingScams
            ? Array.from({ length: 6 }).map((_, i) => <ScamCardSkeleton key={i} />)
            : recentScams.map((scam) => <ScamCard key={scam._id} scam={scam} />)
          }
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-red opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Encountered a Scam?
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Help protect thousands of Indians by reporting the scam. Takes 2 minutes. Our AI + community will verify it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/report" className="btn-primary flex items-center gap-2 text-base py-3 px-8">
              <AlertTriangle className="w-5 h-5" /> Report Now — It's Free
            </Link>
            <Link to="/search" className="btn-secondary flex items-center gap-2 text-base py-3 px-8">
              <Search className="w-5 h-5" /> Check Blacklist
            </Link>
          </div>
          <p className="text-xs text-white/30 mt-6">
            Emergency Cyber Crime Helpline: <strong className="text-red text-sm">1930</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
