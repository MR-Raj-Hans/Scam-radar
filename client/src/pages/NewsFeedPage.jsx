import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api'; // Using api utility for correct baseURL

const SCAM_COLORS = {
  'UPI fraud': '#FF2D55',
  'phishing': '#FF6B35',
  'fake job': '#FFD60A',
  'lottery': '#30D158',
  'investment': '#0A84FF',
  'banking': '#BF5AF2',
  'romance': '#FF375F',
  'other': '#636366'
};

const NewsCard = ({ article }) => (
  <div style={{
    background: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.2s, border-color 0.2s',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = '#FF2D55';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = '#1F2937';
    }}
  >
    {/* Scam Type Badge */}
    <span style={{
      background: (SCAM_COLORS[article.scamType] || '#636366') + '22',
      color: SCAM_COLORS[article.scamType] || '#636366',
      border: `1px solid ${SCAM_COLORS[article.scamType] || '#636366'}`,
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-block',
      marginBottom: '8px'
    }}>
      {article.scamType}
    </span>

    <h3 style={{ color: '#F9FAFB', margin: '8px 0', fontSize: '15px', lineHeight: 1.4, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
      {article.title}
    </h3>

    <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 12px', height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
      {article.description || 'Live report detailed below.'}
    </p>

    {/* Extracted Data Pills */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', minHeight: '22px' }}>
      {article.extractedPhones?.slice(0, 2).map((p, i) => (
        <span key={`${p}-${i}`} style={{ background: '#FF2D5522', color: '#FF2D55', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
          📞 {p}
        </span>
      ))}
      {article.extractedAmount && (
        <span style={{ background: '#FF6B3522', color: '#FF6B35', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
          💸 ₹{article.extractedAmount.toLocaleString('en-IN')} lost
        </span>
      )}
      {article.state && (
        <span style={{ background: '#0A84FF22', color: '#0A84FF', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
          📍 {article.state}
        </span>
      )}
      {!article.extractedAmount && !article.state && (!article.extractedPhones || article.extractedPhones.length === 0) && (
        <span style={{ color: '#6B7280', fontSize: '11px', fontStyle: 'italic' }}>Pending community extraction</span>
      )}
    </div>

    {/* Footer */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <span style={{ color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
        {article.source} • {new Date(article.publishedAt).toLocaleDateString('en-IN')}
      </span>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        style={{ color: '#FF2D55', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>
        Read Full →
      </a>
    </div>
  </div>
);

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const SCAM_TYPES = ['all', 'UPI fraud', 'phishing', 'fake job', 'lottery', 'investment', 'banking'];

  const fetchNews = async () => {
    setLoading(true);
    const type = filter !== 'all' ? `&type=${filter}` : '';
    try {
      const { data } = await api.get(`/news?page=${page}&limit=20${type}`);
      setArticles(data.news || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
      setArticles([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, [filter, page]);

  // Auto-refresh every 2 hours locally inside the component
  useEffect(() => {
    const interval = setInterval(fetchNews, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filter, page]);

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '24px', maxWidth: '1280px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F9FAFB', fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
          <span style={{ color: '#FF2D55' }}>🔴 Live</span> Scam News Feed
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
          Auto-updated every 2 hours from real news sources • {total} articles indexed
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {SCAM_TYPES.map(type => (
          <button key={type} onClick={() => { setFilter(type); setPage(1); }}
            style={{
              background: filter === type ? '#FF2D55' : '#111827',
              color: filter === type ? 'white' : '#9CA3AF',
              border: '1px solid',
              borderColor: filter === type ? '#FF2D55' : '#1F2937',
              padding: '6px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}>
            {type}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        // Skeleton loader
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ background: '#111827', borderRadius: '12px', height: '220px', border: '1px solid #1F2937' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF' }}>
          <p style={{ fontSize: '16px' }}>No news articles found for this category yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {articles.map(article => <NewsCard key={article._id} article={article} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px', paddingBottom: '40px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: page === 1 ? '#0A0F1E' : '#111827', color: page === 1 ? '#4B5563' : '#F9FAFB', border: `1px solid ${page === 1 ? '#1F2937' : '#374151'}`,
              padding: '8px 20px', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
            ← Previous
          </button>
          
          <span style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '500' }}>
            Page {page}
          </span>
          
          <button onClick={() => setPage(p => p + 1)} disabled={articles.length < 20}
            style={{ background: articles.length < 20 ? '#0A0F1E' : '#FF2D55', color: articles.length < 20 ? '#4B5563' : 'white', border: `1px solid ${articles.length < 20 ? '#1F2937' : '#FF2D55'}`,
              padding: '8px 20px', borderRadius: '8px', cursor: articles.length < 20 ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
