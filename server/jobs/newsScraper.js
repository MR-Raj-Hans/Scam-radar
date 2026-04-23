const Parser = require('rss-parser');
const NewsScam = require('../models/NewsScam');
const Blacklist = require('../models/Blacklist');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; ScamRadar/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: ['media:content', 'enclosure', 'source'],
  },
});

// ─── 10 RSS Feed URLs ─────────────────────────────────────────────
const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=scam+fraud+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'India Scam/Fraud',
  },
  {
    url: 'https://news.google.com/rss/search?q=UPI+fraud+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'UPI Fraud India',
  },
  {
    url: 'https://news.google.com/rss/search?q=cyber+crime+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Cyber Crime India',
  },
  {
    url: 'https://news.google.com/rss/search?q=phishing+attack+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Phishing India',
  },
  {
    url: 'https://news.google.com/rss/search?q=online+fraud+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Online Fraud India',
  },
  {
    url: 'https://news.google.com/rss/search?q=fake+job+scam+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Fake Job Scam India',
  },
  {
    url: 'https://news.google.com/rss/search?q=investment+fraud+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Investment Fraud India',
  },
  {
    url: 'https://news.google.com/rss/search?q=lottery+scam+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Lottery Scam India',
  },
  {
    url: 'https://news.google.com/rss/search?q=bank+fraud+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Bank Fraud India',
  },
  {
    url: 'https://news.google.com/rss/search?q=cybercrime+arrested+india&hl=en-IN&gl=IN&ceid=IN:en',
    label: 'Cybercrime Arrests India',
  },
];

// ─── Regex Extractors ────────────────────────────────────────────
const extractPhones = (text) => {
  const regex = /(?:\+91[-\s]?|0)?[6-9]\d{9}/g;
  const matches = text.match(regex) || [];
  // Normalize: remove spaces/dashes, ensure 10 digits
  return [...new Set(matches.map((m) => m.replace(/[\s\-+]/g, '').replace(/^91/, '').replace(/^0/, '')).filter((m) => m.length === 10))];
};

const extractEmails = (text) => {
  const regex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(regex) || [];
  // Filter out common news site emails
  const filtered = matches.filter(
    (e) => !e.includes('google') && !e.includes('ndtv') && !e.includes('timesofindia') && !e.includes('example')
  );
  return [...new Set(filtered.map((e) => e.toLowerCase()))];
};

const extractURLs = (text) => {
  const regex = /https?:\/\/(?!news\.google|google\.|ndtv\.|timesofindia\.|hindustantimes\.)[^\s,)"'<>]+/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches.map((u) => u.replace(/\.$/, '')))].slice(0, 5); // max 5 URLs
};

const extractAmount = (text) => {
  // Match ₹ amounts with Indian units
  const rupeeRegex = /(?:Rs\.?|₹|INR)\s?(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|crore|thousand|k|L|Cr)?/gi;
  const wordRegex = /(\d+(?:\.\d+)?)\s*(lakh|crore|thousand)\s*(?:rupees?|rs\.?)?/gi;

  let amount = null;
  let match;

  const multipliers = {
    lakh: 100000, l: 100000,
    crore: 10000000, cr: 10000000,
    thousand: 1000, k: 1000,
  };

  // Try ₹ pattern first
  rupeeRegex.lastIndex = 0;
  match = rupeeRegex.exec(text);
  if (match) {
    amount = parseFloat(match[1].replace(/,/g, ''));
    if (match[2]) {
      const mult = multipliers[match[2].toLowerCase()] || 1;
      amount *= mult;
    }
  }

  // Try word pattern if no ₹ symbol
  if (!amount) {
    wordRegex.lastIndex = 0;
    match = wordRegex.exec(text);
    if (match) {
      amount = parseFloat(match[1]);
      if (match[2]) {
        const mult = multipliers[match[2].toLowerCase()] || 1;
        amount *= mult;
      }
    }
  }

  return amount && amount > 0 ? Math.round(amount) : null;
};

