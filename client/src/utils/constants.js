export const SCAM_TYPES = [
  { value: 'phishing', label: 'Phishing', color: '#FF2D55', icon: '🎣' },
  { value: 'UPI fraud', label: 'UPI Fraud', color: '#FF6B6B', icon: '💳' },
  { value: 'fake job', label: 'Fake Job', color: '#FFD700', icon: '💼' },
  { value: 'lottery', label: 'Lottery', color: '#00B4FF', icon: '🎰' },
  { value: 'romance', label: 'Romance', color: '#FF69B4', icon: '💔' },
  { value: 'investment', label: 'Investment', color: '#00FF88', icon: '📈' },
];

export const SCAM_TYPE_COLORS = {
  phishing: '#FF2D55',
  'UPI fraud': '#FF6B6B',
  'fake job': '#FFD700',
  lottery: '#00B4FF',
  romance: '#FF69B4',
  investment: '#00FF88',
};

export const SCAM_TYPE_ICONS = {
  phishing: '🎣',
  'UPI fraud': '💳',
  'fake job': '💼',
  lottery: '🎰',
  romance: '💔',
  investment: '📈',
};

export const BLACKLIST_TYPES = ['phone', 'email', 'UPI', 'URL', 'bank_account'];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh',
];

export const RISK_CONFIG = {
  HIGH: { color: 'text-red', bg: 'bg-red/20', border: 'border-red/30', label: 'HIGH RISK' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'MEDIUM RISK' },
  LOW: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', label: 'LOW RISK' },
  SAFE: { color: 'text-accent-green', bg: 'bg-accent-green/20', border: 'border-accent-green/30', label: 'APPEARS SAFE' },
};
