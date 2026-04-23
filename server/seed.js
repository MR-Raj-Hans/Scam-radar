const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Scam = require('./models/Scam');
const Blacklist = require('./models/Blacklist');
const Report = require('./models/Report');
const Comment = require('./models/Comment');

const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kolkata'];

const SAMPLE_SCAMS = [
  {
    title: 'SBI Bank Account Suspension Phishing Link',
    description: 'Received SMS saying my SBI account will be suspended within 24 hours. The link leads to a fake SBI login page that steals credentials. The URL was sbi-secure-login.xyz which is NOT the official SBI website.',
    type: 'phishing',
    tags: ['sbi', 'bank', 'phishing', 'fake-login'],
    state: 'Maharashtra', city: 'Mumbai', lng: 72.8777, lat: 19.0760,
  },
  {
    title: 'Fake Google Pay UPI Money Request Scam',
    description: 'A stranger sent a UPI collect request saying they sent money by mistake and need it back. Never send money to unknown UPI IDs. They use 9XXXXXXXX@okicici as UPI ID. Classic reversal scam.',
    type: 'UPI fraud',
    tags: ['gpay', 'upi', 'collect-request', 'reversal'],
    state: 'Delhi', city: 'Delhi', lng: 77.2090, lat: 28.6139,
  },
  {
    title: 'Work From Home Data Entry Job Fraud — ₹50,000 Registration Fee',
    description: 'Company called TechDataSolutions India offered data entry job with ₹30,000 monthly salary. Asked for ₹50,000 registration and training fee upfront. After payment, they blocked WhatsApp and phone.',
    type: 'fake job',
    tags: ['work-from-home', 'data-entry', 'registration-fee', 'remote'],
    state: 'Karnataka', city: 'Bangalore', lng: 77.5946, lat: 12.9716,
  },
  {
    title: 'KBC Lottery Winner Scam — Amitabh Bachchan WhatsApp',
    description: 'Got WhatsApp message claiming to be from KBC team saying I won ₹25 lakhs. They asked for PAN card, Aadhaar and processing fee of ₹5,000. KBC NEVER asks for money. This is 100% fraud.',
    type: 'lottery',
    tags: ['kbc', 'lottery', 'whatsapp', 'amitabh'],
    state: 'Tamil Nadu', city: 'Chennai', lng: 80.2707, lat: 13.0827,
  },
  {
    title: 'Romance Scam — Army Officer Asking for Emergency Money',
    description: 'Met someone on matrimonial site claiming to be Indian Army Colonel posted abroad. After 2 months of chatting, asked for ₹80,000 for medical emergency. Profile used photos of real army officers.',
    type: 'romance',
    tags: ['army', 'matrimonial', 'emergency', 'catfish'],
    state: 'Gujarat', city: 'Ahmedabad', lng: 72.5714, lat: 23.0225,
  },
  {
    title: 'Crypto Investment Bot Promising 300% Returns',
    description: 'Telegram group promises 300% returns using AI trading bot. Initial small investments returned profits, but when depositing large amounts (₹2 lakhs), withdrawal was blocked. Classic pig butchering scam.',
    type: 'investment',
    tags: ['crypto', 'telegram', 'bot', 'pig-butchering'],
    state: 'Rajasthan', city: 'Jaipur', lng: 75.7873, lat: 26.9124,
  },
  {
    title: 'HDFC Net Banking OTP Scam via Fake Customer Care',
    description: 'Called a number found via Google search claiming to be HDFC customer care. They said my account had suspicious activity and asked for OTP to "verify". Lost ₹1.2 lakhs within minutes.',
    type: 'phishing',
    tags: ['hdfc', 'otp', 'customer-care', 'google-search'],
    state: 'Uttar Pradesh', city: 'Lucknow', lng: 80.9462, lat: 26.8467,
  },
  {
    title: 'Fake Flipkart Job Offer — Pay to Get Hired',
    description: 'Received call from someone claiming to be Flipkart HR offering warehouse packing job at ₹25,000/month. Asked ₹3,000 for ID verification and uniform. After paying, phone was switched off.',
    type: 'fake job',
    tags: ['flipkart', 'warehouse', 'job', 'hr-scam'],
    state: 'West Bengal', city: 'Kolkata', lng: 88.3639, lat: 22.5726,
  },
  {
    title: 'Instagram Investment Scam — Fake Trading App',
    description: 'Instagram ad showed influencer promoting a trading app with guaranteed daily profits. App looked legitimate and even showed profits in account, but money was unwithdrawable. Lost ₹75,000.',
    type: 'investment',
    tags: ['instagram', 'trading', 'influencer', 'fake-app'],
    state: 'Maharashtra', city: 'Pune', lng: 73.8567, lat: 18.5204,
  },
  {
    title: 'Electricity Bill Disconnection UPI Scam',
    description: 'SMS saying electricity will be disconnected in 30 minutes. Call to a number that asked to pay via UPI immediately. The number was 6XXXXXXXX@paytm. Maharashtra State Electricity Board confirmed it is fraud.',
    type: 'UPI fraud',
    tags: ['electricity', 'bill', 'disconnection', 'urgency'],
    state: 'Maharashtra', city: 'Nagpur', lng: 79.0882, lat: 21.1458,
  },
  {
    title: 'Aadhaar Linking Police Threat Scam',
    description: 'Received call from someone claiming to be CBI officer saying my Aadhaar is linked to money laundering case. Demanded ₹50,000 to close the case. DO NOT pay — this is cyber blackmail.',
    type: 'phishing',
    tags: ['aadhaar', 'cbi', 'police', 'blackmail', 'aadhaar-scam'],
    state: 'Delhi', city: 'New Delhi', lng: 77.1025, lat: 28.7041,
  },
  {
    title: 'Free iPhone 15 Pro Lottery via TRAI',
    description: 'Got email from telecom-reward@trai-india.net claiming free iPhone 15 Pro for being loyal subscriber. Asked for shipping fee of ₹899. TRAI never runs such programs. Pure fraud.',
    type: 'lottery',
    tags: ['iphone', 'trai', 'free-gift', 'shipping-fee'],
    state: 'Karnataka', city: 'Mysore', lng: 76.6394, lat: 12.2958,
  },
  {
    title: 'QR Code Scan Drains UPI Account Instantly',
    description: 'Seller on OLX asked to scan QR code to receive payment for selling old laptop. Scanning the QR requested ₹15,000 instead of sending it. QR codes are for PAYING, not RECEIVING.',
    type: 'UPI fraud',
    tags: ['qr-code', 'olx', 'collect', 'buyer-scam'],
    state: 'Tamil Nadu', city: 'Coimbatore', lng: 76.9558, lat: 11.0168,
  },
  {
    title: 'Fake Shaadi.com Profile — Overseas NRI Groom Asking Money',
    description: 'Shaadi.com profile claimed to be NRI doctor in USA. After months of contact asked for visa fee money to visit India. Reverse image search showed photos stolen from LinkedIn profiles.',
    type: 'romance',
    tags: ['marriage', 'nri', 'shaadi', 'catfish', 'advance-fee'],
    state: 'Gujarat', city: 'Surat', lng: 72.8311, lat: 21.1702,
  },
  {
    title: 'Zerodha Fake Support Number Phishing',
    description: 'Google showed fake Zerodha customer care number. Called it and they asked for trading login details to "reset account". All credentials were used to drain trading account. Always use official website.',
    type: 'phishing',
    tags: ['zerodha', 'trading', 'google-listing', 'support-fraud'],
    state: 'Karnataka', city: 'Bangalore', lng: 77.5946, lat: 12.9716,
  },
  {
    title: 'PM Kisan Yojana Extra Benefit Scam',
    description: 'Received WhatsApp message offering ₹6,000 extra PM Kisan benefit. Link led to fake government portal asking for bank account and ATM PIN. Government never asks for PIN.',
    type: 'phishing',
    tags: ['pm-kisan', 'government', 'farm', 'fake-portal'],
    state: 'Uttar Pradesh', city: 'Varanasi', lng: 82.9739, lat: 25.3176,
  },
  {
    title: 'Task-Based Earning App Scam — Earn ₹500 Per Task',
    description: 'YouTube ad showed app paying ₹500 per video like. Earned ₹3,000 in first day. When trying to withdraw, asked to upgrade account for ₹5,000. After payment, earnings disappeared.',
    type: 'investment',
    tags: ['task-app', 'youtube-scam', 'earn-online', 'like-farming'],
    state: 'Rajasthan', city: 'Udaipur', lng: 73.7125, lat: 24.5854,
  },
  {
    title: 'Courier Parcel Seized Customs Scam',
    description: 'Call from +91-XXXXXXXXXX claiming FedEx parcel from abroad has drugs. Transfer money to "clear" the parcel or face arrest. Classic FedEx/customs scam with police impersonation.',
    type: 'phishing',
    tags: ['fedex', 'customs', 'parcel', 'police-threat'],
    state: 'Maharashtra', city: 'Mumbai', lng: 72.8777, lat: 19.0760,
  },
  {
    title: 'Fake Gold/Silver Investment Scheme via WhatsApp Group',
    description: 'Was added to WhatsApp group by unknown contact promoting gold trading with guaranteed 5% weekly profit. They showed fake account statements. Invested ₹40,000, never got returns.',
    type: 'investment',
    tags: ['gold', 'silver', 'whatsapp-group', 'ponzi', 'commodity'],
    state: 'Delhi', city: 'Delhi', lng: 77.2090, lat: 28.6139,
  },
  {
    title: 'Loan App Harassment — Fake RBI Approval',
    description: 'Downloaded loan app from Play Store claiming RBI approval. Got ₹5,000 loan. When repaid, they demanded ₹20,000 and started sending morphed obscene photos to contacts. Extortion fraud.',
    type: 'phishing',
    tags: ['loan-app', 'rbi', 'extortion', 'contact-harassment'],
    state: 'Telangana', city: 'Hyderabad', lng: 78.4867, lat: 17.3850,
  },
];

