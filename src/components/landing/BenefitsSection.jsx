import React from 'react';
import {
  Calendar,
  FolderKanban,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const BenefitsSection = ({ onSelectView }) => {
  const benefits = [
    {
      icon: Calendar,
      title: 'Interactive Calendar Scheduling',
      tagline: 'Time-boxed execution',
      description: 'Click on any date to instantly reveal that day’s scheduled agenda. Plan future sprints, avoid bottlenecks, and never miss a deadline.',
      actionLabel: 'Preview Calendar',
      actionView: 'calendar'
    },
    {
      icon: FolderKanban,
      title: 'Project Workspaces & Tags',
      tagline: 'Deep compartmentalization',
      description: 'Group tasks into dedicated project spaces like Product Roadmap, Design System, or Personal Goals. Keep your work streams completely organized.',
      actionLabel: 'Explore Projects',
      actionView: 'projects'
    },
    {
      icon: ShieldCheck,
      title: 'Distraction-Free Deep Work',
      tagline: 'Zero-distraction flow',
      description: 'A calm, intentional interface engineered to keep you in flow state. No notification spam, complex sprint boards, or redundant menus—just pure execution.',
      actionLabel: 'Focus Workflow',
      actionView: 'tasks'
    },
    {
      icon: Zap,
      title: 'Instant Real-Time Cloud Sync',
      tagline: 'Seamless continuity',
      description: 'Capture thoughts in milliseconds and enjoy seamless synchronization across all your devices, with zero lag and instant offline caching when you are on the move.',
      actionLabel: 'Experience Speed',
      actionView: 'tasks'
    },
    {
      icon: CheckCircle2,
      title: 'Real-Time Completion Metrics',
      tagline: 'Built for momentum',
      description: 'Experience instant visual satisfaction with real-time completion tracking, streak records, and daily progress percentages.',
      actionLabel: 'Try in Dashboard',
      actionView: 'tasks'
    },
    {
      icon: Clock,
      title: 'Smart Schedule Timeline',
      tagline: 'Clarity over clutter',
      description: 'Automatically sorts tasks into Overdue, Today, Tomorrow, and Later. Focus solely on what moves the needle right now without distraction.',
      actionLabel: 'Open Timeline',
      actionView: 'schedule'
    }
  ];

  return (
    <section id="benefits" style={{
      padding: '70px 0',
      position: 'relative'
    }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 50px auto' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            Capabilities & Workflow
          </span>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '14px',
            color: 'var(--text-main)'
          }}>
            Engineered for clarity, speed, <br />
            and sustained momentum
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Say goodbye to bloated, sluggish task managers. Ticksy pairs the simplicity of a notepad with the power of modern cloud engineering.
          </p>
        </div>

        {/* Clean Benefits Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass-panel"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--text-dim)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                }}
              >
                <div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-main)',
                    marginBottom: '18px'
                  }}>
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <span style={{
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: 'var(--text-dim)',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    {item.tagline}
                  </span>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: '22px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => {
                      if (item.actionCustom) {
                        item.actionCustom();
                      } else if (item.actionView) {
                        onSelectView(item.actionView);
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: 0,
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
