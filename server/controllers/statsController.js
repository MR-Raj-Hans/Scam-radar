const Scam = require('../models/Scam');
const User = require('../models/User');
const Report = require('../models/Report');
const Blacklist = require('../models/Blacklist');
const Comment = require('../models/Comment');
const NewsScam = require('../models/NewsScam');

// @desc  Get platform stats
// @route GET /api/stats
// @access Public
const getStats = async (req, res, next) => {
  try {
    const [totalUserScams, totalNewsScams, totalUsers, totalReports, totalBlacklisted, pendingScams, verifiedScams, recentNews] = await Promise.all([
      Scam.countDocuments(),
      NewsScam.countDocuments(),
      User.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Blacklist.countDocuments(),
      Scam.countDocuments({ status: 'pending' }),
      Scam.countDocuments({ status: 'verified' }),
      NewsScam.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    // Recent activity (last 7 days)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUserScams, recentUsers] = await Promise.all([
      Scam.countDocuments({ createdAt: { $gte: since } }),
      User.countDocuments({ joinedAt: { $gte: since } }),
    ]);

    const totalScams = totalUserScams + totalNewsScams;
    const recentScams = recentUserScams + recentNews;

    res.json({
      success: true,
      stats: {
        totalScams,
        totalUsers,
        totalReports,
        totalBlacklisted,
        pendingScams,
        verifiedScams,
        recentScams,
        recentUsers,
        usersProtected: totalUsers * 3, // Estimated reach
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get admin dashboard stats (all collections)
// @route GET /api/stats/admin
// @access Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [byType, byStatus, topReporters] = await Promise.all([
      Scam.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 }, upvotes: { $sum: '$upvotes' } } },
        { $sort: { count: -1 } },
      ]),
      Scam.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.find({ reportsSubmitted: { $gt: 0 } })
        .sort({ reportsSubmitted: -1 })
        .limit(5)
        .select('name email reportsSubmitted avatar')
        .lean(),
    ]);

    res.json({ success: true, byType, byStatus, topReporters });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAdminStats };
