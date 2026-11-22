import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Flame,
  Zap,
  ShieldCheck,
  RefreshCw,
  Quote
} from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { useTodos } from '../../context/TodoContext';

export const HeroSection = ({
  onGetStarted,
  onGoToDashboard,
  isLoggedIn = false
}) => {
  const { user, loginAsGuest } = useAuth();
  const { triggerConfetti } = useTodos();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mockChecked, setMockChecked] = useState([true, false, false, false]);

  const cycleQuote = () => {
    setIsAnimating(true);
    setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  };

  // 5-second automatic quote cycle with pause-on-hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      cycleQuote();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentQuoteIndex, isPaused]);

  const handleToggleMock = (index) => {
    const next = [...mockChecked];
    next[index] = !next[index];
    setMockChecked(next);
    if (next[index]) {
      triggerConfetti();
    }
  };

  const currentQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];

  return (
    <section id="hero" style={{
      paddingTop: '44px',
      paddingBottom: '76px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        {/* Modern Interactive Motivational Quote Showcase (Auto 5-sec cycle) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 18px 11px 16px',
              background: 'var(--quote-banner-bg)',
              border: '1px solid var(--quote-banner-border)',
              borderRadius: 'var(--radius-full)',
              maxWidth: '780px',
              width: '100%',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Category / Icon Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Quote size={11} strokeWidth={2.5} />
              <span>{currentQuote.category || 'Focus'}</span>
            </div>

            {/* Smooth Animated Quote Content */}
            <div style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div
                key={currentQuoteIndex}
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  animation: 'quoteSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <span>“{currentQuote.quote}”</span>
                <span style={{
                  marginLeft: '8px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  fontSize: '0.825rem'
                }}>
                  — {currentQuote.author}
                </span>
              </div>
            </div>

            {/* Quote Progress Dots */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }} className="hide-on-mobile">
              {MOTIVATIONAL_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuoteIndex(idx)}
                  title={`Quote ${idx + 1}`}
                  style={{
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    width: currentQuoteIndex === idx ? '16px' : '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: currentQuoteIndex === idx ? 'var(--text-main)' : 'var(--border-card)',
                    transition: 'all 0.25s ease'
                  }}
                />
              ))}
            </div>

            {/* Next Quote Manual Button */}
            <button
              onClick={cycleQuote}
              title={isPaused ? "Paused on hover. Click for next" : "Next quote (Auto-rotates every 5s)"}
              className="btn btn-ghost"
              style={{
                padding: '5px',
                borderRadius: '50%',
                color: 'var(--text-muted)',
                flexShrink: 0
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  transition: 'transform 0.4s ease',
                  transform: isAnimating ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>

            {/* 5-Second Animated Progress Bar at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              width: '100%',
              background: 'transparent'
            }}>
              <div
                key={`progress-${currentQuoteIndex}-${isPaused}`}
                style={{
                  height: '100%',
                  background: 'var(--text-main)',
                  opacity: 0.5,
                  width: isPaused ? '100%' : '0%',
                  animation: isPaused ? 'none' : 'quoteProgress 5s linear forwards'
                }}
              />
            </div>
          </div>
        </div>

        {/* Hero Headline & Intro (Wider Layout & 'Ticksy your wins') */}
        <div style={{ textAlign: 'center', maxWidth: '1040px', margin: '0 auto 38px auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.8vw, 4.65rem)',
            lineHeight: 1.12,
            marginBottom: '20px',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: 'var(--text-main)'
          }}>
            Organize chaos. Build momentum. <br />
            <span className="gradient-text">Ticksy your wins.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 1.9vw, 1.25rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: '740px',
            margin: '0 auto 32px auto'
          }}>
            A clean, distraction-free productivity workspace. Complete with interactive calendar scheduling, multi-project workflows, and instant cloud sync.
          </p>

          {/* Primary Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {user || isLoggedIn ? (
              <>
                <button
                  onClick={onGoToDashboard}
                  className="btn btn-primary btn-lg"
                  style={{
                    gap: '8px',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
                    borderColor: 'transparent',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <span>Go to Workspace</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('benefits');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '8px', padding: '12px 22px', fontSize: '0.98rem' }}
                >
                  <Sparkles size={16} />
                  <span>Explore Features</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGetStarted}
                  className="btn btn-primary btn-lg"
                  style={{ gap: '8px', padding: '12px 24px', fontSize: '0.98rem' }}
                >
                  <span>Launch Ticksy Free</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  onClick={() => { loginAsGuest(); onGetStarted(); }}
                  className="btn btn-secondary btn-lg"
                  style={{ gap: '8px', padding: '12px 22px', fontSize: '0.98rem' }}
                >
                  <Sparkles size={16} />
                  <span>Explore Instant Demo</span>
                </button>
              </>
            )}
          </div>

          {/* Redesigned Sleek Feature & Trust Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '28px'
          }}>
            <div className="hero-feature-chip">
              <CheckCircle2 size={14} className="chip-icon-green" />
              <span>Free forever for individuals</span>
            </div>
            <div className="hero-feature-chip">
              <Zap size={14} className="chip-icon-amber" />
              <span>Instant offline-first speed</span>
            </div>
            <div className="hero-feature-chip">
              <ShieldCheck size={14} className="chip-icon-indigo" />
              <span>Private & encrypted by default</span>
            </div>
            <div className="hero-feature-chip">
              <Calendar size={14} className="chip-icon-cyan" />
              <span>Time-boxed calendar agenda</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Ticksy Preview Window (Expanded Width) */}
        <div style={{
          position: 'relative',
          maxWidth: '980px',
          margin: '34px auto 0 auto',
          borderRadius: 'var(--radius-xl)',
          padding: '1px',
          background: 'var(--border-card)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)'
          }}>
            {/* Top Mock Window Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-card)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                  ticksy.app/workspace
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}>
                  <Flame size={13} color="#f59e0b" /> 14-Day Streak
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)',
                  color: '#10b981',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={13} /> 75% Done
                </div>
              </div>
            </div>

            {/* Interactive Mock Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  title: 'Ship Q4 Product Roadmap & Design System tokens',
                  project: 'Productivity Matrix',
                  priority: 'Urgent',
                  time: 'Today • 2:00 PM'
                },
                {
                  title: 'Review weekly sprint goals and calendar time-blocks',
                  project: 'Deep Focus',
                  priority: 'High',
                  time: 'Today • 4:30 PM'
                },
                {
                  title: 'Draft architectural RFC for instant client offline sync',
                  project: 'Core Architecture',
                  priority: 'Medium',
                  time: 'Tomorrow • 10:00 AM'
                },
                {
                  title: 'Daily 20-minute reading & deliberate focus habit',
                  project: 'Personal Growth',
                  priority: 'Normal',
                  time: 'Tomorrow • 8:00 PM'
                }
              ].map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleMock(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: mockChecked[idx] ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: mockChecked[idx] ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '5px',
                      border: mockChecked[idx] ? 'none' : '1.5px solid var(--border-card)',
                      background: mockChecked[idx] ? 'var(--text-main)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--bg-primary)',
                      transition: 'all 0.15s ease'
                    }}>
                      {mockChecked[idx] && <CheckCircle2 size={14} />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textDecoration: mockChecked[idx] ? 'line-through' : 'none',
                        color: mockChecked[idx] ? 'var(--text-dim)' : 'var(--text-main)'
                      }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {task.time}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)'
                    }}>
                      {task.project}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-dim)'
            }}>
              💡 <em>Click any task above to experience completion feedback and confetti</em>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

