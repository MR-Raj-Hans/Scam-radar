const express = require('express');
const router = express.Router();
const {
  getAllScams, getScamById, createScam, getTrending,
  getNearby, upvoteScam, updateScamStatus, facetedSearch, getMyScams
} = require('../controllers/scamsController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Important: specific routes before :id
router.get('/trending', getTrending);
router.get('/nearby', getNearby);
router.get('/search', facetedSearch);
router.get('/my', protect, getMyScams);

router.get('/', optionalAuth, getAllScams);
router.post('/', protect, createScam);
router.get('/:id', getScamById);
router.post('/:id/upvote', protect, upvoteScam);
router.patch('/:id/status', protect, adminOnly, updateScamStatus);

module.exports = router;
