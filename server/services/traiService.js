const TraiSeries = require('../models/TraiSeries');

const CIRCLE_RISK = {
  // Some circles have higher scam activity based on cybercrime data
  'Uttar Pradesh (East)': 'elevated',
  'Uttar Pradesh (West)': 'elevated',
  'Rajasthan': 'elevated',
  'Bihar': 'elevated',
  'Jharkhand': 'elevated',
  'Delhi': 'normal',
  'Maharashtra': 'normal',
  'Karnataka': 'normal',
};

const lookupPhone = async (phone) => {
  const clean = phone.replace(/\D/g, '').replace(/^(\+91|91|0)/, '');

  // Try 5-digit series first, then 4-digit, then 3-digit
  const fiveDigit = clean.substring(0, 5);
  const fourDigit = clean.substring(0, 4);
  const threeDigit = clean.substring(0, 3);

  let traiData = await TraiSeries.findOne({ series: fiveDigit })
    || await TraiSeries.findOne({ series: fourDigit })
    || await TraiSeries.findOne({ series: threeDigit });

  if (!traiData) {
    return {
      found: false,
      message: 'Series not found in TRAI database',
      rawSeries: fiveDigit
    };
  }

  return {
    found: true,
    series: traiData.series,
    operator: traiData.operator,
    circle: traiData.circle,
    circleCode: traiData.circleCode,
    technology: traiData.technology,
    serviceType: traiData.serviceType,
    isCommercialSeries: traiData.isCommercialSeries,
    dndApplicable: traiData.dndApplicable,
    circleRiskLevel: CIRCLE_RISK[traiData.circle] || 'normal',
    governmentVerified: true,
    source: 'TRAI Official Numbering Plan'
  };
};

// For checking if a number starts with commercial series (140, 160 etc)
const isCommercialNumber = async (phone) => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('140') || clean.startsWith('160')) {
    return { isCommercial: true, type: 'Regulated commercial call' };
  }
  if (clean.startsWith('1800')) {
    return { isCommercial: true, type: 'Toll-free number' };
  }
  return { isCommercial: false };
};

module.exports = { lookupPhone, isCommercialNumber };
