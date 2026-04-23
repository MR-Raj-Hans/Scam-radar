const Report = require('../models/Report');
const Scam = require('../models/Scam');

// @desc  Submit a report on an existing scam
// @route POST /api/reports
// @access Private
const createReport = async (req, res, next) => {
  try {
    const { scamId, additionalDetails } = req.body;

    if (!scamId) {
      return res.status(400).json({ success: false, message: 'scamId is required' });
    }

    const scam = await Scam.findById(scamId);
    if (!scam) return res.status(404).json({ success: false, message: 'Scam not found' });

    // Check for duplicate report
    const existing = await Report.findOne({ scamId, reportedBy: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this scam' });
    }

    const report = await Report.create({
      scamId,
      reportedBy: req.user._id,
      additionalDetails: additionalDetails || '',
    });

    // Increment scam's report count
    await Scam.findByIdAndUpdate(scamId, { $inc: { reportCount: 1 } });

    res.status(201).json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reported this scam' });
    }
    next(error);
  }
};

// @desc  Get all reports for a scam
// @route GET /api/reports/:scamId
// @access Public
const getReportsByScam = async (req, res, next) => {
  try {
    const reports = await Report.find({ scamId: req.params.scamId })
      .populate('reportedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reports, count: reports.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user's reports
// @route GET /api/reports/my
// @access Private
const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate('scamId', 'title type status upvotes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReportsByScam, getMyReports };
