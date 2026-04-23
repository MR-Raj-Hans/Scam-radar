import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, User, MapPin, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { INDIAN_STATES } from '../utils/constants';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', city: '', state: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password, { city: form.city, state: form.state });
    if (result.success) {
      toast.success('Welcome to ScamRadar!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const update = (key) => (e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: '' })); };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red" fill="currentColor" />
            <span className="text-2xl font-black"><span className="text-white">Scam</span><span className="text-red">Radar</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/40 text-sm mt-1">Join thousands protecting India from scams</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="reg-name" type="text" value={form.name} onChange={update('name')} placeholder="Rahul Sharma" className={`input-field pl-10 ${errors.name ? 'border-red/50' : ''}`} />
              </div>
              {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="reg-email" type="email" value={form.email} onChange={update('email')} placeholder="rahul@example.com" className={`input-field pl-10 ${errors.email ? 'border-red/50' : ''}`} />
              </div>
              {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min 6 characters" className={`input-field pl-10 pr-10 ${errors.password ? 'border-red/50' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Repeat password" className={`input-field pl-10 ${errors.confirmPassword ? 'border-red/50' : ''}`} />
              </div>
              {errors.confirmPassword && <p className="text-red text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">City (Optional)</label>
                <input type="text" value={form.city} onChange={update('city')} placeholder="Mumbai" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">State (Optional)</label>
                <select value={form.state} onChange={update('state')} className="input-field">
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-red hover:text-red-light font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
