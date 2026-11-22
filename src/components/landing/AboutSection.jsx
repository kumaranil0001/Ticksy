import React from 'react';
import {
  Target,
  Zap,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TicksyLogo } from '../common/TicksyLogo';

export const AboutSection = ({ onGetStarted, onGoToDashboard, isLoggedIn = false }) => {
  const principles = [
    {
      icon: Zap,
      title: 'Frictionless Velocity',
      description: 'Zero loading spinners or bloated workflows. Open Ticksy, jot down your task in seconds, and stay in flow.'
    },
    {
      icon: Target,
      title: 'Distraction-Free Focus',
      description: 'A clean, intentional layout without notification noise or complicated sprint configurations. Only what matters.'
    },
    {
      icon: Layers,
      title: 'Structured Workspaces',
      description: 'Keep your client projects, engineering sprints, and personal milestones in clean, compartmentalized stacks.'
    },
    {
      icon: Shield,
      title: 'Data Sovereignty & Privacy',
      description: 'Your notes and tasks are strictly yours. Powered by enterprise-grade encryption with complete data ownership.'
    }
  ];

  return (
    <section id="about" style={{
      padding: '80px 0',
      position: 'relative',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      transition: 'background-color 0.2s ease'
    }}>
      <div className="container">
        {/* Top Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 56px auto' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            About Ticksy
          </span>

          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '14px',
            color: 'var(--text-main)',
            lineHeight: 1.15
          }}>
            Designed for clarity. <br />
            Built for sustained momentum.
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            We stripped away the noise of enterprise project suites to give you the speed of pen and paper, enhanced by modern cloud intelligence.
          </p>
        </div>

        {/* Two Column Editorial Presentation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.1fr) minmax(320px, 1.3fr)',
          gap: '48px',
          alignItems: 'center'
        }} className="about-editorial-grid">
          {/* Left Column: Story & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <TicksyLogo size={38} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                The Ticksy Philosophy
              </h3>
            </div>

            <div style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <p>
                Modern productivity software has lost its way. You open an app to write a quick thought, and you're confronted with complex sprint boards, required metadata fields, and red notification badges.
              </p>

              <p>
                <strong style={{ color: 'var(--text-main)' }}>Ticksy was built on first principles.</strong> When an idea strikes or a deadline looms, your task manager should get out of the way. It should provide instant clarity, effortless time-boxing, and visceral satisfaction when you get things done.
              </p>

              {/* Quote card */}
              <div style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-sm)',
                marginTop: '8px'
              }}>
                <blockquote style={{
                  fontSize: '0.925rem',
                  fontStyle: 'italic',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  marginBottom: '10px'
                }}>
                  “Simplicity is about subtracting the obvious and adding the meaningful.”
                </blockquote>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                  — John Maeda, The Laws of Simplicity
                </span>
              </div>

              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={isLoggedIn && onGoToDashboard ? onGoToDashboard : onGetStarted}
                  className="btn btn-primary btn-md"
                  style={{ gap: '8px' }}
                >
                  <span>{isLoggedIn ? 'Go to Workspace' : 'Experience Ticksy Free'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Principle Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {principles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--text-dim)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  <div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-main)',
                      marginBottom: '16px'
                    }}>
                      <Icon size={19} strokeWidth={2.2} />
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-editorial-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
};
