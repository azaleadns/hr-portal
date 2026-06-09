import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, ShieldAlert, LogIn } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating for a high-quality human feel
    setTimeout(() => {
      // Standard credentials check (case-insensitive for convenience)
      const isCorrectUsername = username.trim().toLowerCase() === 'hr_portal';
      const isCorrectPassword = password === 'portal2026';

      if (isCorrectUsername && isCorrectPassword) {
        onLogin();
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    }, 1200); // realistic network delay
  };

  return (
    <div id="login-container-id" className="login-container">
      {/* Immersive background decoration (glowing orbs) */}
      <div className="bg-glow-orb-1" />
      <div className="bg-glow-orb-2" />
      <div className="bg-glow-orb-3" />
      <div className="bg-line-accent" />

      {/* Glassmorphic Login Card */}
      <motion.div
        id="glass-login-card-id"
        className="glass-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
      >
        {/* Portal Branding Header */}
        <div className="text-center mb-10 select-none">
          <h1 className="login-brand-name text-white">
            <span>S</span>
            <span className="brand-t">T</span>
            <span className="brand-l gold-text">L</span>
            <span className="gold-text">AF</span>
          </h1>
          <p className="text-[13px] font-serif uppercase tracking-[0.25em] text-[#d1d5db] font-medium leading-relaxed">
            HR Portal
          </p>
        </div>

        {/* Validation Errors Banner */}
        {error && (
          <div id="glass-error-banner-id" className="glass-error-banner">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Credentials Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="glass-input-wrapper">
            <input
              id="username-input"
              type="text"
              className="glass-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
            <User size={18} className="glass-input-icon" />
          </div>

          {/* Password Input */}
          <div className="glass-input-wrapper">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              className="glass-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <Lock size={18} className="glass-input-icon" />
            <button
              id="password-toggle-button"
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            id="login-submit-button"
            type="submit"
            className="btn-gold-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#111c36]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
