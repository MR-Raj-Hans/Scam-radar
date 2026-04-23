import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Shield, Users, Database, AlertTriangle, Search, Filter, Loader } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { SCAM_TYPE_COLORS } from '../utils/constants';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scams');
  const [scams, setScams] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [newEntry, setNewEntry] = useState({ type: 'phone', value: '', notes: '', riskLevel: 'MEDIUM' });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scamsRes, statsRes] = await Promise.all([
        api.get(`/scams?status=${statusFilter}&limit=50`),
        api.get('/stats/admin'),
      ]);
      setScams(scamsRes.data.scams || []);
      setAdminStats(statsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadBlacklist = async () => {
    try {
      const { data } = await api.get('/blacklist?limit=50');
      setBlacklist(data.entries || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'blacklist') loadBlacklist();
  }, [activeTab]);

  const updateStatus = async (scamId, status) => {
    try {
      await api.patch(`/scams/${scamId}/status`, { status });
      setScams((p) => p.filter((s) => s._id !== scamId));
      toast.success(`Scam ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const addToBlacklist = async (e) => {
    e.preventDefault();
    if (!newEntry.value.trim()) { toast.error('Value required'); return; }
    try {
      await api.post('/blacklist', newEntry);
      toast.success('Added to blacklist');
      setNewEntry({ type: 'phone', value: '', notes: '', riskLevel: 'MEDIUM' });
      loadBlacklist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Remove this entry from blacklist?')) return;
    try {
      await api.delete(`/blacklist/${id}`);
      setBlacklist((p) => p.filter((e) => e._id !== id));
      toast.success('Entry removed');
    } catch { toast.error('Failed to delete'); }
  };

  const TABS = [
    { id: 'scams', label: 'Scam Queue', icon: AlertTriangle },
    { id: 'blacklist', label: 'Blacklist', icon: Database },
  ];

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red/20 border border-red/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm">Logged in as <span className="text-red capitalize">{user?.role}</span></p>
        </div>
      </div>

      {/* Admin Stats */}
      {adminStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {adminStats.byStatus?.map(({ _id: status, count }) => (
            <div key={status} className="card p-4 text-center">
              <p className="text-2xl font-black text-white">{count}</p>
              <p className="text-xs text-white/40 capitalize mt-1">{status}</p>
            </div>
          ))}
          {adminStats.byType?.slice(0, 2).map(({ _id: type, count }) => (
            <div key={type} className="card p-4 text-center">
              <p className="text-2xl font-black" style={{ color: SCAM_TYPE_COLORS[type] || '#FF2D55' }}>{count}</p>
              <p className="text-xs text-white/40 capitalize mt-1">{type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        {TABS.map(({ id, label, icon: Icon }) => (
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

      {/* Scam Queue */}
      {activeTab === 'scams' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  statusFilter === s ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-2 border-red/20 border-t-red rounded-full animate-spin mx-auto" /></div>
          ) : scams.length === 0 ? (
            <div className="card p-12 text-center text-white/30">No {statusFilter} scams</div>
          ) : (
            <div className="space-y-3">
              {scams.map((scam) => (
                <div key={scam._id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: `${SCAM_TYPE_COLORS[scam.type] || '#FF2D55'}20`, color: SCAM_TYPE_COLORS[scam.type] || '#FF2D55' }}
                      >
                        {scam.type}
                      </span>
                      <span className="text-xs text-white/30">{new Date(scam.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="font-semibold text-white truncate">{scam.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{scam.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={`/scam/${scam._id}`} target="_blank" rel="noopener" className="btn-secondary text-xs py-1.5 px-3">View</a>
                    {statusFilter !== 'verified' && (
                      <button onClick={() => updateStatus(scam._id, 'verified')} className="flex items-center gap-1 text-xs bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 px-3 py-1.5 rounded-lg transition-all">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                    )}
                    {statusFilter !== 'rejected' && (
                      <button onClick={() => updateStatus(scam._id, 'rejected')} className="flex items-center gap-1 text-xs bg-red/10 text-red border border-red/30 hover:bg-red/20 px-3 py-1.5 rounded-lg transition-all">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blacklist Manager */}
      {activeTab === 'blacklist' && user?.role === 'admin' && (
        <div>
          {/* Add form */}
          <form onSubmit={addToBlacklist} className="card p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4">Add New Entry</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={newEntry.type} onChange={(e) => setNewEntry((p) => ({ ...p, type: e.target.value }))} className="input-field py-2 text-sm">
                {['phone', 'email', 'UPI', 'URL', 'bank_account'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" value={newEntry.value} onChange={(e) => setNewEntry((p) => ({ ...p, value: e.target.value }))} placeholder="Value to blacklist" className="input-field py-2 text-sm" />
              <select value={newEntry.riskLevel} onChange={(e) => setNewEntry((p) => ({ ...p, riskLevel: e.target.value }))} className="input-field py-2 text-sm">
                {['LOW', 'MEDIUM', 'HIGH'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" className="btn-primary py-2 text-sm">Add to Blacklist</button>
            </div>
            <input type="text" value={newEntry.notes} onChange={(e) => setNewEntry((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" className="input-field py-2 text-sm mt-3" />
          </form>

          {/* Entries table */}
          <div className="space-y-2">
            {blacklist.map((entry) => (
              <div key={entry._id} className="card p-4 flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-xs text-white/40 uppercase">{entry.type}</span>
                  <p className="font-mono text-sm text-white">{entry.value}</p>
                  {entry.notes && <p className="text-xs text-white/40 mt-0.5">{entry.notes}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  entry.riskLevel === 'HIGH' ? 'bg-red/20 text-red' :
                  entry.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-white/10 text-white/50'
                }`}>{entry.riskLevel}</span>
                <span className="text-xs text-white/40">{entry.reportCount} reports</span>
                <button onClick={() => deleteEntry(entry._id)} className="text-white/30 hover:text-red transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
