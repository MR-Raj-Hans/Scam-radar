const express = require('express');
const router = express.Router();
const { createReport, getReportsByScam, getMyReports } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyReports);
router.post('/', protect, createReport);
router.get('/:scamId', getReportsByScam);

module.exports = router;
