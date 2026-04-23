import { useState } from 'react';
import axios from 'axios';

const RISK_CONFIG = {
  HIGH:   { color: '#FF2D55', bg: '#FF2D5515', icon: '🔴', label: 'HIGH RISK' },
  MEDIUM: { color: '#FF9500', bg: '#FF950015', icon: '🟡', label: 'MEDIUM RISK' },
  LOW:    { color: '#FFD60A', bg: '#FFD60A15', icon: '🟠', label: 'LOW RISK' },
  SAFE:   { color: '#30D158', bg: '#30D15815', icon: '🟢', label: 'APPEARS SAFE' },
};

export default function UniversalChecker() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await axios.post('/api/check', { value: value.trim() });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Check failed. Please try again.');
    }
    setLoading(false);
  };

  const risk = result ? RISK_CONFIG[result.riskLevel] : null;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }} className="animate-fade-up">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="Enter phone, email, or URL..."
          style={{
            flex: 1, background: '#111827', border: '1px solid #1F2937',
            borderRadius: '10px', padding: '14px 18px', color: '#F9FAFB',
            fontSize: '15px', outline: 'none',
          }}
        />
        <button onClick={handleCheck} disabled={loading}
          style={{
            background: '#FF2D55', color: 'white', border: 'none',
            borderRadius: '10px', padding: '14px 24px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? '⏳ Checking...' : '🔍 Check'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FF2D5515', border: '1px solid #FF2D55',
          borderRadius: '10px', padding: '14px', color: '#FF2D55', marginBottom: '16px', textAlign: 'left' }}>
          ⚠️ {error}
        </div>
      )}

      {result && risk && (
        <div style={{ background: '#111827', border: `1px solid ${risk.color}`,
          borderRadius: '14px', overflow: 'hidden', textAlign: 'left' }} className="animate-fade-up">

          {/* Risk Header */}
          <div style={{ background: risk.bg, padding: '20px 24px',
            borderBottom: `1px solid ${risk.color}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>{risk.icon}</span>
              <div>
                <div style={{ color: risk.color, fontWeight: '700',
                  fontSize: '22px', letterSpacing: '1px' }}>
                  {risk.label}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '2px' }}>
                  Risk Score: {result.riskScore}/100
                  {result.fromCache && ' • Cached result'}
                </div>
              </div>
            </div>

            {/* Risk Score Bar */}
            <div style={{ background: '#1F2937', borderRadius: '4px',
              height: '6px', marginTop: '14px' }}>
              <div style={{
                background: risk.color, height: '6px', borderRadius: '4px',
                width: `${result.riskScore}%`, transition: 'width 0.8s ease'
              }} />
            </div>
          </div>

          {/* Risk Reasons */}
          {result.riskReasons?.length > 0 && (
            <div style={{ padding: '20px 24px',
              borderBottom: '1px solid #1F2937' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px',
                fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>
                Why this risk level?
              </div>
              {result.riskReasons.map((reason, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px',
                  marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ color: risk.color, marginTop: '2px' }}>→</span>
                  <span style={{ color: '#D1D5DB', fontSize: '14px' }}>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* TRAI Verification Badge */}
          {result.phoneData?.governmentVerified && (
            <div style={{ padding: '20px 24px 0 24px' }}>
            <div style={{
              background: '#30D15815',
              border: '1px solid #30D158',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>🇮🇳</span>
              <div>
                <div style={{ color: '#30D158', fontWeight: '600', fontSize: '13px' }}>
                  TRAI VERIFIED — Government of India Numbering Plan
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '3px' }}>
                  Operator: {result.phoneData.traiOperator} •
                  Circle: {result.phoneData.traiCircle} •
                  Type: {result.phoneData.traiTechnology}
                  {result.phoneData.isCommercialSeries && ' • ⚠️ Commercial Series'}
                  {result.phoneData.dndApplicable && ' • DND Applicable'}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Phone Details */}
          {result.phoneData && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F2937' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px',
                fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Number Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Carrier', result.phoneData.carrier || result.phoneData.traiOperator],
                  ['Line Type', result.phoneData.lineType || result.phoneData.traiServiceType],
                  ['Circle', result.phoneData.circle || result.phoneData.traiCircle],
                  ['Valid', result.phoneData.valid !== false ? 'Yes' : 'No'],
                ].map(([label, val]) => val && (
                  <div key={label} style={{ background: '#0A0F1E',
                    borderRadius: '8px', padding: '10px 14px' }}>
                    <div style={{ color: '#6B7280', fontSize: '11px' }}>{label}</div>
                    <div style={{ color: '#F9FAFB', fontSize: '14px',
                      fontWeight: '500', marginTop: '2px', textTransform: 'capitalize' }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Details */}
          {result.emailData && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F2937' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px',
                fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Email Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Breached', result.emailData.breached ? `Yes (${result.emailData.breachCount} databases)` : 'No'],
                  ['Disposable', result.emailData.disposable ? 'Yes ⚠️' : 'No'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: '#0A0F1E',
                    borderRadius: '8px', padding: '10px 14px' }}>
                    <div style={{ color: '#6B7280', fontSize: '11px' }}>{label}</div>
                    <div style={{ color: '#F9FAFB', fontSize: '14px',
                      fontWeight: '500', marginTop: '2px' }}>{val}</div>
                  </div>
                ))}
              </div>
              {result.emailData.breachNames?.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.emailData.breachNames.map(name => (
                    <span key={name} style={{ background: '#FF2D5522', color: '#FF2D55',
                      padding: '3px 10px', borderRadius: '4px', fontSize: '12px' }}>
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL Details */}
          {result.urlData && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F2937' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px',
                fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                URL Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Google Safe Browsing', result.urlData.googleSafeBrowsing ? '🔴 Flagged' : '✅ Clear'],
                  ['PhishTank', result.urlData.phishTank ? '🔴 Confirmed Phishing' : '✅ Not Listed'],
                  ['Threat Type', result.urlData.threatType || 'None detected'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: '#0A0F1E',
                    borderRadius: '8px', padding: '10px 14px' }}>
                    <div style={{ color: '#6B7280', fontSize: '11px' }}>{label}</div>
                    <div style={{ color: '#F9FAFB', fontSize: '14px',
                      fontWeight: '500', marginTop: '2px' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked News Articles */}
          {result.linkedNewsArticles?.length > 0 && (
            <div style={{ padding: '20px 24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px',
                fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Found In News Articles
              </div>
              {result.linkedNewsArticles.map((article, i) => (
                <div key={i} style={{ background: '#0A0F1E', borderRadius: '8px',
                  padding: '12px 14px', marginBottom: '8px' }}>
                  <div style={{ color: '#F9FAFB', fontSize: '13px',
                    fontWeight: '500', marginBottom: '4px' }}>
                    {article.title}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '12px' }}>
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Last Checked */}
          <div style={{ padding: '12px 24px', background: '#0A0F1E',
            borderTop: '1px solid #1F2937' }}>
            <span style={{ color: '#4B5563', fontSize: '11px' }}>
              Last checked: {new Date(result.lastChecked).toLocaleString('en-IN')} •
              Next refresh: {new Date(result.nextRefreshAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
