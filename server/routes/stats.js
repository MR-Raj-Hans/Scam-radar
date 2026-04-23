const express = require('express');
const router = express.Router();
const { getStats, getAdminStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', getStats);
router.get('/admin', protect, adminOnly, getAdminStats);

module.exports = router;
