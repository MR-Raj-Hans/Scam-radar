import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, MapPin, CheckCircle, ChevronRight, ChevronLeft, Loader, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { SCAM_TYPES, INDIAN_STATES } from '../utils/constants';
import AIClassifyBox from '../components/AIClassifyBox';

const STEPS = [
  { id: 1, label: 'Scam Type', icon: AlertTriangle },
  { id: 2, label: 'Details', icon: FileText },
  { id: 3, label: 'Evidence', icon: Brain },
  { id: 4, label: 'Location', icon: MapPin },
];

export default function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [blacklistWarning, setBlacklistWarning] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    tags: '',
    evidence: [{ type: 'text', value: '' }],
    city: '',
    state: '',
    useLocation: false,
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 1 && !formData.type) e.type = 'Please select a scam type';
    if (step === 2) {
      if (!formData.title.trim() || formData.title.length < 5) e.title = 'Title must be at least 5 characters';
      if (!formData.description.trim() || formData.description.length < 20) e.description = 'Description must be at least 20 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  // Check blacklist when evidence value changes
  const checkBlacklist = async (value) => {
    if (!value.trim() || value.length < 5) return;
    try {
      const { data } = await api.get(`/blacklist/check?value=${encodeURIComponent(value)}`);
      if (data.found) setBlacklistWarning(data);
      else setBlacklistWarning(null);
    } catch {}
  };

  const handleEvidenceChange = (i, key, val) => {
    const updated = [...formData.evidence];
    updated[i] = { ...updated[i], [key]: val };
    setFormData((p) => ({ ...p, evidence: updated }));
    if (key === 'value' && val.length > 5) checkBlacklist(val);
  };

  const addEvidence = () => setFormData((p) => ({ ...p, evidence: [...p.evidence, { type: 'text', value: '' }] }));
  const removeEvidence = (i) => setFormData((p) => ({ ...p, evidence: p.evidence.filter((_, idx) => idx !== i) }));

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((p) => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude, useLocation: true }));
          toast.success('Location captured!');
        },
        () => toast.error('Could not get location')
      );
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        evidence: formData.evidence.filter((e) => e.value.trim()),
        location: { city: formData.city, state: formData.state },
        lat: formData.lat || 0,
        lng: formData.lng || 0,
      };
      await api.post('/scams', payload);
      toast.success('Scam reported! It will be reviewed by our team.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 max-w-2xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Report a Scam</h1>
        <p className="text-white/40">Help protect others by reporting scams you've encountered</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-10">
        {STEPS.map(({ id, label, icon: Icon }, i) => (
          <div key={id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step > id ? 'bg-accent-green border-accent-green' :
                step === id ? 'bg-red border-red shadow-glow-red' :
                'bg-navy-lighter border-white/20'
              }`}>
                {step > id ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${step >= id ? 'text-white' : 'text-white/30'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > id ? 'bg-accent-green' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card p-6">
        {/* Step 1: Type */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-bold text-white mb-6">What type of scam is this?</h2>
            <div className="grid grid-cols-2 gap-3">
              {SCAM_TYPES.map(({ value, label, color, icon }) => (
                <button
                  key={value}
                  onClick={() => update('type', value)}
                  style={{
                    borderColor: formData.type === value ? `${color}60` : 'rgba(255,255,255,0.08)',
                    backgroundColor: formData.type === value ? `${color}15` : 'transparent',
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:border-white/20"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red text-sm mt-3">{errors.type}</p>}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-up">
            <h2 className="text-xl font-bold text-white">Describe the scam</h2>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Fake SBI SMS asking for OTP"
                className="input-field"
                maxLength={100}
              />
              {errors.title && <p className="text-red text-xs mt-1">{errors.title}</p>}
              <p className="text-xs text-white/30 mt-1">{formData.title.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe what happened in detail — what did the scammer say/do, what they asked for, how you found out it was a scam..."
                className="input-field resize-none"
                rows={5}
                maxLength={2000}
              />
              {errors.description && <p className="text-red text-xs mt-1">{errors.description}</p>}
              <p className="text-xs text-white/30 mt-1">{formData.description.length}/2000</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="e.g. whatsapp, otp, bank, sbi"
                className="input-field"
              />
            </div>

            {/* AI Classification */}
            {formData.description.length >= 10 && (
              <AIClassifyBox
                description={formData.description}
                onTypeDetected={(type) => {
                  if (!formData.type) update('type', type);
                }}
              />
            )}
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div className="animate-fade-up space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Add Evidence</h2>
              <p className="text-sm text-white/40">Add phone numbers, emails, URLs, UPI IDs, or screenshots to strengthen the report</p>
            </div>

            {blacklistWarning && (
              <div className="flex items-start gap-3 p-4 bg-red/10 border border-red/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red">⚠️ Already Blacklisted!</p>
                  <p className="text-xs text-white/60 mt-0.5">{blacklistWarning.message}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formData.evidence.map((ev, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={ev.type}
                    onChange={(e) => handleEvidenceChange(i, 'type', e.target.value)}
                    className="input-field w-28 text-sm py-2"
                  >
                    <option value="text">Text</option>
                    <option value="url">URL/Link</option>
                    <option value="image">Image URL</option>
                  </select>
                  <input
                    type="text"
                    value={ev.value}
                    onChange={(e) => handleEvidenceChange(i, 'value', e.target.value)}
                    placeholder={
                      ev.type === 'text' ? 'Phone no., email, UPI ID...' :
                      ev.type === 'url' ? 'Scam website URL...' : 'Screenshot URL...'
                    }
                    className="input-field flex-1 py-2 text-sm"
                  />
                  {formData.evidence.length > 1 && (
                    <button onClick={() => removeEvidence(i)} className="text-white/30 hover:text-red transition-colors px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addEvidence} className="text-sm text-accent-blue hover:text-white transition-colors flex items-center gap-1">
              + Add another piece of evidence
            </button>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="animate-fade-up space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Location (Optional)</h2>
              <p className="text-sm text-white/40">Help others in your area by specifying where this scam occurred</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">City</label>
                <input type="text" value={formData.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g. Mumbai" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">State</label>
                <select value={formData.state} onChange={(e) => update('state', e.target.value)} className="input-field">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={getLocation}
              className="flex items-center gap-2 btn-secondary py-3 w-full justify-center"
            >
              <MapPin className="w-4 h-4" />
              {formData.useLocation ? '✅ Location Captured — Click to Reset' : 'Use My Current Location (GPS)'}
            </button>

            {/* Summary */}
            <div className="bg-navy-lighter rounded-xl p-4 border border-white/5">
              <p className="text-sm font-semibold text-white/70 mb-3">Report Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/40">Type:</span><span className="text-white font-medium capitalize">{formData.type}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Title:</span><span className="text-white/80 text-right max-w-xs truncate">{formData.title}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Evidence:</span><span className="text-white">{formData.evidence.filter((e) => e.value.trim()).length} item(s)</span></div>
                {formData.state && <div className="flex justify-between"><span className="text-white/40">Location:</span><span className="text-white">{formData.city && `${formData.city}, `}{formData.state}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button onClick={back} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={next} className="btn-primary flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
