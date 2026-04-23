const express = require('express');
const router = express.Router();
const NewsScam = require('../models/NewsScam');

// GET /api/news — paginated news feed
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, state } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.scamType = type;
    if (state) filter.state = state;

    const news = await NewsScam.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await NewsScam.countDocuments(filter);

    res.json({ news, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news feed', error: error.message });
  }
});

// GET /api/news/latest — last 5 for ticker/banner
router.get('/latest', async (req, res) => {
  try {
    const news = await NewsScam.find()
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title source publishedAt scamType state');
    res.json(news);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest news' });
  }
});

// GET /api/news/stats — for dashboard
router.get('/stats', async (req, res) => {
  try {
    const stats = await NewsScam.aggregate([
      { $group: { _id: '$scamType', count: { $sum: 1 }, totalAmount: { $sum: '$extractedAmount' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news stats' });
  }
});

// GET /api/news/trending — last 48 hours most active
router.get('/trending', async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const trending = await NewsScam.find({ publishedAt: { $gte: cutoff } })
      .sort({ publishedAt: -1 })
      .limit(10);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trending news' });
  }
});

module.exports = router;
