import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MapPin, Calendar, Flag, User, MessageSquare, AlertTriangle, Send, Loader } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { SCAM_TYPE_COLORS, SCAM_TYPE_ICONS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ScamDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [scam, setScam] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reported, setReported] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [scamRes, commentsRes] = await Promise.all([
          api.get(`/scams/${id}`),
          api.get(`/comments/${id}`),
        ]);
        setScam(scamRes.data.scam);
        setUpvotes(scamRes.data.scam.upvotes || 0);
        setComments(commentsRes.data.comments || []);
      } catch { toast.error('Failed to load scam details'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated) { toast.error('Login to upvote'); return; }
    try {
      const { data } = await api.post(`/scams/${id}/upvote`);
      setUpvotes(data.upvotes);
      setUpvoted(data.upvoted);
    } catch { toast.error('Failed to upvote'); }
  };

  const handleReport = async () => {
    if (!isAuthenticated) { toast.error('Login to report'); return; }
    try {
      await api.post('/reports', { scamId: id, additionalDetails: 'I also encountered this scam.' });
      setReported(true);
      toast.success('Report submitted! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Login to comment'); return; }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/comments/${id}`, { text: commentText });
      setComments((p) => [data.comment, ...p]);
      setCommentText('');
    } catch { toast.error('Failed to post comment'); }
    finally { setSubmittingComment(false); }
  };

  const typeColor = scam ? SCAM_TYPE_COLORS[scam.type] || '#FF2D55' : '#FF2D55';
  const typeIcon = scam ? SCAM_TYPE_ICONS[scam.type] || '⚠️' : '⚠️';

  const STATUS = {
    verified: { label: 'Verified', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
    pending: { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    rejected: { label: 'Rejected', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' },
  };

  if (loading) return (
    <div className="min-h-screen py-8 max-w-4xl mx-auto px-4">
      <div className="skeleton h-8 w-32 rounded mb-8" />
      <div className="skeleton h-64 w-full rounded-xl mb-6" />
      <div className="skeleton h-40 w-full rounded-xl" />
    </div>
  );

  if (!scam) return (
    <div className="min-h-screen flex items-center justify-center text-white/40">
      Scam not found. <Link to="/feed" className="text-red ml-2">Go to Feed</Link>
    </div>
  );

  const statusCfg = STATUS[scam.status] || STATUS.pending;

  return (
    <div className="min-h-screen py-8 max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in">
      <Link to="/feed" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>

      {/* Main Card */}
      <div className="card p-6 md:p-8 mb-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="badge-type"
            style={{ backgroundColor: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}40` }}
          >
            {typeIcon} {scam.type}
          </span>
          <span className={`badge-type ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
            {statusCfg.label}
          </span>
          <span className="text-xs text-white/30 ml-auto">
            {scam.reportCount} report{scam.reportCount !== 1 ? 's' : ''}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">{scam.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-6">
          {scam.reportedBy && (
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-red/20 border border-red/30 flex items-center justify-center text-red text-xs font-bold">
                {scam.reportedBy.name?.[0]?.toUpperCase()}
              </div>
              {scam.reportedBy.name}
            </span>
          )}
          {scam.location?.city && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{scam.location.city}{scam.location.state && `, ${scam.location.state}`}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(scam.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Description */}
        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{scam.description}</p>
        </div>

        {/* Tags */}
        {scam.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {scam.tags.map((tag) => (
              <span key={tag} className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">#{tag}</span>
            ))}
          </div>
        )}

        {/* Evidence */}
        {scam.evidence?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Evidence</h3>
            <div className="space-y-2">
              {scam.evidence.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-red/5 border border-red/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red flex-shrink-0" />
                  <span className="text-sm font-mono text-white/80">{ev.value}</span>
                  <span className="text-xs text-white/30 ml-auto capitalize">{ev.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
              upvoted ? 'bg-red/20 text-red border-red/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-red/10 hover:text-red hover:border-red/30'
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> {upvotes} Helpful
          </button>
          <button
            onClick={handleReport}
            disabled={reported}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
              reported ? 'bg-accent-green/10 text-accent-green border-accent-green/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
          >
            <Flag className="w-4 h-4" /> {reported ? 'Reported!' : 'I Saw This Too'}
          </button>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white/5 text-white/60 border-white/10 hover:bg-white/10 text-sm font-semibold transition-all ml-auto">
            Report to Cyber Police
          </a>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red" /> Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleComment} className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-red/20 border border-red/30 flex items-center justify-center text-red text-xs font-bold flex-shrink-0 mt-1">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience or warning..."
                className="input-field flex-1"
                maxLength={500}
              />
              <button type="submit" disabled={submittingComment || !commentText.trim()} className="btn-primary px-4 py-2">
                {submittingComment ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 mb-6 border border-white/5 rounded-xl">
            <p className="text-white/40 text-sm"><Link to="/login" className="text-red">Login</Link> to share your experience</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No comments yet — be the first to share your experience</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-lighter border border-white/10 flex items-center justify-center text-white/50 text-xs font-bold flex-shrink-0">
                  {c.userId?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{c.userId?.name || 'Anonymous'}</span>
                    <span className="text-xs text-white/30">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-white/70">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