const BLACKLIST_ENTRIES = [
  { type: 'phone', value: '9876543210', riskLevel: 'HIGH', reportCount: 47, notes: 'Repeatedly reported for UPI fraud' },
  { type: 'phone', value: '8765432109', riskLevel: 'HIGH', reportCount: 32, notes: 'KBC lottery scam caller' },
  { type: 'email', value: 'lottery@kbc-winner.net', riskLevel: 'HIGH', reportCount: 89, notes: 'Mass lottery phishing campaign' },
  { type: 'email', value: 'telecom-reward@trai-india.net', riskLevel: 'HIGH', reportCount: 23, notes: 'Fake TRAI email' },
  { type: 'UPI', value: '9fraudupi@okaxis', riskLevel: 'HIGH', reportCount: 15, notes: 'UPI reversal scam' },
  { type: 'UPI', value: 'scammer123@paytm', riskLevel: 'MEDIUM', reportCount: 8, notes: 'Electricity bill fraud' },
  { type: 'URL', value: 'sbi-secure-login.xyz', riskLevel: 'HIGH', reportCount: 156, notes: 'Fake SBI login phishing site' },
  { type: 'URL', value: 'hdfc-verify-account.in', riskLevel: 'HIGH', reportCount: 78, notes: 'Fake HDFC portal' },
  { type: 'phone', value: '7654321098', riskLevel: 'MEDIUM', reportCount: 5, notes: 'Job agent fraud' },
  { type: 'bank_account', value: '12345678901234', riskLevel: 'HIGH', reportCount: 3, notes: 'Mule account used in fraud' },
];

