import { RISK_CONFIG } from '../utils/constants';
import { AlertTriangle, CheckCircle, Shield, ExternalLink } from 'lucide-react';

export default function RiskBadge({ level, size = 'md', showIcon = true }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.SAFE;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const Icon = level === 'SAFE' ? CheckCircle : level === 'HIGH' ? AlertTriangle : Shield;

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {cfg.label}
    </span>
  );
}
