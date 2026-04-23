const mongoose = require('mongoose');

const traiSeriesSchema = new mongoose.Schema({

  // Core TRAI data
  series: { type: String, required: true },
  // "98765" — first 5 digits of number

  seriesStart: { type: String },
  // "9876500000" — full range start

  seriesEnd: { type: String },
  // "9876599999" — full range end

  operator: {
    type: String,
    enum: [
      'Reliance Jio',
      'Airtel',
      'Vodafone Idea (Vi)',
      'BSNL',
      'MTNL',
      'Tata Teleservices',
      'Reliance Communications',
      'Uninor',
      'Unknown',
      'TRAI Regulated'
    ],
    default: 'Unknown'
  },

  circle: {
    type: String,
    // "Maharashtra", "Delhi", "Karnataka" etc
  },

  circleCode: {
    type: String,
    // "MH", "DL", "KA" etc
  },

  technology: {
    type: String,
    enum: ['GSM', 'CDMA', 'LTE', '5G', 'Mixed'],
    default: 'GSM'
  },

  serviceType: {
    type: String,
    enum: ['mobile', 'landline', 'toll-free', 'premium', 'virtual'],
    default: 'mobile'
  },

  // Is this series known to be used for commercial/spam calls?
  isCommercialSeries: { type: Boolean, default: false },

  // TRAI DND status for this series
  dndApplicable: { type: Boolean, default: true },

  // Metadata
  allocatedDate: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: 'TRAI Official' },
  active: { type: Boolean, default: true }
});

// Indexes for instant lookup
traiSeriesSchema.index({ series: 1 }, { unique: true });
traiSeriesSchema.index({ operator: 1 });
traiSeriesSchema.index({ circle: 1 });
traiSeriesSchema.index({ seriesStart: 1, seriesEnd: 1 });

module.exports = mongoose.model('TraiSeries', traiSeriesSchema);
