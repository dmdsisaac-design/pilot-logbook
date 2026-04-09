import React, { useState } from 'react';
import { Plane, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = mode === 'signin'
        ? await onSignIn(email, password)
        : await onSignUp(email, password);

      if (result.error) {
        setError(result.error.message || 'Authentication failed');
      } else if (mode === 'signup') {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-300">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Plane size={32} className="text-primary" />
              <h1 className="text-2xl font-bold">Pilot Logbook</h1>
            </div>
            <p className="text-sm text-base-content/60">
              {mode === 'signin' ? 'Welcome back, Captain' : 'Create your account'}
            </p>
          </div>

          {/* Tabs */}
          <div role="tablist" className="tabs tabs-boxed mb-4">
            <button
              role="tab"
              className={`tab flex-1 ${mode === 'signin' ? 'tab-active' : ''}`}
              onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
            >
              <LogIn size={14} className="mr-1" /> Sign In
            </button>
            <button
              role="tab"
              className={`tab flex-1 ${mode === 'signup' ? 'tab-active' : ''}`}
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
            >
              <UserPlus size={14} className="mr-1" /> Sign Up
            </button>
          </div>

          {error && (
            <div className="alert alert-error text-sm mb-3">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success text-sm mb-3">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-base-content/60 block mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="pilot@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-base-content/60 block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs text-base-content/60 block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pl-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === 'signin' ? (
                <><LogIn size={16} /> Sign In</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="text-xs text-center text-base-content/50 mt-3">
              Free plan includes 25 flights. Upgrade to Pro for unlimited logging.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