async function seedDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB for seeding...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Scam.deleteMany({}),
    Blacklist.deleteMany({}),
    Report.deleteMany({}),
    Comment.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create users
  const usersData = [
    { name: 'Admin User', email: 'admin@scamradar.in', password: 'Admin@123', role: 'admin', city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Priya Sharma', email: 'moderator@scamradar.in', password: 'Mod@123', role: 'moderator', city: 'Delhi', state: 'Delhi' },
    { name: 'Rahul Verma', email: 'rahul@gmail.com', password: 'User@123', role: 'user', city: 'Bangalore', state: 'Karnataka' },
    { name: 'Anita Patel', email: 'anita@gmail.com', password: 'User@123', role: 'user', city: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Suresh Kumar', email: 'suresh@gmail.com', password: 'User@123', role: 'user', city: 'Chennai', state: 'Tamil Nadu' },
  ];

  const users = [];
  for (const u of usersData) {
    const user = new User({
      name: u.name,
      email: u.email,
      passwordHash: u.password,
      role: u.role,
      location: { city: u.city, state: u.state, country: 'India' },
    });
    await user.save(); // triggers pre-save bcrypt hook
    users.push(user);
  }
  console.log(`👥 Created ${users.length} users`);

  // Create scams (randomly assign to non-admin users)
  const regularUsers = users.filter((u) => u.role === 'user');
  const scams = [];

  for (let i = 0; i < SAMPLE_SCAMS.length; i++) {
    const s = SAMPLE_SCAMS[i];
    const user = regularUsers[i % regularUsers.length];
    const status = i < 15 ? 'verified' : i < 18 ? 'pending' : 'rejected';
    const daysAgo = Math.floor(Math.random() * 30);

    const scam = await Scam.create({
      title: s.title,
      description: s.description,
      type: s.type,
      reportedBy: user._id,
      status,
      tags: s.tags,
      upvotes: Math.floor(Math.random() * 80),
      reportCount: Math.floor(Math.random() * 20) + 1,
      location: {
        city: s.city,
        state: s.state,
        coordinates: { type: 'Point', coordinates: [s.lng, s.lat] },
      },
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
    scams.push(scam);
  }
  console.log(`🚨 Created ${scams.length} scams`);

  // Create blacklist entries
  for (const entry of BLACKLIST_ENTRIES) {
    const randomScam = scams[Math.floor(Math.random() * scams.length)];
    await Blacklist.create({
      ...entry,
      value: entry.value,
      linkedScams: [randomScam._id],
      addedBy: users[0]._id, // admin
    });
  }
  console.log(`🚫 Created ${BLACKLIST_ENTRIES.length} blacklist entries`);

  // Create some reports
  const verifiedScams = scams.filter((s) => s.status === 'verified').slice(0, 8);
  const reportProms = [];
  for (const scam of verifiedScams) {
    for (const user of regularUsers.slice(0, 2)) {
      if (scam.reportedBy.toString() !== user._id.toString()) {
        reportProms.push(
          Report.create({ scamId: scam._id, reportedBy: user._id, additionalDetails: 'I also received this scam. Confirming it is fraud.' })
            .catch(() => {}) // ignore duplicates
        );
      }
    }
  }
  await Promise.all(reportProms);
  console.log('📝 Created reports');

  // Create some comments
  const commentTexts = [
    'I received the same message! Reported to cyber police.',
    'My colleague also fell for this. Be very careful.',
    'Blocked immediately after the first message. Thanks for the warning!',
    'Filed a complaint at cybercrime.gov.in — please do the same.',
    'The phone number is the same one that called my uncle.',
  ];

  for (const scam of verifiedScams.slice(0, 5)) {
    await Comment.create({
      scamId: scam._id,
      userId: regularUsers[0]._id,
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
    });
  }
  console.log('💬 Created comments');

  // Update user report counts
  await User.findByIdAndUpdate(regularUsers[0]._id, { reportsSubmitted: 7 });
  await User.findByIdAndUpdate(regularUsers[1]._id, { reportsSubmitted: 5 });
  await User.findByIdAndUpdate(regularUsers[2]._id, { reportsSubmitted: 8 });

  console.log('\n✅ Seeding complete!');
  console.log('\n🔑 Demo Credentials:');
  console.log('   Admin:     admin@scamradar.in / Admin@123');
  console.log('   Moderator: moderator@scamradar.in / Mod@123');
  console.log('   User:      rahul@gmail.com / User@123');

  await mongoose.connection.close();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
