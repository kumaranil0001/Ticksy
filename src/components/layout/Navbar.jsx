import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  LogOut,
  Plus,
  Menu,
  X,
  Mail,
  Sun,
  Moon,
  Home,
  Layers,
  ArrowRight,
  UserCog,
  TrendingUp,
  ChevronDown,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TicksyLogo } from '../common/TicksyLogo';

export const Navbar = ({
  onOpenAuth,
  onOpenAbout,
  onOpenContact,
  onOpenNewTodo,
  currentView = 'landing',
  onNavigateToMain,
  onNavigateToDashboard,
  onNavigateToProfile,
  onNavigateToProgress
}) => {
  const { user, isGuest, signOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Clean public navigation links
  const publicLinks = [
    { id: 'benefits', label: 'Benefits', action: () => {
      const el = document.getElementById('benefits');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }},
    { id: 'about', label: 'About', action: () => {
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onOpenAbout) {
        onOpenAbout();
      }
    }},
    { id: 'contact', label: 'Contact', icon: Mail, action: onOpenContact },
  ];

  const handleTitleClick = () => {
    if (onNavigateToMain) {
      onNavigateToMain();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="glass-nav" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Left: Modern Ticksy Brand Logo & Name (Clicks to Main Page) */}
        <div
          onClick={handleTitleClick}
          className="ticksy-brand-link"
          title={user ? "Transfer to Main Page" : "Ticksy Home"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <TicksyLogo size={34} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="ticksy-brand-text"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.1,
                color: 'var(--text-main)',
                transition: 'color 0.2s ease'
              }}
            >
              Ticksy
            </span>
          </div>
        </div>

        {/* Center: Desktop Public Links (Visible when logged out OR on Main Page) */}
        {(!user || currentView === 'landing') && (
          <nav style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
          }} className="desktop-nav">
            {publicLinks.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="btn btn-ghost"
                style={{
                  fontSize: '0.875rem',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)'
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Right Corner: Theme Toggle & Clean Auth / Workspace Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              padding: '7px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-card)'
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user ? (
            /* Logged-in State in Header */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentView === 'landing' ? (
                /* When viewing Main Page while logged in: Prominent Go to Workspace button */
                <button
                  onClick={onNavigateToDashboard}
                  className="btn btn-primary btn-sm"
                  title="Return to your workspace dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
                    borderColor: 'transparent',
                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  <Layers size={14} strokeWidth={2.2} />
                  <span>Go to Workspace</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                /* When in Workspace Dashboard */
                <>
                  <button
                    onClick={onNavigateToMain}
                    className="btn btn-ghost btn-sm hide-on-mobile"
                    title="Transfer to Main Page"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      padding: '6px 10px'
                    }}
                  >
                    <Home size={14} />
                    <span>Main Page</span>
                  </button>

                  <button
                    onClick={onOpenNewTodo}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span className="hide-on-mobile">New Task</span>
                  </button>
                </>
              )}

              {/* Interactive User Profile Pill & Dropdown */}
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <div
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  title="Click to view Profile & Performance options"
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 5px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--bg-primary)'
                  }}>
                    {user.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-main)'
                  }}>
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    {isGuest && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}> (Guest)</span>}
                  </span>
                  <ChevronDown size={13} color="var(--text-dim)" style={{ transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </div>

                {/* Profile Floating Dropdown Menu */}
                {profileMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '240px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
                    padding: '8px',
                    zIndex: 200,
                    animation: 'fadeIn 0.18s ease-out'
                  }}>
                    {/* Header in dropdown */}
                    <div style={{
                      padding: '8px 10px 10px 10px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '6px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {user.user_metadata?.full_name || 'Ticksy User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email || 'local@ticksy.dev'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {isGuest ? (
                          <span style={{ fontSize: '0.675rem', color: '#f59e0b', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                            Guest Demo
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.675rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                            Cloud Synced
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onNavigateToProfile) onNavigateToProfile();
                      }}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <UserCog size={15} color="var(--accent-primary)" />
                      <span>Profile & Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onNavigateToProgress) onNavigateToProgress();
                      }}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <TrendingUp size={15} color="#10b981" />
                      <span>Progress & Success Rate</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onNavigateToDashboard) onNavigateToDashboard();
                      }}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        fontSize: '0.825rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Layers size={15} />
                      <span>Workspace Tasks</span>
                    </button>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0', paddingTop: '6px' }}>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          signOut();
                        }}
                        className="btn btn-ghost"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          gap: '10px',
                          padding: '8px 10px',
                          fontSize: '0.825rem',
                          color: '#ef4444',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Redesigned Standalone Log Out Button */}
              <button
                onClick={signOut}
                title="Log out of Ticksy"
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '6px 12px',
                  gap: '6px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                }}
              >
                <LogOut size={13} />
                <span className="hide-on-mobile">Log out</span>
              </button>
            </div>
          ) : (
            /* Non-logged-in State */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onOpenAuth('guest')}
                className="btn btn-ghost btn-sm hide-on-mobile"
                style={{ fontSize: '0.85rem', color: 'var(--text-muted)', gap: '4px' }}
              >
                <Sparkles size={14} />
                <span>Guest Demo</span>
              </button>

              <button
                onClick={() => onOpenAuth('signin')}
                className="btn btn-secondary btn-sm"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="btn btn-primary btn-sm"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="btn btn-ghost mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '7px' }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {user ? (
            <>
              {currentView === 'landing' ? (
                <button
                  onClick={() => { onNavigateToDashboard(); setMobileMenuOpen(false); }}
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: 'center', gap: '8px', padding: '10px 14px' }}
                >
                  <Layers size={16} />
                  <span>Go to Workspace</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => { onNavigateToMain(); setMobileMenuOpen(false); }}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'center', gap: '8px', padding: '10px 14px' }}
                >
                  <Home size={16} />
                  <span>Main Page</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToProfile) onNavigateToProfile();
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', padding: '10px 12px', gap: '8px' }}
              >
                <UserCog size={16} />
                <span>Profile & Password</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToProgress) onNavigateToProgress();
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', padding: '10px 12px', gap: '8px' }}
              >
                <TrendingUp size={16} color="#10b981" />
                <span>Progress & Success Rate</span>
              </button>

              {publicLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { item.action(); setMobileMenuOpen(false); }}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <span>{item.label}</span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '10px 12px', color: '#ef4444', width: '100%', gap: '8px' }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {publicLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { item.action(); setMobileMenuOpen(false); }}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => { onOpenAuth('guest'); setMobileMenuOpen(false); }}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Sparkles size={14} /> Guest Demo
                </button>
                <button
                  onClick={() => { onOpenAuth('signin'); setMobileMenuOpen(false); }}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