// ─── Scam Type Classifier ─────────────────────────────────────────
const classifyScamType = (text) => {
  const lower = text.toLowerCase();

  const patterns = [
    { type: 'UPI fraud', keywords: ['upi', 'gpay', 'phonepe', 'paytm', 'bhim', 'qr code', 'collect request', 'payment link'] },
    { type: 'phishing', keywords: ['phishing', 'otp', 'fake link', 'aadhaar', 'kyc', 'account suspended', 'click here', 'verify your'] },
    { type: 'fake job', keywords: ['fake job', 'job scam', 'work from home', 'data entry', 'part time job', 'recruitment fraud', 'job offer', 'hiring fraud'] },
    { type: 'lottery', keywords: ['lottery', 'prize', 'winner', 'kbc', 'lucky draw', 'jackpot', 'free gift', 'claim your'] },
    { type: 'investment', keywords: ['investment fraud', 'trading scam', 'crypto scam', 'ponzi', 'guaranteed return', 'stock tips', 'forex', 'pig butchering', 'doubling money'] },
    { type: 'romance', keywords: ['romance scam', 'dating fraud', 'matrimonial fraud', 'online relationship', 'love scam', 'catfish'] },
    { type: 'banking', keywords: ['bank fraud', 'credit card fraud', 'atm fraud', 'net banking', 'account hacked', 'debit card scam', 'loan app'] },
  ];

  for (const { type, keywords } of patterns) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return 'other';
};

// ─── State / City Extractor ───────────────────────────────────────
const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana',
  'Kerala', 'Punjab', 'Haryana', 'Bihar', 'Madhya Pradesh',
  'Andhra Pradesh', 'Odisha', 'Jharkhand', 'Assam', 'Goa',
  'Himachal Pradesh', 'Uttarakhand', 'Chhattisgarh', 'Manipur', 'Nagaland',
];

const MAJOR_CITIES = {
  Mumbai: 'Maharashtra', Pune: 'Maharashtra', Nagpur: 'Maharashtra',
  Delhi: 'Delhi', 'New Delhi': 'Delhi', Noida: 'Uttar Pradesh', Gurgaon: 'Haryana',
  Bangalore: 'Karnataka', Bengaluru: 'Karnataka', Mysore: 'Karnataka',
  Chennai: 'Tamil Nadu', Coimbatore: 'Tamil Nadu',
  Hyderabad: 'Telangana', Secunderabad: 'Telangana',
  Kolkata: 'West Bengal', Ahmedabad: 'Gujarat', Surat: 'Gujarat',
  Jaipur: 'Rajasthan', Lucknow: 'Uttar Pradesh', Kanpur: 'Uttar Pradesh',
  Bhopal: 'Madhya Pradesh', Indore: 'Madhya Pradesh',
  Kochi: 'Kerala', Thiruvananthapuram: 'Kerala',
  Chandigarh: 'Punjab', Amritsar: 'Punjab',
  Patna: 'Bihar', Ranchi: 'Jharkhand', Bhubaneswar: 'Odisha',
  Guwahati: 'Assam', Panaji: 'Goa',
};

const extractLocation = (text) => {
  let state = null;
  let city = null;

  // Check for cities first (more specific)
  for (const [c, s] of Object.entries(MAJOR_CITIES)) {
    if (text.includes(c)) {
      city = c;
      state = s;
      break;
    }
  }

  // Fall back to state-level match
  if (!state) {
    state = INDIAN_STATES.find((s) => text.includes(s)) || null;
  }

  return { state, city };
};

// ─── Clean description text ─────────────────────────────────────
const cleanText = (text = '') => {
  return text
    .replace(/<[^>]+>/g, ' ') // strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
};

