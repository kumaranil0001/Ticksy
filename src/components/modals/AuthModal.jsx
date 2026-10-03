import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  if (!isOpen) return null;

  const { signIn, signUp, loginAsGuest, authError, clearError, isConfigured } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn({ email, password });
        if (error) {
          setLocalMessage(error.message || 'Failed to sign in. Please verify credentials.');
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp({ email, password, fullName });
        if (error) {
          setLocalMessage(error.message || 'Failed to create account.');
        } else {
          setLocalMessage('Account created! Logging you in...');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err) {
      setLocalMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-primary)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {mode === 'signin' ? 'Welcome to Ticksy' : 'Create your Ticksy Account'}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {isConfigured ? 'Secured by Supabase Auth' : 'Instant workspace access'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog" title="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            className="btn"
            onClick={() => { setMode('signin'); clearError(); setLocalMessage(''); }}
            style={{
              flex: 1,
              padding: '7px 12px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'signin' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'signin' ? '#ffffff' : 'var(--text-muted)',
              border: 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => { setMode('signup'); clearError(); setLocalMessage(''); }}
            style={{
              flex: 1,
              padding: '7px 12px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'signup' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : 'var(--text-muted)',
              border: 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Feedback Message */}
        {(authError || localMessage) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{localMessage || authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', height: '44px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Processing...'
            ) : mode === 'signin' ? (
              <>Sign In <ArrowRight size={16} /></>
            ) : (
              <>Create Free Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
          color: 'var(--text-dim)',
          fontSize: '0.8rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Guest Demo Action */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="btn btn-secondary"
          style={{ width: '100%', height: '42px', gap: '8px' }}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span>Instant Guest Explorer (No signup required)</span>
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginTop: '18px'
        }}>
          By continuing, you agree to Ticksy's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
