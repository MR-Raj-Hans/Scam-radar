const express = require('express');
const router = express.Router();
const { checkBlacklist, addToBlacklist, getAllBlacklist, deleteBlacklistEntry } = require('../controllers/blacklistController');
const { protect } = require('../middleware/auth');
const { adminOnly, strictAdminOnly } = require('../middleware/adminOnly');

router.get('/check', checkBlacklist);
router.get('/', getAllBlacklist);
router.post('/', protect, adminOnly, addToBlacklist);
router.delete('/:id', protect, strictAdminOnly, deleteBlacklistEntry);

module.exports = router;
