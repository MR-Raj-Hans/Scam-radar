import { useState } from 'react';
import { Brain, Loader, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import { SCAM_TYPE_COLORS, SCAM_TYPE_ICONS } from '../utils/constants';

export default function AIClassifyBox({ description, onTypeDetected }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classify = async () => {
    if (!description || description.trim().length < 10) {
      setError('Please enter at least 10 characters in the description');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/ai/classify', { description });
      setResult(data);
      if (onTypeDetected && data.type) onTypeDetected(data.type);
    } catch (err) {
      setError(err.response?.data?.message || 'AI classification failed. Using keyword analysis...');
    } finally {
      setLoading(false);
    }
  };

  const typeColor = result ? SCAM_TYPE_COLORS[result.type] || '#FF2D55' : '#FF2D55';
  const typeIcon = result ? SCAM_TYPE_ICONS[result.type] || '⚠️' : '⚠️';

  return (
    <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-accent-blue/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-blue/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Scam Classifier</p>
            <p className="text-xs text-white/40">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={classify}
          disabled={loading || !description}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue border border-accent-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Classify'}
        </button>
      </div>

      {/* Result */}
      <div className="px-4 py-3">
        {!result && !loading && !error && (
          <p className="text-sm text-white/40 text-center py-2">
            Click "Classify" after describing the scam to get AI-powered insights
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red p-2 bg-red/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-fade-up">
            {/* Type detection */}
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg border"
                style={{ backgroundColor: `${typeColor}15`, color: typeColor, borderColor: `${typeColor}40` }}
              >
                {typeIcon} {result.type?.toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/50">Confidence</span>
                  <span className="text-xs font-bold text-white">{result.confidence}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.confidence}%`, backgroundColor: typeColor }}
                  />
                </div>
              </div>
            </div>

            {/* Severity */}
            {result.severity && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Severity:</span>
                <span className={`text-xs font-bold ${
                  result.severity === 'HIGH' ? 'text-red' :
                  result.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                }`}>{result.severity}</span>
              </div>
            )}

            {/* Warning */}
            <div className="flex gap-2 p-3 bg-red/10 border border-red/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/80">{result.warning}</p>
            </div>

            {/* Keywords */}
            {result.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-white/40">Red flags:</span>
                {result.keywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-red/10 text-red/80 px-2 py-0.5 rounded-full border border-red/20">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {result.source === 'keyword' && (
              <p className="text-xs text-white/30 text-center">* Using keyword analysis (AI key not configured)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
