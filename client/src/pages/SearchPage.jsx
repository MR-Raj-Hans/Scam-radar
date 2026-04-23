import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertTriangle, CheckCircle, Phone, Mail, CreditCard, Link2, Building2, Filter, Loader } from 'lucide-react';
import api from '../utils/api';
import RiskBadge from '../components/RiskBadge';
import { BLACKLIST_TYPES } from '../utils/constants';

const TYPE_ICONS = { phone: Phone, email: Mail, UPI: CreditCard, URL: Link2, bank_account: Building2 };

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-search if URL has query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setQuery(q);
      performSearch(q, '');
    }
  }, []);

  const performSearch = async (q, type = typeFilter) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ value: q.trim() });
      if (type) params.append('type', type);
      const { data } = await api.get(`/blacklist/check?${params}`);
      setResult(data);
    } catch (err) {
      setResult({ success: false, found: false, riskLevel: 'SAFE', message: 'Search failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    performSearch(query, typeFilter);
  };

  const detectType = (val) => {
    if (/^\d{10}$/.test(val.trim())) return 'phone';
    if (/^\S+@\S+\.\S+$/.test(val.trim()) && !val.includes('@upi')) return 'email (possible)';
    if (val.includes('@') && !val.includes(' ') && !val.includes('.')) return 'UPI';
    if (val.startsWith('http') || val.includes('.com') || val.includes('.in')) return 'URL';
    return null;
  };

  const detectedType = query ? detectType(query) : null;

  return (
    <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-red/10 border border-red/20 text-red text-sm font-semibold px-4 py-2 rounded-full mb-4">
          <Search className="w-4 h-4" /> Blacklist Search
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
          Is It a <span className="gradient-text">Scam?</span>
        </h1>
        <p className="text-white/40">Instantly check if a phone number, email, UPI ID, URL or bank account is flagged</p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              id="blacklist-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter phone, email, UPI, URL or bank account..."
              className="input-field pl-10 text-base"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="">Auto-detect</option>
            {BLACKLIST_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
          <button type="submit" id="search-btn" className="btn-primary flex items-center gap-2 justify-center">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {/* Auto-detection hint */}
        {detectedType && (
          <p className="text-xs text-white/40">
            🔍 Detected as: <strong className="text-accent-blue">{detectedType}</strong>
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-white/30">Try:</span>
          {['9876543210', 'lottery@kbc-winner.net', 'sbi-secure-login.xyz', '9fraudupi@okaxis'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setQuery(ex); performSearch(ex, ''); setSearchParams({ q: ex }); }}
              className="text-xs text-accent-blue/70 hover:text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded border border-accent-blue/10 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="card p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-red/20 border-t-red animate-spin" />
          </div>
          <p className="text-white/60 font-medium">Scanning blacklist database...</p>
          <p className="text-sm text-white/30 mt-1">Searching across verified reports</p>
        </div>
      )}

      {!loading && searched && result && (
        <div className="animate-fade-up">
          {/* Risk Banner */}
          <div className={`rounded-2xl border p-6 mb-6 ${
            result.riskLevel === 'HIGH' ? 'bg-red/10 border-red/30' :
            result.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30' :
            result.riskLevel === 'LOW' ? 'bg-orange-500/10 border-orange-500/30' :
            'bg-accent-green/10 border-accent-green/30'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                {result.found ? (
                  <div className="w-14 h-14 rounded-full bg-red/20 border-2 border-red/40 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-accent-green/20 border-2 border-accent-green/40 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-accent-green" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <RiskBadge level={result.riskLevel} size="lg" />
                  {result.found && (
                    <span className="text-sm font-bold text-white">
                      {result.totalReports} total report{result.totalReports !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-white/80 font-medium">{result.message}</p>
                <p className="text-sm text-white/40 mt-1 font-mono">{query}</p>
              </div>
            </div>
          </div>

          {/* Blacklist entries */}
          {result.entries?.map((entry) => {
            const Icon = TYPE_ICONS[entry.type] || Database;
            return (
              <div key={entry._id} className="card p-5 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-red" />
                    </div>
                    <div>
                      <p className="font-mono text-white font-semibold">{entry.value}</p>
                      <p className="text-xs text-white/40 capitalize">{entry.type.replace('_', ' ')} · {entry.reportCount} reports</p>
                    </div>
                  </div>
                  <RiskBadge level={entry.riskLevel} />
                </div>

                {entry.notes && (
                  <p className="text-sm text-white/60 bg-white/5 rounded-lg px-3 py-2 mb-3">{entry.notes}</p>
                )}

                {entry.linkedScams?.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wide">Linked Scam Reports</p>
                    <div className="space-y-2">
                      {entry.linkedScams.filter(Boolean).map((scam) => (
                        <a
                          key={scam._id}
                          href={`/scam/${scam._id}`}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group"
                        >
                          <AlertTriangle className="w-4 h-4 text-red flex-shrink-0" />
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">{scam.title}</span>
                          <span className="text-xs text-white/30 capitalize ml-auto">{scam.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="text-center py-16 text-white/30">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Enter a phone number, email, or URL to check</p>
          <p className="text-sm mt-1">We'll instantly scan our database of reported scams</p>
        </div>
      )}
    </div>
  );
}
