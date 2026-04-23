const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  scamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scam',
    required: [true, 'Scam ID is required'],
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required'],
  },
  additionalDetails: {
    type: String,
    maxlength: [1000, 'Additional details cannot exceed 1000 characters'],
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Prevent duplicate reports from same user on same scam
reportSchema.index({ scamId: 1, reportedBy: 1 }, { unique: true });
reportSchema.index({ scamId: 1 });
reportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
