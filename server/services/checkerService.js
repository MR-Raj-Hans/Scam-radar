const axios = require('axios');
const CheckCache = require('../models/CheckCache');
const Blacklist = require('../models/Blacklist');
const NewsScam = require('../models/NewsScam');
const { lookupPhone, isCommercialNumber } = require('./traiService');

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────
// PHONE CHECKER
// ─────────────────────────────────────────────
const checkPhone = async (phone) => {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^(\+91|91|0)/, '');
  const riskReasons = [];
  let riskScore = 0;

  // ── 1. TRAI Government Lookup (FREE, always works) ──────────
  const traiInfo = await lookupPhone(cleanPhone);
  const commercialInfo = await isCommercialNumber(cleanPhone);

  if (traiInfo.found) {
    if (traiInfo.isCommercialSeries) {
      riskScore += 25;
      riskReasons.push('Number belongs to a commercial/telemarketing series');
    }
    if (commercialInfo.isCommercial) {
      riskScore += 20;
      riskReasons.push(`${commercialInfo.type} — verify caller identity`);
    }
    if (traiInfo.circleRiskLevel === 'elevated') {
      riskScore += 10;
      riskReasons.push(`Circle (${traiInfo.circle}) has elevated cybercrime reports`);
    }
  }

  // ── 2. NumVerify API (carrier details) ───────────────────────
  let numVerifyData = {};
  try {
    if (process.env.NUMVERIFY_KEY) {
      const { data } = await axios.get(
        `http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_KEY}&number=91${cleanPhone}&country_code=IN`
      );
      numVerifyData = data;
      if (data.line_type === 'voip') {
        riskScore += 20;
        riskReasons.push('VoIP number — frequently used by scammers');
      }
    }
  } catch (e) {
    console.error('NumVerify error:', e.message);
  }

  // ── 3. Internal Blacklist ────────────────────────────────────
  const blacklistEntry = await Blacklist.findOne({ value: cleanPhone, type: 'phone' });
  if (blacklistEntry) {
    riskScore += 50;
    riskReasons.push(`Reported ${blacklistEntry.reportCount} times in ScamRadar community database`);
  }

  // ── 4. News Articles ─────────────────────────────────────────
  const newsMatches = await NewsScam.find(
    { extractedPhones: { $in: [cleanPhone, `+91${cleanPhone}`, `0${cleanPhone}`] } },
    { title: 1, source: 1, publishedAt: 1, url: 1 }
  ).limit(5);

  if (newsMatches.length > 0) {
    riskScore += 30;
    riskReasons.push(`Appeared in ${newsMatches.length} real scam news article(s)`);
  }

  const riskLevel = riskScore >= 60 ? 'HIGH'
    : riskScore >= 30 ? 'MEDIUM'
    : riskScore > 0 ? 'LOW'
    : 'SAFE';

  return {
    phoneData: {
      // TRAI Data (Government Official)
      traiOperator: traiInfo.operator || numVerifyData.carrier,
      traiCircle: traiInfo.circle || numVerifyData.location,
      traiCircleCode: traiInfo.circleCode,
      traiTechnology: traiInfo.technology,
      traiServiceType: traiInfo.serviceType,
      isCommercialSeries: traiInfo.isCommercialSeries,
      governmentVerified: traiInfo.found,
      dndApplicable: traiInfo.dndApplicable,

      // NumVerify Data
      carrier: numVerifyData.carrier,
      lineType: numVerifyData.line_type,
      valid: numVerifyData.valid,

      source: traiInfo.found ? 'TRAI Official + NumVerify' : 'NumVerify API'
    },
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    riskReasons,
    inBlacklist: !!blacklistEntry,
    blacklistReportCount: blacklistEntry?.reportCount || 0,
    linkedNewsArticles: newsMatches,
  };
};

