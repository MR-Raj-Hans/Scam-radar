const express = require('express');
const router = express.Router();
const { getOrFetch } = require('../services/cacheService');

// POST /api/check
router.post('/', async (req, res) => {
  try {
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: 'Value is required' });

    const result = await getOrFetch(value.trim());
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/check/stats — how many checked total
router.get('/stats', async (req, res) => {
  const CheckCache = require('../models/CheckCache');
  try {
    const stats = await CheckCache.aggregate([
      { $group: { _id: '$type', total: { $sum: 1 }, highRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] } } } }
    ]);
    res.json(stats);
  } catch (err) {
      res.status(500).json({ error: 'Failed to fetch check stats' });
  }
});

module.exports = router;
