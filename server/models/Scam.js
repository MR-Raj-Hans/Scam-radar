const mongoose = require('mongoose');

const scamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  type: {
    type: String,
    required: [true, 'Scam type is required'],
    enum: ['phishing', 'UPI fraud', 'fake job', 'lottery', 'romance', 'investment'],
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  evidence: [{
    type: { type: String, enum: ['image', 'url', 'text'], required: true },
    value: { type: String, required: true },
  }],
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    // GeoJSON Point for $near queries
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  reportCount: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────
// Full-text search on title, description, tags
scamSchema.index({ title: 'text', description: 'text', tags: 'text' });

// 2dsphere index for geo queries ($near)
scamSchema.index({ 'location.coordinates': '2dsphere' });

// Regular indexes for filtering
scamSchema.index({ status: 1, createdAt: -1 });
scamSchema.index({ type: 1, status: 1 });
scamSchema.index({ reportedBy: 1 });
scamSchema.index({ upvotes: -1 });

// TTL index: auto-delete pending scams after 7 days
// Only applies to documents where status = 'pending'
scamSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 604800,
    partialFilterExpression: { status: 'pending' },
    name: 'pending_scam_ttl',
  }
);

module.exports = mongoose.model('Scam', scamSchema);
