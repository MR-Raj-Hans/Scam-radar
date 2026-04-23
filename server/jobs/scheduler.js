const cron = require('node-cron');
const { scrapeAllFeeds } = require('./newsScraper');

let isRunning = false; // Prevent overlapping runs

const runScraper = async (trigger = 'scheduled') => {
  if (isRunning) {
    console.log(`⏳ [Scheduler] Scraper already running — skipping ${trigger} trigger`);
    return;
  }
  isRunning = true;
  try {
    await scrapeAllFeeds();
  } catch (err) {
    console.error(`[Scheduler] Scraper failed: ${err.message}`);
  } finally {
    isRunning = false;
  }
};

const startScheduler = () => {
  console.log('📅 [Scheduler] News scraper scheduler starting...');

  // Run immediately on server start (with a small delay to let DB settle)
  setTimeout(() => runScraper('startup'), 3000);

  // Run every 2 hours: "0 */2 * * *"
  cron.schedule('0 */2 * * *', () => {
    console.log('⏰ [Scheduler] Cron triggered — running news scraper');
    runScraper('cron');
  });

  console.log('✅ [Scheduler] News scraper will run every 2 hours automatically');
};

// Manual trigger endpoint helper
const triggerManualScrape = async () => {
  return await runScraper('manual');
};

module.exports = { startScheduler, triggerManualScrape };
