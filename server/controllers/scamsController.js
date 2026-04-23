const Scam = require('../models/Scam');
const Report = require('../models/Report');
const Blacklist = require('../models/Blacklist');
const User = require('../models/User');

// @desc  Get all scams (paginated + filtered)
// @route GET /api/scams
// @access Public
const getAllScams = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, type, status = 'verified', search, state, sort = 'newest' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const matchScam = {};
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
      if (status) matchScam.status = status;
    } else {
      matchScam.status = 'verified';
    }
    if (type && type !== 'all') matchScam.type = type;
    if (state) matchScam['location.state'] = new RegExp(state, 'i');

    const matchNews = {};
    if (type && type !== 'all') matchNews.scamType = type;
    if (state) matchNews.state = new RegExp(state, 'i');

    if (search) {
      matchScam.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      matchNews.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'popular') sortObj = { upvotes: -1 };
    else if (sort === 'most_reported') sortObj = { reportCount: -1 };

    const result = await Scam.aggregate([
      { $match: matchScam },
      { $lookup: { from: 'users', localField: 'reportedBy', foreignField: '_id', as: 'reportedByUser' } },
      { $addFields: { reportedBy: { $arrayElemAt: ['$reportedByUser', 0] }, source_type: 'community' } },
      { $project: { reportedByUser: 0 } },
      {
        $unionWith: {
          coll: 'newsscams',
          pipeline: [
            { $match: matchNews },
            { 
              $project: { 
                 _id: 1,
                 title: 1, 
                 description: 1, 
                 type: '$scamType', 
                 location: { state: '$state', city: '$city' },
                 upvotes: { $literal: 0 },
                 reportCount: { $literal: 1 },
                 status: { $literal: 'verified' },
                 createdAt: '$publishedAt',
                 source_type: { $literal: 'news' },
                 reportedBy: { name: '$source', role: 'news' },
                 url: 1
              } 
            }
          ]
        }
      },
      { $sort: sortObj },
      {
        $facet: {
          metadata: [ { $count: "total" } ],
          data: [ { $skip: skip }, { $limit: Number(limit) } ]
        }
      }
    ]);

    const total = result[0].metadata[0]?.total || 0;
    const scams = result[0].data;

    res.json({
      success: true,
      scams,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single scam with report count ($lookup equivalent)
// @route GET /api/scams/:id
// @access Public
const getScamById = async (req, res, next) => {
  try {
    const result = await Scam.aggregate([
      { $match: { _id: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      // $lookup: join with reports collection to get report count
      {
        $lookup: {
          from: 'reports',
          localField: '_id',
          foreignField: 'scamId',
          as: 'reports',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'reportedBy',
          foreignField: '_id',
          as: 'reportedByUser',
          pipeline: [{ $project: { name: 1, avatar: 1, role: 1 } }],
        },
      },
      {
        $addFields: {
          reportCount: { $size: '$reports' },
          reportedBy: { $arrayElemAt: ['$reportedByUser', 0] },
        },
      },
      { $project: { reports: 0, reportedByUser: 0 } },
    ]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: 'Scam not found' });
    }

    res.json({ success: true, scam: result[0] });
  } catch (error) {
    next(error);
  }
};

// @desc  Create new scam
// @route POST /api/scams
// @access Private
const createScam = async (req, res, next) => {
  try {
    const { title, description, type, evidence, location, tags, lng, lat } = req.body;

    const coordinates = {
      type: 'Point',
      coordinates: [Number(lng) || 0, Number(lat) || 0],
    };

    const scam = await Scam.create({
      title,
      description,
      type,
      reportedBy: req.user._id,
      evidence: evidence || [],
      location: {
        city: location?.city || '',
        state: location?.state || '',
        coordinates,
      },
      tags: tags || [],
    });

    // Auto-add evidence phone/email/UPI/URL to blacklist
    if (evidence && evidence.length > 0) {
      for (const ev of evidence) {
        let blacklistType = null;
        if (ev.type === 'url') blacklistType = 'URL';
        else if (ev.type === 'text') {
          const val = ev.value.trim();
          if (/^\d{10}$/.test(val)) blacklistType = 'phone';
          else if (/@/.test(val)) blacklistType = 'email';
          else if (val.includes('@') && !val.includes(' ')) blacklistType = 'UPI';
        }

        if (blacklistType) {
          await Blacklist.findOneAndUpdate(
            { value: ev.value.toLowerCase(), type: blacklistType },
            { $inc: { reportCount: 1 }, $addToSet: { linkedScams: scam._id } },
            { upsert: true, new: true }
          );
        }
      }
    }

    // Increment user's report count
    await User.findByIdAndUpdate(req.user._id, { $inc: { reportsSubmitted: 1 } });

    await scam.populate('reportedBy', 'name avatar role');

    res.status(201).json({ success: true, message: 'Scam reported successfully — pending review', scam });
  } catch (error) {
    next(error);
  }
};

// @desc  Trending scams via aggregation pipeline
// @route GET /api/scams/trending
// @access Public
const getTrending = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    // Aggregation pipeline: group by type, count, get top scams per type
    const trendingByType = await Scam.aggregate([
      { $match: { status: 'verified', createdAt: { $gte: since } } },
      { $project: { type: 1, upvotes: 1, reportCount: 1, title: 1 } },
      {
        $unionWith: {
          coll: 'newsscams',
          pipeline: [
            { $match: { publishedAt: { $gte: since }, scamType: { $ne: 'other' } } },
            { $project: { type: '$scamType', upvotes: { $literal: 0 }, reportCount: { $literal: 1 }, title: 1 } }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUpvotes: { $sum: { $ifNull: ['$upvotes', 0] } },
          totalReports: { $sum: { $ifNull: ['$reportCount', 1] } },
          latestScam: { $last: '$title' },
          avgUpvotes: { $avg: { $ifNull: ['$upvotes', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $project: {
          type: '$_id',
          count: 1,
          totalUpvotes: 1,
          totalReports: 1,
          latestScam: 1,
          avgUpvotes: { $round: ['$avgUpvotes', 1] },
          _id: 0,
        },
      },
    ]);

    // Top individual scams merged
    const topScams = await Scam.aggregate([
      { $match: { status: 'verified', createdAt: { $gte: since } } },
      { $lookup: { from: 'users', localField: 'reportedBy', foreignField: '_id', as: 'reportedByUser' } },
      { $addFields: { reportedBy: { $arrayElemAt: ['$reportedByUser', 0] }, source_type: 'community' } },
      { $project: { reportedByUser: 0 } },
      {
        $unionWith: {
          coll: 'newsscams',
          pipeline: [
            { $match: { publishedAt: { $gte: since } } },
            { 
              $project: { 
                 _id: 1,
                 title: 1, 
                 description: 1, 
                 type: '$scamType', 
                 location: { state: '$state', city: '$city' },
                 upvotes: { $literal: 0 },
                 reportCount: { $literal: 1 },
                 status: { $literal: 'verified' },
                 createdAt: '$publishedAt',
                 source_type: { $literal: 'news' },
                 reportedBy: { name: '$source', role: 'news' },
                 url: 1
              } 
            }
          ]
        }
      },
      { $sort: { upvotes: -1, reportCount: -1, createdAt: -1 } },
      { $limit: 10 }
    ]);

    // Scams by state (aggregation for heatmap)
    const byState = await Scam.aggregate([
      { $match: { status: 'verified', 'location.state': { $ne: '' } } },
      { $project: { state: '$location.state' } },
      {
        $unionWith: {
          coll: 'newsscams',
          pipeline: [
            { $match: { state: { $ne: '' }, publishedAt: { $gte: since } } },
            { $project: { state: 1 } }
          ]
        }
      },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({ success: true, trendingByType, topScams, byState });
  } catch (error) {
    next(error);
  }
};

// @desc  Get scams near user location
// @route GET /api/scams/nearby?lng=&lat=&maxDistance=
// @access Public
const getNearby = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 50000, limit = 10 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'lng and lat query params are required' });
    }

    const scams = await Scam.find({
      status: 'verified',
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
    })
      .limit(Number(limit))
      .populate('reportedBy', 'name avatar')
      .lean();

    res.json({ success: true, scams, count: scams.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Upvote a scam
// @route POST /api/scams/:id/upvote
// @access Private
const upvoteScam = async (req, res, next) => {
  try {
    const scam = await Scam.findById(req.params.id);
    if (!scam) return res.status(404).json({ success: false, message: 'Scam not found' });

    const alreadyUpvoted = scam.upvotedBy.includes(req.user._id);

    if (alreadyUpvoted) {
      scam.upvotes -= 1;
      scam.upvotedBy.pull(req.user._id);
    } else {
      scam.upvotes += 1;
      scam.upvotedBy.push(req.user._id);
    }

    await scam.save();
    res.json({ success: true, upvotes: scam.upvotes, upvoted: !alreadyUpvoted });
  } catch (error) {
    next(error);
  }
};

// @desc  Update scam status (admin/moderator)
// @route PATCH /api/scams/:id/status
// @access Admin/Moderator
const updateScamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const scam = await Scam.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!scam) return res.status(404).json({ success: false, message: 'Scam not found' });

    res.json({ success: true, message: `Scam ${status}`, scam });
  } catch (error) {
    next(error);
  }
};

// @desc  Advanced faceted search ($facet)
// @route GET /api/scams/search
// @access Public
const facetedSearch = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });

    const result = await Scam.aggregate([
      {
        $match: {
          $text: { $search: q },
          status: 'verified',
        },
      },
      { $addFields: { score: { $meta: 'textScore' } } },
      {
        $facet: {
          // By type category
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // By state (location)
          byLocation: [
            { $match: { 'location.state': { $ne: '' } } },
            { $group: { _id: '$location.state', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          // By date (last 30 days buckets)
          byDate: [
            {
              $bucket: {
                groupBy: '$createdAt',
                boundaries: [
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  new Date(),
                ],
                default: 'older',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          // Paginated results
          results: [
            { $sort: { score: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $lookup: {
                from: 'users',
                localField: 'reportedBy',
                foreignField: '_id',
                as: 'reportedByUser',
                pipeline: [{ $project: { name: 1, avatar: 1 } }],
              },
            },
            { $addFields: { reportedBy: { $arrayElemAt: ['$reportedByUser', 0] } } },
            { $project: { reportedByUser: 0 } },
          ],
          // Total count
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result[0];
    res.json({
      success: true,
      results: data.results,
      facets: {
        byType: data.byType,
        byLocation: data.byLocation,
        byDate: data.byDate,
      },
      total: data.totalCount[0]?.count || 0,
      page: Number(page),
      pages: Math.ceil((data.totalCount[0]?.count || 0) / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's own scams
// @route GET /api/scams/my
// @access Private
const getMyScams = async (req, res, next) => {
  try {
    const scams = await Scam.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, scams });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllScams, getScamById, createScam, getTrending, getNearby, upvoteScam, updateScamStatus, facetedSearch, getMyScams };
