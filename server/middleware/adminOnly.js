const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ success: false, message: 'Access denied — Admin/Moderator only' });
  }
  next();
};

const strictAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied — Admin only' });
  }
  next();
};

module.exports = { adminOnly, strictAdminOnly };
