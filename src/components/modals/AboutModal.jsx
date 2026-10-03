import React from 'react';
import { X, Target, Shield, Zap, Sparkles } from 'lucide-react';
import { TicksyLogo } from '../common/TicksyLogo';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TicksyLogo size={36} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>About Ticksy</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>The mission & philosophy behind our workspace</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog" title="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <p>
            <strong style={{ color: 'var(--text-main)' }}>Ticksy</strong> was designed for thinkers and creators who crave clarity over complexity. We stripped away the bloat of traditional project software to create a clean, instantaneous workspace.
          </p>

          <p>
            We believe that <strong style={{ color: 'var(--text-main)' }}>speed and simplicity</strong> foster deep focus. When an idea strikes or a task arises, you need zero latency, flexible scheduling, and clear momentum.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            marginTop: '6px',
            marginBottom: '6px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 600 }}>
                <Target size={16} /> Laser Focus
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0 }}>
                Minimalist interface without distracting popups or bloated menus.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 600 }}>
                <Shield size={16} /> Data Sovereignty
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0 }}>
                Your tasks live in your Supabase PostgreSQL instance protected by Row Level Security.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 600 }}>
                <Zap size={16} /> Instant Edge Speed
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0 }}>
                Optimized for sub-second loading speeds on Vercel's global edge network.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 600 }}>
                <Sparkles size={16} /> Flow State
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0 }}>
                Interactive calendar and project matrices to keep your daily runway clear.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '6px' }}>
            Built with React 19, Supabase Auth & Database, and crafted for modern makers.
          </p>
        </div>

        <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