// ─────────────────────────────────────────────
// EMAIL CHECKER
// ─────────────────────────────────────────────
const checkEmail = async (email) => {
  const riskReasons = [];
  let riskScore = 0;
  let breachData = { breached: false, breachCount: 0, breachNames: [] };
  let disposable = false;

  // Step 1 — Have I Been Pwned
  if (process.env.HIBP_KEY) {
    try {
      const { data: breaches } = await axios.get(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
        { headers: { 'hibp-api-key': process.env.HIBP_KEY, 'User-Agent': 'ScamRadar-App' } }
      );
      breachData = {
        breached: true,
        breachCount: breaches.length,
        breachNames: breaches.map(b => b.Name).slice(0, 5),
      };
      riskScore += Math.min(breaches.length * 10, 40);
      riskReasons.push(`Found in ${breaches.length} data breach databases (${breachData.breachNames.join(', ')})`);
    } catch (e) {
      if (e.response?.status !== 404) console.error('HIBP error:', e.message);
    }
  }

  // Step 2 — Disposable email check (free, no key needed)
  try {
    const { data: disData } = await axios.get(
      `https://www.disify.com/api/email/${encodeURIComponent(email)}`
    );
    disposable = disData.disposable;
    if (disposable) {
      riskScore += 30;
      riskReasons.push('Disposable/temporary email address — high scammer usage');
    }
  } catch (e) {
    console.error('Disify error:', e.message);
  }

  // Step 3 — internal blacklist
  const blacklistEntry = await Blacklist.findOne({ value: email, type: 'email' });
  if (blacklistEntry) {
    riskScore += 40;
    riskReasons.push(`Reported ${blacklistEntry.reportCount} times in ScamRadar database`);
  }

  // Step 4 — news articles
  const newsMatches = await NewsScam.find(
    { extractedEmails: email },
    { title: 1, source: 1, publishedAt: 1 }
  ).limit(5);
  if (newsMatches.length > 0) {
    riskScore += 25;
    riskReasons.push(`Mentioned in ${newsMatches.length} scam news articles`);
  }

  const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : riskScore > 0 ? 'LOW' : 'SAFE';

  return {
    emailData: {
      breached: breachData.breached,
      breachCount: breachData.breachCount,
      breachNames: breachData.breachNames,
      disposable,
      deliverable: true,
    },
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    riskReasons,
    inBlacklist: !!blacklistEntry,
    blacklistReportCount: blacklistEntry?.reportCount || 0,
    linkedNewsArticles: newsMatches,
  };
};

// ─────────────────────────────────────────────
// URL CHECKER
// ─────────────────────────────────────────────
const checkURL = async (url) => {
  const riskReasons = [];
  let riskScore = 0;
  let urlData = { googleSafeBrowsing: false, phishTank: false, ssl: false };

  // Step 1 — Google Safe Browsing
  if (process.env.GOOGLE_SAFE_BROWSING_KEY) {
    try {
      const { data: gsbData } = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_KEY}`,
        {
          client: { clientId: 'scamradar', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }
      );
      if (gsbData.matches?.length > 0) {
        urlData.googleSafeBrowsing = true;
        urlData.threatType = gsbData.matches[0].threatType;
        riskScore += 70;
        riskReasons.push(`Flagged by Google Safe Browsing as ${gsbData.matches[0].threatType}`);
      }
    } catch (e) {
        console.error('Google Safe Browsing Error:', e.message);
    }
  }

  // Step 2 — PhishTank
  if (process.env.PHISHTANK_KEY) {
    try {
      const params = new URLSearchParams();
      params.append('url', url);
      params.append('format', 'json');
      params.append('app_key', process.env.PHISHTANK_KEY);
      const { data: ptData } = await axios.post(
        'https://checkurl.phishtank.com/checkurl/', params
      );
      if (ptData.results?.in_database && ptData.results?.verified) {
        urlData.phishTank = true;
        riskScore += 60;
        riskReasons.push('Confirmed phishing URL in PhishTank database');
      }
    } catch (e) {
        console.error('Phishtank check error:', e.message);
    }
  }

  // Step 3 — internal blacklist
  const blacklistEntry = await Blacklist.findOne({ value: url, type: 'URL' });
  if (blacklistEntry) {
    riskScore += 40;
    riskReasons.push(`Reported ${blacklistEntry.reportCount} times by ScamRadar users`);
  }

  // Step 4 — news articles
  const newsMatches = await NewsScam.find(
    { extractedURLs: url },
    { title: 1, source: 1, publishedAt: 1 }
  ).limit(5);
  if (newsMatches.length > 0) {
    riskScore += 20;
    riskReasons.push(`Found in ${newsMatches.length} scam news articles`);
  }

  // Step 5 — basic suspicious pattern check
  const suspicious = [
    /free.*prize/i, /winner/i, /click.*here.*urgent/i,
    /verify.*account/i, /[0-9]{5,}.*\.com/
  ];
  if (suspicious.some(r => r.test(url))) {
    riskScore += 15;
    riskReasons.push('URL contains suspicious keywords or patterns');
  }

  const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : riskScore > 0 ? 'LOW' : 'SAFE';

  return {
    urlData,
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    riskReasons,
    inBlacklist: !!blacklistEntry,
    blacklistReportCount: blacklistEntry?.reportCount || 0,
    linkedNewsArticles: newsMatches,
  };
};

module.exports = { checkPhone, checkEmail, checkURL };
