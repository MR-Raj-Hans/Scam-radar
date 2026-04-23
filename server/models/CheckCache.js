const mongoose = require('mongoose');

const checkCacheSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true }, // the phone/email/URL
  type: { type: String, enum: ['phone', 'email', 'url'] },

  // ─── Phone specific ───────────────────────────────
  phoneData: {
    carrier: String,           // "Reliance Jio"
    lineType: String,          // "mobile" / "landline"
    circle: String,            // "Maharashtra"
    countryCode: String,       // "+91"
    valid: Boolean,
    traiOperator: String,
    traiCircle: String,
    traiCircleCode: String,
    traiTechnology: String,
    traiServiceType: String,
    isCommercialSeries: Boolean,
    governmentVerified: Boolean,
    dndApplicable: Boolean,
    source: String,
  },

  // ─── Email specific ───────────────────────────────
  emailData: {
    breached: Boolean,
    breachCount: Number,
    breachNames: [String],     // ["Adobe", "LinkedIn"]
    disposable: Boolean,       // is it a temp email?
    deliverable: Boolean,
  },

  // ─── URL specific ────────────────────────────────
  urlData: {
    googleSafeBrowsing: Boolean,   // flagged by Google?
    phishTank: Boolean,            // in PhishTank DB?
    threatType: String,            // "MALWARE" / "PHISHING"
    domainAge: Number,             // days old
    ssl: Boolean,                  // has SSL cert?
  },

  // ─── Common risk score ────────────────────────────
  riskLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'SAFE'] },
  riskScore: { type: Number, min: 0, max: 100 },
  riskReasons: [String],          // ["Found in 3 breach databases", "Flagged by Google"]

  // Internal DB data
  inBlacklist: { type: Boolean, default: false },
  blacklistReportCount: { type: Number, default: 0 },
  linkedNewsArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewsScam' }],

  // Cache management
  lastChecked: { type: Date, default: Date.now },
  nextRefreshAt: { type: Date },   // lastChecked + 2 days
  fetchCount: { type: Number, default: 1 },
});

// TTL index — Mongoose auto-deletes cache after 2 days if not re-queried
checkCacheSchema.index({ nextRefreshAt: 1 }, { expireAfterSeconds: 0 });
checkCacheSchema.index({ value: 1 }, { unique: true });
checkCacheSchema.index({ type: 1, riskLevel: 1 });

module.exports = mongoose.model('CheckCache', checkCacheSchema);
