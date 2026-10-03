import React, { useState } from 'react';
import {
  Sparkles,
  LogOut,
  Plus,
  Menu,
  X,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TicksyLogo } from '../common/TicksyLogo';

export const Navbar = ({
  onOpenAuth,
  onOpenAbout,
  onOpenContact,
  onOpenNewTodo,
  setActiveTab
}) => {
  const { user, isGuest, signOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Before login: Only clean public links
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
        {/* Left: Modern Ticksy Brand Logo & Name */}
        <div
          onClick={() => {
            if (user) {
              setActiveTab('tasks');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
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
            <span style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.1,
              color: 'var(--text-main)'
            }}>
              Ticksy
            </span>
          </div>
        </div>

        {/* Center: Desktop Public Links (Only visible before login) */}
        {!user && (
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

        {/* Right Corner: Theme Toggle & Clean Auth Controls (No Local Demo) */}
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
              <button
                onClick={onOpenNewTodo}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span className="hide-on-mobile">New Task</span>
              </button>

              {/* Clean User Profile Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 4px 5px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)'
              }}>
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
          {!user && (
            <button
              className="btn btn-ghost mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '7px' }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu (Public) */}
      {mobileMenuOpen && !user && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
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
          </div>
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
