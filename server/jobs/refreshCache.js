const cron = require('node-cron');
const CheckCache = require('../models/CheckCache');
const { checkPhone, checkEmail, checkURL } = require('../services/checkerService');

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

const refreshStaleCache = async () => {
  console.log('🔄 Starting stale cache refresh...');

  // Find all entries where nextRefreshAt has passed
  const stale = await CheckCache.find({
    nextRefreshAt: { $lte: new Date() }
  }).limit(500); // process 500 at a time

  console.log(`Found ${stale.length} stale Cache entries to refresh...`);

  for (const entry of stale) {
    try {
      let freshData;
      if (entry.type === 'phone') freshData = await checkPhone(entry.value);
      else if (entry.type === 'email') freshData = await checkEmail(entry.value);
      else freshData = await checkURL(entry.value);

      await CheckCache.findByIdAndUpdate(entry._id, {
        ...freshData,
        lastChecked: new Date(),
        nextRefreshAt: new Date(Date.now() + TWO_DAYS),
      });

      // Throttle — wait 500ms between API calls to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Failed to refresh ${entry.value}:`, err.message);
    }
  }
};

// Run every 2 days at 3 AM
const startRefreshJob = () => {
  cron.schedule('0 3 */2 * *', refreshStaleCache);
  console.log('📅 Cache refresh cron started — runs every 2 days at 3AM');
};

module.exports = { startRefreshJob, refreshStaleCache };
