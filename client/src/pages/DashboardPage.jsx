import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ScamCard from '../components/ScamCard';
import { SCAM_TYPE_COLORS, SCAM_TYPE_ICONS } from '../utils/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const [myScams, setMyScams] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [scamsRes, statsRes] = await Promise.all([
          api.get('/scams/my'),
          api.get('/stats'),
        ]);
        setMyScams(scamsRes.data.scams || []);
        setStats(statsRes.data.stats);

        // Geo query if browser supports it
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { data } = await api.get(`/scams/nearby?lng=${pos.coords.longitude}&lat=${pos.coords.latitude}&maxDistance=50000&limit=6`);
            setNearby(data.scams || []);
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusCounts = {
    verified: myScams.filter((s) => s.status === 'verified').length,
    pending: myScams.filter((s) => s.status === 'pending').length,
    rejected: myScams.filter((s) => s.status === 'rejected').length,
  };

  const STATUS_ICON = {
    verified: <CheckCircle className="w-4 h-4 text-accent-green" />,
    pending: <AlertCircle className="w-4 h-4 text-yellow-400" />,
    rejected: <XCircle className="w-4 h-4 text-red" />,
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* User Header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red/20 border-2 border-red/30 flex items-center justify-center text-red text-2xl font-black">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-white/40 text-sm">{user?.email}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10 capitalize">{user?.role}</span>
            {user?.location?.city && (
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{user.location.city}, {user.location.state}
              </span>
            )}
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Joined {new Date(user?.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
        <Link to="/report" className="btn-primary text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" /> Report Scam
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Reports Submitted', value: user?.reportsSubmitted || 0, color: '#FF2D55' },
          { label: 'Verified', value: statusCounts.verified, color: '#00FF88' },
          { label: 'Pending Review', value: statusCounts.pending, color: '#FFD700' },
          { label: 'Rejected', value: statusCounts.rejected, color: '#FF6B6B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-3xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        {[
          { id: 'reports', label: 'My Reports', icon: FileText },
          { id: 'nearby', label: 'Near Me', icon: MapPin },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id ? 'bg-red/10 text-red border border-red/20' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-white/30">Loading your reports...</div>
          ) : myScams.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/50 font-medium">You haven't reported any scams yet</p>
              <Link to="/report" className="btn-primary mt-4 inline-flex items-center gap-2">
                Report Your First Scam
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myScams.map((scam) => (
                <Link key={scam._id} to={`/scam/${scam._id}`} className="block">
                  <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {STATUS_ICON[scam.status]}
                        <span className="text-xs font-medium text-white/40 capitalize">{scam.status}</span>
                        <span className="text-white/20">·</span>
                        <span className="text-xs text-white/30 capitalize">{scam.type}</span>
                      </div>
                      <p className="font-semibold text-white group-hover:text-red/80 transition-colors truncate">{scam.title}</p>
                      <p className="text-xs text-white/30 mt-1">{new Date(scam.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{scam.upvotes}</p>
                      <p className="text-xs text-white/40">upvotes</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'nearby' && (
        <div>
          {nearby.length === 0 ? (
            <div className="card p-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/50 font-medium">No scams found near your location</p>
              <p className="text-sm text-white/30 mt-1">Grant location access for this feature to work</p>
              <button
                onClick={() => navigator.geolocation.getCurrentPosition(() => {})}
                className="btn-secondary mt-4"
              >
                Enable Location
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-white/40 mb-4 flex items-center gap-1"><MapPin className="w-4 h-4 text-red" /> Showing scams within 50km of your location</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearby.map((scam) => <ScamCard key={scam._id} scam={scam} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
