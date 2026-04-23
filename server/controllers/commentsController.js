const Comment = require('../models/Comment');

// @desc  Get comments for a scam
// @route GET /api/comments/:scamId
// @access Public
const getComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ scamId: req.params.scamId })
        .populate('userId', 'name avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Comment.countDocuments({ scamId: req.params.scamId }),
    ]);

    res.json({ success: true, comments, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Add a comment to a scam
// @route POST /api/comments/:scamId
// @access Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Comment must be at least 2 characters' });
    }

    const comment = await Comment.create({
      scamId: req.params.scamId,
      userId: req.user._id,
      text: text.trim(),
    });

    await comment.populate('userId', 'name avatar role');
    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a comment
// @route DELETE /api/comments/:commentId
// @access Private (owner or admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, addComment, deleteComment };
