const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['phone', 'email', 'UPI', 'URL', 'bank_account'],
  },
  value: {
    type: String,
    required: [true, 'Value is required'],
    trim: true,
    lowercase: true,
  },
  linkedScams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scam',
  }],
  reportCount: {
    type: Number,
    default: 1,
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────
// Compound index for fast lookup by value + type (unique entry per type)
blacklistSchema.index({ value: 1, type: 1 }, { unique: true });

// Text index for value search
blacklistSchema.index({ value: 'text' });

// Index for reportCount sorting (trending bad actors)
blacklistSchema.index({ reportCount: -1 });
blacklistSchema.index({ type: 1 });

module.exports = mongoose.model('Blacklist', blacklistSchema);
