const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  scamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scam',
    required: [true, 'Scam ID is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    minlength: [2, 'Comment must be at least 2 characters'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

commentSchema.index({ scamId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
