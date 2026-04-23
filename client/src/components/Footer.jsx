import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-red" fill="currentColor" />
              <span className="text-lg font-bold"><span className="text-white">Scam</span><span className="text-red">Radar</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              India's largest community-driven scam detection platform. Report, verify and protect yourself from online fraud.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="glow-dot" />
              <span className="text-xs text-white/40">Protecting Indians from cyber fraud since 2024</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/feed" className="hover:text-white transition-colors">Scam Feed</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Blacklist Search</Link></li>
              <li><Link to="/trending" className="hover:text-white transition-colors">Trending Scams</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">Report a Scam</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener" className="hover:text-white transition-colors">Cyber Crime Portal</a></li>
              <li><a href="https://www.rbi.org.in" target="_blank" rel="noopener" className="hover:text-white transition-colors">RBI Fraud Alert</a></li>
              <li><a href="https://sancharsaathi.gov.in" target="_blank" rel="noopener" className="hover:text-white transition-colors">Sanchar Saathi</a></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2024 ScamRadar. All rights reserved. For educational purposes.</p>
          <div className="flex items-center gap-4 text-white/30">
            <span className="text-xs">Emergency: <strong className="text-red">1930</strong> (Cyber Crime Helpline)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
