import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { TicksyLogo } from '../common/TicksyLogo';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export const Footer = ({ onOpenAbout, onOpenContact }) => {
  return (
    <footer style={{
      background: 'var(--bg-footer)',
      borderTop: '1px solid var(--border-card)',
      paddingTop: '64px',
      paddingBottom: '48px',
      marginTop: '90px',
      transition: 'all 0.2s ease'
    }}>
      <div className="container">
        {/* Notion-Style Multi-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1.4fr) repeat(4, minmax(130px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }} className="notion-footer-grid">
          {/* Brand & Notion-style Philosophical Quote */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <TicksyLogo size={32} />
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                color: 'var(--text-main)'
              }}>
                Ticksy
              </span>
            </div>

            {/* Inspiring quote matching the Notion reference */}
            <div style={{ maxWidth: '240px', marginBottom: '24px' }}>
              <blockquote style={{
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                “We shape our tools, and thereafter our tools shape us.”
              </blockquote>
              <cite style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                fontStyle: 'normal'
              }}>
                Marshall McLuhan
              </cite>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '7px', borderRadius: '50%', color: 'var(--text-muted)' }}
                aria-label="GitHub"
              >
                <GithubIcon size={14} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '7px', borderRadius: '50%', color: 'var(--text-muted)' }}
                aria-label="Twitter"
              >
                <TwitterIcon size={14} />
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '16px'
            }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li><a href="#hero" className="footer-link">Task Studio</a></li>
              <li><a href="#benefits" className="footer-link">Interactive Calendar</a></li>
              <li><a href="#benefits" className="footer-link">Project Workspaces</a></li>
              <li><a href="#benefits" className="footer-link">Schedule Timeline</a></li>
              <li><a href="#hero" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Explore more <ArrowRight size={13} /></a></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '16px'
            }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li><a href="#benefits" className="footer-link">Customer stories</a></li>
              <li><a href="#benefits" className="footer-link">Connections</a></li>
              <li><a href="#benefits" className="footer-link">Productivity Guide</a></li>
              <li><button onClick={onOpenContact} className="footer-link-btn">Help Center</button></li>
              <li><a href="#community" onClick={(e) => { e.preventDefault(); alert("Community: Join the Ticksy makers community on GitHub!"); }} className="footer-link">Community</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '16px'
            }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li><button onClick={onOpenAbout} className="footer-link-btn">About us</button></li>
              <li><button onClick={onOpenContact} className="footer-link-btn">Contact & Support</button></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy: Ticksy gives you 100% data ownership."); }} className="footer-link">Security & Privacy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms: Ticksy is free and open-source."); }} className="footer-link">Terms & privacy</a></li>
              <li><a href="#status" onClick={(e) => { e.preventDefault(); alert("All Systems Operational 🟢"); }} className="footer-link">Status</a></li>
            </ul>
          </div>

          {/* Column 4: Ticksy For */}
          <div>
            <h4 style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '16px'
            }}>
              Ticksy for
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li><a href="#hero" className="footer-link">Makers & Founders</a></li>
              <li><a href="#hero" className="footer-link">Software Engineers</a></li>
              <li><a href="#hero" className="footer-link">Designers & Artists</a></li>
              <li><a href="#hero" className="footer-link">Startups</a></li>
              <li><a href="#hero" className="footer-link">Deep Focus Work</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Clean & Minimalist (No Deployed on Vercel / Secured with Supabase) */}
        <div style={{
          paddingTop: '28px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.825rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            © {new Date().getFullYear()} Ticksy Inc. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              All systems normal
            </span>
            <button onClick={onOpenAbout} className="footer-link-btn" style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
              Privacy Rights
            </button>
            <button onClick={onOpenContact} className="footer-link-btn" style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
              Cookies
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: var(--text-main);
          transition: color 0.15s ease;
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--text-dim);
          text-decoration: underline;
        }
        .footer-link-btn {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: var(--text-main);
          cursor: pointer;
          text-align: left;
          transition: color 0.15s ease;
        }
        .footer-link-btn:hover {
          color: var(--text-dim);
          text-decoration: underline;
        }
        @media (max-width: 900px) {
          .notion-footer-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
          }
        }
      `}</style>
    </footer>
  );
};
