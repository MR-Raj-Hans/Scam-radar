// Source: TRAI official numbering plan — publicly available
// This covers all major Indian mobile number series

const TRAI_SERIES = [

  // ═══════════════════════════════════════════
  // JIO — 6000 series (newest operator)
  // ═══════════════════════════════════════════
  { series: '60000', operator: 'Reliance Jio', circle: 'Maharashtra', circleCode: 'MH', technology: 'LTE' },
  { series: '60001', operator: 'Reliance Jio', circle: 'Maharashtra', circleCode: 'MH', technology: 'LTE' },
  { series: '60002', operator: 'Reliance Jio', circle: 'Delhi', circleCode: 'DL', technology: 'LTE' },
  { series: '60003', operator: 'Reliance Jio', circle: 'Karnataka', circleCode: 'KA', technology: 'LTE' },
  { series: '60004', operator: 'Reliance Jio', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'LTE' },
  { series: '60005', operator: 'Reliance Jio', circle: 'Gujarat', circleCode: 'GJ', technology: 'LTE' },
  { series: '60006', operator: 'Reliance Jio', circle: 'Rajasthan', circleCode: 'RJ', technology: 'LTE' },
  { series: '60007', operator: 'Reliance Jio', circle: 'Uttar Pradesh (West)', circleCode: 'UPW', technology: 'LTE' },
  { series: '60008', operator: 'Reliance Jio', circle: 'Uttar Pradesh (East)', circleCode: 'UPE', technology: 'LTE' },
  { series: '60009', operator: 'Reliance Jio', circle: 'West Bengal', circleCode: 'WB', technology: 'LTE' },
  { series: '70000', operator: 'Reliance Jio', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'LTE' },
  { series: '70001', operator: 'Reliance Jio', circle: 'Telangana', circleCode: 'TS', technology: 'LTE' },
  { series: '70002', operator: 'Reliance Jio', circle: 'Kerala', circleCode: 'KL', technology: 'LTE' },
  { series: '70003', operator: 'Reliance Jio', circle: 'Punjab', circleCode: 'PB', technology: 'LTE' },
  { series: '70004', operator: 'Reliance Jio', circle: 'Haryana', circleCode: 'HR', technology: 'LTE' },
  { series: '70005', operator: 'Reliance Jio', circle: 'Bihar', circleCode: 'BR', technology: 'LTE' },
  { series: '70006', operator: 'Reliance Jio', circle: 'Odisha', circleCode: 'OR', technology: 'LTE' },
  { series: '70007', operator: 'Reliance Jio', circle: 'Madhya Pradesh', circleCode: 'MP', technology: 'LTE' },
  { series: '70008', operator: 'Reliance Jio', circle: 'Himachal Pradesh', circleCode: 'HP', technology: 'LTE' },
  { series: '70009', operator: 'Reliance Jio', circle: 'Assam', circleCode: 'AS', technology: 'LTE' },

  // ═══════════════════════════════════════════
  // AIRTEL — 98, 99, 70, 80, 81, 82 series
  // ═══════════════════════════════════════════
  { series: '98100', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98101', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98102', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98103', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98200', operator: 'Airtel', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98201', operator: 'Airtel', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98202', operator: 'Airtel', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98300', operator: 'Airtel', circle: 'West Bengal', circleCode: 'WB', technology: 'GSM' },
  { series: '98301', operator: 'Airtel', circle: 'West Bengal', circleCode: 'WB', technology: 'GSM' },
  { series: '98400', operator: 'Airtel', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98401', operator: 'Airtel', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98402', operator: 'Airtel', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98450', operator: 'Airtel', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '98451', operator: 'Airtel', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '98452', operator: 'Airtel', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '98490', operator: 'Airtel', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },
  { series: '98491', operator: 'Airtel', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },
  { series: '98492', operator: 'Airtel', circle: 'Telangana', circleCode: 'TS', technology: 'GSM' },
  { series: '98700', operator: 'Airtel', circle: 'Gujarat', circleCode: 'GJ', technology: 'GSM' },
  { series: '98701', operator: 'Airtel', circle: 'Gujarat', circleCode: 'GJ', technology: 'GSM' },
  { series: '98750', operator: 'Airtel', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '98751', operator: 'Airtel', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '98760', operator: 'Airtel', circle: 'Punjab', circleCode: 'PB', technology: 'GSM' },
  { series: '98761', operator: 'Airtel', circle: 'Punjab', circleCode: 'PB', technology: 'GSM' },
  { series: '98930', operator: 'Airtel', circle: 'Madhya Pradesh', circleCode: 'MP', technology: 'GSM' },
  { series: '98931', operator: 'Airtel', circle: 'Madhya Pradesh', circleCode: 'MP', technology: 'GSM' },
  { series: '98940', operator: 'Airtel', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98941', operator: 'Airtel', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98950', operator: 'Airtel', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '98951', operator: 'Airtel', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '99100', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '99101', operator: 'Airtel', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },

  // ═══════════════════════════════════════════
  // VODAFONE IDEA (Vi) — 98, 99, 95 series
  // ═══════════════════════════════════════════
  { series: '98110', operator: 'Vodafone Idea (Vi)', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98111', operator: 'Vodafone Idea (Vi)', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98112', operator: 'Vodafone Idea (Vi)', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98210', operator: 'Vodafone Idea (Vi)', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98211', operator: 'Vodafone Idea (Vi)', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98212', operator: 'Vodafone Idea (Vi)', circle: 'Maharashtra', circleCode: 'MH', technology: 'GSM' },
  { series: '98240', operator: 'Vodafone Idea (Vi)', circle: 'Gujarat', circleCode: 'GJ', technology: 'GSM' },
  { series: '98241', operator: 'Vodafone Idea (Vi)', circle: 'Gujarat', circleCode: 'GJ', technology: 'GSM' },
  { series: '98310', operator: 'Vodafone Idea (Vi)', circle: 'West Bengal', circleCode: 'WB', technology: 'GSM' },
  { series: '98311', operator: 'Vodafone Idea (Vi)', circle: 'West Bengal', circleCode: 'WB', technology: 'GSM' },
  { series: '98330', operator: 'Vodafone Idea (Vi)', circle: 'Kolkata', circleCode: 'KO', technology: 'GSM' },
  { series: '98331', operator: 'Vodafone Idea (Vi)', circle: 'Kolkata', circleCode: 'KO', technology: 'GSM' },
  { series: '98410', operator: 'Vodafone Idea (Vi)', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98411', operator: 'Vodafone Idea (Vi)', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '98460', operator: 'Vodafone Idea (Vi)', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '98461', operator: 'Vodafone Idea (Vi)', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '98470', operator: 'Vodafone Idea (Vi)', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '98471', operator: 'Vodafone Idea (Vi)', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '98480', operator: 'Vodafone Idea (Vi)', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },
  { series: '98481', operator: 'Vodafone Idea (Vi)', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },
  { series: '98710', operator: 'Vodafone Idea (Vi)', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '98711', operator: 'Vodafone Idea (Vi)', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '98720', operator: 'Vodafone Idea (Vi)', circle: 'Haryana', circleCode: 'HR', technology: 'GSM' },
  { series: '98721', operator: 'Vodafone Idea (Vi)', circle: 'Haryana', circleCode: 'HR', technology: 'GSM' },

  // ═══════════════════════════════════════════
  // BSNL — 94, 70 series
  // ═══════════════════════════════════════════
  { series: '94100', operator: 'BSNL', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '94101', operator: 'BSNL', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '94150', operator: 'BSNL', circle: 'Himachal Pradesh', circleCode: 'HP', technology: 'GSM' },
  { series: '94151', operator: 'BSNL', circle: 'Himachal Pradesh', circleCode: 'HP', technology: 'GSM' },
  { series: '94160', operator: 'BSNL', circle: 'Punjab', circleCode: 'PB', technology: 'GSM' },
  { series: '94161', operator: 'BSNL', circle: 'Punjab', circleCode: 'PB', technology: 'GSM' },
  { series: '94170', operator: 'BSNL', circle: 'Haryana', circleCode: 'HR', technology: 'GSM' },
  { series: '94171', operator: 'BSNL', circle: 'Haryana', circleCode: 'HR', technology: 'GSM' },
  { series: '94180', operator: 'BSNL', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '94181', operator: 'BSNL', circle: 'Rajasthan', circleCode: 'RJ', technology: 'GSM' },
  { series: '94190', operator: 'BSNL', circle: 'Uttar Pradesh (West)', circleCode: 'UPW', technology: 'GSM' },
  { series: '94191', operator: 'BSNL', circle: 'Uttar Pradesh (East)', circleCode: 'UPE', technology: 'GSM' },
  { series: '94610', operator: 'BSNL', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '94611', operator: 'BSNL', circle: 'Karnataka', circleCode: 'KA', technology: 'GSM' },
  { series: '94620', operator: 'BSNL', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '94621', operator: 'BSNL', circle: 'Kerala', circleCode: 'KL', technology: 'GSM' },
  { series: '94630', operator: 'BSNL', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '94631', operator: 'BSNL', circle: 'Tamil Nadu', circleCode: 'TN', technology: 'GSM' },
  { series: '94640', operator: 'BSNL', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },
  { series: '94641', operator: 'BSNL', circle: 'Andhra Pradesh', circleCode: 'AP', technology: 'GSM' },

  // ═══════════════════════════════════════════
  // MTNL — Delhi & Mumbai only
  // ═══════════════════════════════════════════
  { series: '98680', operator: 'MTNL', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98681', operator: 'MTNL', circle: 'Delhi', circleCode: 'DL', technology: 'GSM' },
  { series: '98690', operator: 'MTNL', circle: 'Mumbai', circleCode: 'MU', technology: 'GSM' },
  { series: '98691', operator: 'MTNL', circle: 'Mumbai', circleCode: 'MU', technology: 'GSM' },

  // ═══════════════════════════════════════════
  // SPECIAL SERIES — Toll Free, Premium, Virtual
  // ═══════════════════════════════════════════
  { series: '1800', operator: 'Unknown', circle: 'All India', circleCode: 'AI', technology: 'Mixed', serviceType: 'toll-free', isCommercialSeries: true },
  { series: '1900', operator: 'Unknown', circle: 'All India', circleCode: 'AI', technology: 'Mixed', serviceType: 'premium', isCommercialSeries: true },
  { series: '140', operator: 'TRAI Regulated', circle: 'All India', circleCode: 'AI', technology: 'Mixed', serviceType: 'virtual', isCommercialSeries: true },
  // 140XXXXXXX = Commercial transactional calls (TRAI regulated)
  { series: '1400', operator: 'TRAI Regulated', circle: 'All India', circleCode: 'AI', technology: 'Mixed', serviceType: 'virtual', isCommercialSeries: true },
  { series: '160', operator: 'TRAI Regulated', circle: 'All India', circleCode: 'AI', technology: 'Mixed', serviceType: 'virtual', isCommercialSeries: true },
  // 160XXXXXXX = Service/transactional calls (banks, govt)
];

module.exports = TRAI_SERIES;