// ─── Auto Blacklist Helper ────────────────────────────────────────
const autoBlacklist = async (phones, emails, urls, newsScamId) => {
  const ops = [];

  for (const phone of phones) {
    ops.push(
      Blacklist.findOneAndUpdate(
        { value: phone, type: 'phone' },
        {
          $inc: { reportCount: 1 },
          $addToSet: { linkedScams: newsScamId },
          $setOnInsert: { riskLevel: 'HIGH', notes: 'Auto-extracted from news article', addedAt: new Date() },
        },
        { upsert: true, new: true }
      ).catch(() => {})
    );
  }

  for (const email of emails) {
    ops.push(
      Blacklist.findOneAndUpdate(
        { value: email.toLowerCase(), type: 'email' },
        {
          $inc: { reportCount: 1 },
          $addToSet: { linkedScams: newsScamId },
          $setOnInsert: { riskLevel: 'HIGH', notes: 'Auto-extracted from news article', addedAt: new Date() },
        },
        { upsert: true, new: true }
      ).catch(() => {})
    );
  }

  for (const url of urls.slice(0, 3)) { // max 3 URLs per article
    ops.push(
      Blacklist.findOneAndUpdate(
        { value: url.toLowerCase(), type: 'URL' },
        {
          $inc: { reportCount: 1 },
          $addToSet: { linkedScams: newsScamId },
          $setOnInsert: { riskLevel: 'MEDIUM', notes: 'Auto-extracted from news article', addedAt: new Date() },
        },
        { upsert: true, new: true }
      ).catch(() => {})
    );
  }

  await Promise.allSettled(ops);
};

// ─── Process a single RSS item ────────────────────────────────────
const processItem = async (item, feedLabel) => {
  if (!item.link || !item.title) return null;

  // Skip duplicates quickly
  const exists = await NewsScam.exists({ url: item.link });
  if (exists) return 'duplicate';

  const fullText = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''} ${item['content:encoded'] || ''}`;
  const cleanDesc = cleanText(item.contentSnippet || item.content || '');

  const phones = extractPhones(fullText);
  const emails = extractEmails(fullText);
  const urls = extractURLs(fullText).filter((u) => u !== item.link && !u.includes('news.google'));
  const amount = extractAmount(fullText);
  const scamType = classifyScamType(fullText);
  const { state, city } = extractLocation(fullText);

  const hasExtracted = phones.length > 0 || emails.length > 0;

  try {
    const newsScam = await NewsScam.create({
      title: item.title.trim(),
      description: cleanDesc,
      source: item.source?._ || item.source || feedLabel || 'Google News',
      url: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      extractedPhones: phones,
      extractedEmails: emails,
      extractedURLs: urls,
      extractedAmount: amount,
      scamType,
      state: state || '',
      city: city || '',
      autoAddedToBlacklist: hasExtracted,
    });

    // Auto blacklist extracted entities
    if (hasExtracted || urls.length > 0) {
      await autoBlacklist(phones, emails, urls, newsScam._id);
    }

    return 'added';
  } catch (err) {
    if (err.code === 11000) return 'duplicate'; // duplicate URL
    console.error(`[Scraper] Error saving item: ${err.message}`);
    return 'error';
  }
};

// ─── Main Scraper Function ────────────────────────────────────────
const scrapeAllFeeds = async () => {
  const startTime = Date.now();
  console.log(`\n🔄 [${new Date().toISOString()}] Starting news scrape across ${RSS_FEEDS.length} feeds...`);

  let added = 0;
  let duplicates = 0;
  let errors = 0;

  for (const { url, label } of RSS_FEEDS) {
    try {
      console.log(`  📡 Fetching: ${label}`);
      const feed = await parser.parseURL(url);
      const items = feed.items || [];

      for (const item of items) {
        const result = await processItem(item, label);
        if (result === 'added') added++;
        else if (result === 'duplicate') duplicates++;
        else if (result === 'error') errors++;
      }
    } catch (err) {
      console.error(`  ❌ Feed error [${label}]: ${err.message}`);
      errors++;
    }

    // Small delay between feeds to be respectful
    await new Promise((r) => setTimeout(r, 500));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Scrape complete in ${elapsed}s — Added: ${added} | Duplicates: ${duplicates} | Errors: ${errors}\n`);

  return { added, duplicates, errors };
};

module.exports = { scrapeAllFeeds };
