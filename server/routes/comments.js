const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentsController');
const { protect } = require('../middleware/auth');

router.get('/:scamId', getComments);
router.post('/:scamId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
