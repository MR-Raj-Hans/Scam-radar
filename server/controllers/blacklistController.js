const Blacklist = require('../models/Blacklist');
const Scam = require('../models/Scam');

// @desc  Check if a value is blacklisted (instant indexed lookup)
// @route GET /api/blacklist/check?value=&type=
// @access Public
const checkBlacklist = async (req, res, next) => {
  try {
    const { value, type } = req.query;

    if (!value) {
      return res.status(400).json({ success: false, message: 'value query parameter is required' });
    }

    const normalizedValue = value.toLowerCase().trim();

    // Build query — use compound index if type provided, else just value
    const query = type
      ? { value: normalizedValue, type }
      : { value: normalizedValue };

    const entries = await Blacklist.find(query)
      .populate({ path: 'linkedScams', select: 'title type status upvotes createdAt', match: { status: 'verified' } })
      .lean();

    if (!entries.length) {
      return res.json({
        success: true,
        found: false,
        riskLevel: 'SAFE',
        message: 'No records found — this appears to be clean',
      });
    }

    // Determine risk level based on report count
    const maxReports = Math.max(...entries.map((e) => e.reportCount));
    let riskLevel = 'LOW';
    if (maxReports >= 10) riskLevel = 'HIGH';
    else if (maxReports >= 3) riskLevel = 'MEDIUM';

    res.json({
      success: true,
      found: true,
      riskLevel,
      entries,
      totalReports: entries.reduce((sum, e) => sum + e.reportCount, 0),
      message: `⚠️ This ${entries[0].type} is flagged as ${riskLevel} risk with ${maxReports} reports`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Add to blacklist
// @route POST /api/blacklist
// @access Admin/Moderator
const addToBlacklist = async (req, res, next) => {
  try {
    const { type, value, linkedScamId, notes, riskLevel } = req.body;

    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'type and value are required' });
    }

    const entry = await Blacklist.findOneAndUpdate(
      { value: value.toLowerCase().trim(), type },
      {
        $inc: { reportCount: 1 },
        $set: { notes: notes || '', riskLevel: riskLevel || 'MEDIUM', addedBy: req.user._id },
        $addToSet: { linkedScams: linkedScamId ? [linkedScamId] : [] },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Added to blacklist', entry });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all blacklist entries (paginated)
// @route GET /api/blacklist
// @access Public
const getAllBlacklist = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, sort = 'reportCount' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (type) query.type = type;

    const [entries, total] = await Promise.all([
      Blacklist.find(query)
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Blacklist.countDocuments(query),
    ]);

    res.json({
      success: true,
      entries,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete blacklist entry
// @route DELETE /api/blacklist/:id
// @access Admin only
const deleteBlacklistEntry = async (req, res, next) => {
  try {
    const entry = await Blacklist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry removed from blacklist' });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkBlacklist, addToBlacklist, getAllBlacklist, deleteBlacklistEntry };
