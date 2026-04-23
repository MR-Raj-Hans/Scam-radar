const mongoose = require('mongoose');
const path = require('path');
const TraiSeries = require('../models/TraiSeries');
const TRAI_SERIES = require('../data/traiSeedData');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedTRAI = async () => {
  await mongoose.connect(process.env.MONGODB_URI); // ScamRadar uses MONGODB_URI variable usually
  console.log('Connected to MongoDB');

  // Clear existing
  await TraiSeries.deleteMany({});
  console.log('Cleared existing TRAI data');

  // Insert all
  const result = await TraiSeries.insertMany(TRAI_SERIES, { ordered: false });
  console.log(`✅ Inserted ${result.length} TRAI series entries`);

  // Create indexes
  await TraiSeries.createIndexes();
  console.log('✅ Indexes created');

  mongoose.disconnect();
};

seedTRAI().catch(console.error);
