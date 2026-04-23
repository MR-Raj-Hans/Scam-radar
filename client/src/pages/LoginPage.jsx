import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleDemo = async (email, role) => {
    const passwords = { 'admin@scamradar.in': 'Admin@123', 'moderator@scamradar.in': 'Mod@123', 'rahul@gmail.com': 'User@123' };
    const result = await login(email, passwords[email]);
    if (result.success) { toast.success(`Logged in as ${role}`); navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red" fill="currentColor" />
            <span className="text-2xl font-black"><span className="text-white">Scam</span><span className="text-red">Radar</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
          <p className="text-white/40 text-sm mt-1">Your scam-fighting dashboard awaits</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
                  placeholder="your@email.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red/50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="Your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red/50' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-white/5 pt-5">
            <p className="text-xs text-white/30 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { email: 'admin@scamradar.in', role: 'Admin', color: 'text-red' },
                { email: 'moderator@scamradar.in', role: 'Mod', color: 'text-accent-blue' },
                { email: 'rahul@gmail.com', role: 'User', color: 'text-accent-green' },
              ].map(({ email, role, color }) => (
                <button
                  key={role}
                  onClick={() => handleDemo(email, role)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <span className={color}>{role}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-white/40 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-red hover:text-red-light font-semibold">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
