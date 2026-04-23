const mongoose = require('mongoose');

const newsScamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  source: { type: String, default: 'Google News' },
  url: { type: String, unique: true, required: true },
  publishedAt: { type: Date, default: Date.now },
  thumbnail: { type: String, default: '' },

  // Auto-extracted by regex
  extractedPhones: [{ type: String }],
  extractedURLs: [{ type: String }],
  extractedEmails: [{ type: String }],
  extractedAmount: { type: Number, default: null },

  // Keyword-classified
  scamType: {
    type: String,
    enum: ['phishing', 'UPI fraud', 'fake job', 'lottery', 'romance', 'investment', 'banking', 'other'],
    default: 'other',
  },

  // NLP-extracted location
  state: { type: String, default: '' },
  city: { type: String, default: '' },

  // Meta flags
  autoAddedToBlacklist: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  source_type: { type: String, default: 'news' },

  createdAt: { type: Date, default: Date.now },
});

// Indexes
newsScamSchema.index({ publishedAt: -1 });
newsScamSchema.index({ scamType: 1 });
newsScamSchema.index({ extractedPhones: 1 });
newsScamSchema.index({ url: 1 }, { unique: true });
newsScamSchema.index({ state: 1 });
newsScamSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NewsScam', newsScamSchema);
