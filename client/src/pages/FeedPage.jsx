import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SortAsc, Grid3X3, List, Search } from 'lucide-react';
import ScamCard, { ScamCardSkeleton } from '../components/ScamCard';
import api from '../utils/api';
import { SCAM_TYPES, INDIAN_STATES } from '../utils/constants';

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scams, setScams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    state: '',
    sort: 'newest',
    search: '',
  });
  const [search, setSearch] = useState('');

  const fetchScams = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12, sort: filters.sort });
      if (filters.type) params.append('type', filters.type);
      if (filters.state) params.append('state', filters.state);
      if (filters.search) params.append('search', filters.search);

      const { data } = await api.get(`/scams?${params}`);
      setScams((prev) => reset || p === 1 ? data.scams : [...prev, ...data.scams]);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchScams(1, true);
  }, [filters]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    if (key === 'type' && val) setSearchParams({ type: val });
    else setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search }));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchScams(next, false);
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Scam Feed</h1>
        <p className="text-white/40">Browse verified scam reports from the community</p>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-8 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scams..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>

        <div className="flex gap-3 flex-wrap">
          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="">All Types</option>
            {SCAM_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* State filter */}
          <select
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Upvoted</option>
            <option value="most_reported">Most Reported</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(filters.type || filters.state || filters.search) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.type && (
            <span className="flex items-center gap-1 text-xs bg-red/10 text-red border border-red/20 px-3 py-1 rounded-full">
              Type: {filters.type}
              <button onClick={() => handleFilterChange('type', '')} className="ml-1 hover:text-white">×</button>
            </span>
          )}
          {filters.state && (
            <span className="flex items-center gap-1 text-xs bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-3 py-1 rounded-full">
              State: {filters.state}
              <button onClick={() => handleFilterChange('state', '')} className="ml-1 hover:text-white">×</button>
            </span>
          )}
          {filters.search && (
            <span className="flex items-center gap-1 text-xs bg-white/10 text-white/60 border border-white/10 px-3 py-1 rounded-full">
              Search: "{filters.search}"
              <button onClick={() => { setFilters((p) => ({ ...p, search: '' })); setSearch(''); }} className="ml-1 hover:text-white">×</button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && pagination && (
        <p className="text-sm text-white/40 mb-4">
          {pagination.total} scam{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading && scams.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <ScamCardSkeleton key={i} />)
          : scams.map((scam) => <ScamCard key={scam._id} scam={scam} />)
        }
      </div>

      {/* Empty State */}
      {!loading && scams.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <Filter className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No scams found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Load More */}
      {!loading && pagination && page < pagination.pages && (
        <div className="text-center">
          <button onClick={loadMore} className="btn-secondary px-8 py-3">
            Load More ({pagination.total - scams.length} remaining)
          </button>
        </div>
      )}

      {loading && scams.length > 0 && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-red/20 border-t-red rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  );
}
