const CheckCache = require('../models/CheckCache');
const { checkPhone, checkEmail, checkURL } = require('./checkerService');

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

const detectType = (value) => {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  if (/^https?:\/\//i.test(value)) return 'url';
  if (/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) return 'phone';
  return null;
};

const getOrFetch = async (value) => {
  const type = detectType(value.trim());
  if (!type) throw new Error('Invalid input — enter a 10-digit phone number, email, or valid URL');

  // Check cache first
  const cached = await CheckCache.findOne({ value });
  const now = Date.now();

  // Return cache if still fresh (under 2 days old)
  if (cached && cached.nextRefreshAt > now) {
    return { ...cached.toObject(), fromCache: true };
  }

  // Fetch fresh data from APIs
  let freshData;
  if (type === 'phone') freshData = await checkPhone(value);
  else if (type === 'email') freshData = await checkEmail(value);
  else freshData = await checkURL(value);

  // Upsert into cache
  const result = await CheckCache.findOneAndUpdate(
    { value },
    {
      ...freshData,
      value,
      type,
      lastChecked: new Date(),
      nextRefreshAt: new Date(now + TWO_DAYS),
      $inc: { fetchCount: cached ? 1 : 0 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { ...result.toObject(), fromCache: false };
};

module.exports = { getOrFetch };
