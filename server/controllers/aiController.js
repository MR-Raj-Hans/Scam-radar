const Anthropic = require('@anthropic-ai/sdk');
const { getOrFetch } = require('../services/cacheService');
const Scam = require('../models/Scam');
const NewsScam = require('../models/NewsScam');

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SCAM_TYPES = ['phishing', 'UPI fraud', 'fake job', 'lottery', 'romance', 'investment'];

// @desc  Classify a scam description using Claude AI
// @route POST /api/ai/classify
// @access Public (rate limited by express-rate-limit)
const classifyScam = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Description must be at least 10 characters' });
    }

    if (!client) {
      // Fallback: keyword-based classification when no API key
      const result = keywordClassify(description);
      return res.json({ success: true, ...result, source: 'keyword' });
    }

    const prompt = `You are a scam detection expert. Analyze this scam description and classify it.

Description: "${description.trim()}"

Available scam types: ${SCAM_TYPES.join(', ')}

Respond with ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "type": "<one of the scam types above>",
  "confidence": <number 0-100>,
  "warning": "<a short 1-2 sentence warning message for the victim>",
  "keywords": ["<key red flag words found>"],
  "severity": "<LOW|MEDIUM|HIGH>"
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].text.trim();
    
    // Extract JSON even if wrapped in markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Claude returned invalid JSON');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate the type
    if (!SCAM_TYPES.includes(result.type)) {
      result.type = keywordClassify(description).type;
    }

    res.json({ success: true, ...result, source: 'claude' });
  } catch (error) {
    if (error.status === 401 || error.message?.includes('authentication')) {
      // Fallback to keyword classification
      const result = keywordClassify(req.body.description || '');
      return res.json({ success: true, ...result, source: 'keyword' });
    }
    next(error);
  }
};

// Keyword-based fallback classifier
const keywordClassify = (description) => {
  const text = description.toLowerCase();

  const patterns = {
    phishing: ['click here', 'verify your account', 'login link', 'password reset', 'suspicious activity', 'bank account suspended', 'otp', 'authenticate'],
    'UPI fraud': ['upi', 'gpay', 'phonepe', 'paytm', 'bhim', 'transfer money', 'send money', 'qr code', 'scan and pay', 'payment request'],
    'fake job': ['work from home', 'part time job', 'earn daily', 'data entry', 'salary', 'hiring', 'recruitment', 'apply now', 'job offer', 'no experience'],
    lottery: ['you have won', 'prize', 'lucky winner', 'claim your reward', 'lottery', 'gift card', 'jackpot', 'congratulations'],
    romance: ['fell in love', 'military', 'widower', 'online relationship', 'send money', 'stranded', 'emergency', 'dating', 'marriage proposal'],
    investment: ['guaranteed returns', 'double your money', 'invest', 'crypto', 'trading', 'roi', 'profit', 'scheme', 'forex', 'stock tips'],
  };

  let bestType = 'phishing';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(patterns)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  const confidence = Math.min(40 + bestScore * 15, 85);

  return {
    type: bestType,
    confidence,
    warning: `This appears to be a ${bestType} scam. Do not share personal information or transfer money. Report to cybercrime.gov.in`,
    keywords: [],
    severity: confidence > 70 ? 'HIGH' : confidence > 50 ? 'MEDIUM' : 'LOW',
  };
};

// @desc Chat with AI Assistant
// @route POST /api/ai/chat
// @access Public
const chatAssistant = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // 1. Extract potential targets (Phone / Email / URL)
    const phoneMatch = query.match(/[6-9]\d{9}/);
    const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const urlMatch = query.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/);

    let dbContext = '';

    // 2. Perform DB lookup if matched
    if (phoneMatch || emailMatch || urlMatch) {
      const extractedEntity = phoneMatch ? phoneMatch[0] : (emailMatch ? emailMatch[0] : urlMatch[0]);
      try {
        const result = await getOrFetch(extractedEntity);
        dbContext += `\nSystem: We performed a direct database and real-time external API lookup on the entity "${extractedEntity}".
          Entity Type: ${result.type}
          Risk Level: ${result.riskLevel}
          Risk Reasons: ${result.riskReasons?.join(', ') || 'None found.'}
          News articles linked: ${result.linkedNewsArticles?.length || 0}
          Community reports matching: ${result.blacklistReportCount}
        `;
      } catch (e) {
        // gracefully ignore invalid parse
      }
    } else {
      // General DB Search on Scam collections
      const cleanSearch = query.replace(/[^\w\s]/g, '').trim();
      if (cleanSearch.length > 3) {
        const searchRegex = new RegExp(cleanSearch.split(' ').join('|'), 'i');
        const [scams, news] = await Promise.all([
          Scam.find({ $or: [{title: searchRegex}, {description: searchRegex}] }).limit(2).lean(),
          NewsScam.find({ $or: [{title: searchRegex}, {description: searchRegex}] }).limit(2).lean()
        ]);
        
        if (scams.length > 0 || news.length > 0) {
          dbContext += `\nSystem: We found related fraud cases in our platform.
            Community Scams found: ${scams.map(s => s.title).join(' | ')}.
            News Scams found: ${news.map(n => n.title).join(' | ')}.
          `;
        }
      }
    }

    const prompt = `You are the friendly, helpful "ScamRadar AI Safety Assistant".
A user has asked you: "${query}"

Here is background data retrieved directly from the ScamRadar MongoDB platform regarding their query:
${dbContext || "No exact analytical matches in the database for this specific query."}

RESPOND WITH:
1. A direct, conversational answer evaluating their query based carefully on the database context. 
2. Tell them the "safe thing to do in this case". 
3. MUST ALWAYS include a reminder to call the National Cybercrime Helpline at 1930 if they lost money.
Format your response using bold (**text**) for readability. Keep it to 3-4 short paragraphs maximum.`;

    const fallbackResponse = `Hi, I am the ScamRadar AI Assistant. Depending on our database checks:\n\n${dbContext ? dbContext.replace(/System:/g, '🔍 **Found:**') : 'I could not find exact matches for your specific query in the current logs.'}\n\n**Safe Actions:** If you suspect this is fraudulent, NEVER click suspicious links, download stranger's APKs, or share OTPs / PINs.\n\n🚨 **Important Help:** If you have already lost money or suspect an ongoing fraud, please IMMEDIATELY dial the National Cybercrime Helpline at **1930** or file a report at cybercrime.gov.in.`;

    if (client) {
      try {
        const message = await client.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        });
        return res.json({ success: true, text: message.content[0].text.trim() });
      } catch (err) {
        console.error("AI API Error:", err.message);
        // Fallback engine if Anthropic fails
        return res.json({ success: true, text: fallbackResponse });
      }
    } else {
      // Fallback Engine if API key is missing
      return res.json({ success: true, text: fallbackResponse });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { classifyScam, chatAssistant };
