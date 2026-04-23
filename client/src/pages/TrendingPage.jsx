import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Zap, MapPin, Calendar } from 'lucide-react';
import api from '../utils/api';
import { SCAM_TYPE_COLORS, SCAM_TYPE_ICONS } from '../utils/constants';
import ScamCard, { ScamCardSkeleton } from '../components/ScamCard';

const COLORS = ['#FF2D55', '#FF6B6B', '#FFD700', '#00B4FF', '#FF69B4', '#00FF88'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-navy-lighter border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold capitalize">{label}</p>
        <p className="text-red font-bold">{payload[0].value} reports</p>
      </div>
    );
  }
  return null;
};

export default function TrendingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/scams/trending?days=${days}`);
        setData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [days]);

  const barData = data?.trendingByType?.map((t) => ({
    name: t.type,
    reports: t.count,
    upvotes: t.totalUpvotes,
    icon: SCAM_TYPE_ICONS[t.type] || '⚠️',
  })) || [];

  const pieData = data?.trendingByType?.map((t, i) => ({
    name: t.type,
    value: t.count,
    fill: COLORS[i % COLORS.length],
  })) || [];

  const heatmapData = data?.byState?.slice(0, 15) || [];

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-red" />
            <h1 className="text-3xl font-black text-white">Trending Scams</h1>
          </div>
          <p className="text-white/40">Aggregated data on scam patterns across India</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                days === d ? 'bg-red text-white shadow-glow-red' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => <div key={i} className="card p-6 h-72 skeleton" />)}
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-1">Reports by Scam Type</h3>
              <p className="text-xs text-white/40 mb-5">Last {days} days</p>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="reports" radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/30">No data for this period</div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-1">Distribution by Type</h3>
              <p className="text-xs text-white/40 mb-3">Share of each scam category</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-xs text-white/60 capitalize">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/30">No data for this period</div>
              )}
            </div>
          </div>

          {/* State Heatmap */}
          {heatmapData.length > 0 && (
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-red" />
                <h3 className="text-lg font-bold text-white">Scam Hotspots by State</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {heatmapData.map(({ _id: state, count }, i) => {
                  const max = heatmapData[0]?.count || 1;
                  const intensity = count / max;
                  return (
                    <div
                      key={state}
                      className="rounded-xl p-3 text-center border transition-all hover:scale-105"
                      style={{
                        backgroundColor: `rgba(255,45,85,${0.05 + intensity * 0.25})`,
                        borderColor: `rgba(255,45,85,${0.1 + intensity * 0.35})`,
                      }}
                    >
                      <p className="text-xs font-bold text-white">{count}</p>
                      <p className="text-xs text-white/50 mt-0.5 leading-tight">{state}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type breakdown */}
          {data?.trendingByType?.length > 0 && (
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-5">Detailed Breakdown</h3>
              <div className="space-y-4">
                {data.trendingByType.map((t, i) => (
                  <div key={t.type} className="flex items-center gap-4">
                    <span className="text-2xl w-8">{SCAM_TYPE_ICONS[t.type] || '⚠️'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white capitalize">{t.type}</span>
                        <span className="text-sm font-bold text-red">{t.count} reports</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(t.count / (data.trendingByType[0]?.count || 1)) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-white/40">{t.totalUpvotes} upvotes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top scams */}
          {data?.topScams?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red" /> Most Impactful Scams
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.topScams.slice(0, 6).map((scam) => (
                  <ScamCard key={scam._id} scam={scam} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
