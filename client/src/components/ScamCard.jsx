import { Link } from 'react-router-dom';
import { ArrowUp, MapPin, Calendar, ThumbsUp, Flag, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SCAM_TYPE_COLORS, SCAM_TYPE_ICONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  verified: { label: 'Verified', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  rejected: { label: 'Rejected', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' },
};

export default function ScamCard({ scam, showStatus = false }) {
  const { isAuthenticated } = useAuth();
  const [upvotes, setUpvotes] = useState(scam.upvotes || 0);
  const [upvoted, setUpvoted] = useState(false);

  const typeColor = SCAM_TYPE_COLORS[scam.type] || '#FF2D55';
  const typeIcon = SCAM_TYPE_ICONS[scam.type] || '⚠️';
  const statusCfg = STATUS_CONFIG[scam.status] || STATUS_CONFIG.pending;

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Login to upvote'); return; }
    try {
      const { data } = await api.post(`/scams/${scam._id}/upvote`);
      setUpvotes(data.upvotes);
      setUpvoted(data.upvoted);
    } catch {
      toast.error('Failed to upvote');
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const cardContent = (
      <div className="card p-5 group cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span
              className="badge-type text-white"
              style={{ backgroundColor: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44` }}
            >
              {typeIcon} {scam.type}
            </span>
            {showStatus && (
              <span className={`badge-type ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            )}
            {scam.source_type === 'news' && (
              <span className="badge-type text-blue-400 bg-blue-500/10 border-blue-500/30">
                <ExternalLink className="w-3 h-3 inline mr-1 -mt-0.5" /> News
              </span>
            )}
          </div>
          {/* Upvote */}
          {scam.source_type !== 'news' && (
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                upvoted
                  ? 'bg-red/20 text-red border-red/30'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-red/10 hover:text-red hover:border-red/30'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {upvotes}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base leading-tight mb-2 group-hover:text-red/90 transition-colors line-clamp-2">
          {scam.title}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {scam.description}
        </p>

        {/* Tags */}
        {scam.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scam.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                #{tag}
              </span>
            ))}
            {scam.tags.length > 3 && (
              <span className="text-xs text-white/30">+{scam.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/30">
          <div className="flex items-center gap-3">
            {scam.location?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {scam.location.city}
                {scam.location.state && `, ${scam.location.state}`}
              </span>
            )}
            {scam.source_type !== 'news' && (
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {scam.reportCount || 1} reports
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {timeAgo(scam.createdAt)}
          </span>
        </div>
      </div>
  );

  if (scam.source_type === 'news' && scam.url) {
    return (
      <a href={scam.url} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={`/scam/${scam._id}`} className="block">
      {cardContent}
    </Link>
  );
}

// Skeleton loader version
export function ScamCardSkeleton() {
  return (
    <div className="card p-5 h-56">
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-5 w-full mb-2 rounded" />
      <div className="skeleton h-4 w-4/5 mb-1 rounded" />
      <div className="skeleton h-4 w-3/5 mb-4 rounded" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-between pt-3 border-t border-white/5">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </div>
  );
}
