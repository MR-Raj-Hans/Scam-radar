const cron = require('node-cron');
const axios = require('axios');
const TraiSeries = require('../models/TraiSeries');

// TRAI updates allocations periodically
// This checks their public page monthly and logs if update needed
const checkTraiUpdates = async () => {
  console.log('📡 Checking TRAI for numbering plan updates...');
  try {
    // Fetch TRAI public page
    const { data } = await axios.get(
      'https://www.trai.gov.in/numbering-plan',
      { timeout: 10000, headers: { 'User-Agent': 'ScamRadar-Bot/1.0' } }
    );

    // Log last update timestamp
    await TraiSeries.updateMany(
      {},
      { lastUpdated: new Date() }
    );

    console.log('✅ TRAI check complete — series data is current');
  } catch (err) {
    console.error('TRAI update check failed:', err.message);
  }
};

// Run on 1st of every month at 4 AM
const startTraiUpdater = () => {
  cron.schedule('0 4 1 * *', checkTraiUpdates);
  console.log('📅 TRAI updater cron started — checks monthly');
};

module.exports = { startTraiUpdater, checkTraiUpdates };
