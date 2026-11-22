import React from 'react';

export const TicksyLogo = ({ size = 36, className = '' }) => {
  const radius = Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.62);

  return (
    <div
      className={`ticksy-brand-logo ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px -1px rgba(99, 102, 241, 0.45), 0 2px 6px -1px rgba(6, 182, 212, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Subtle top specular glass reflection */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '48%',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 100%)',
        pointerEvents: 'none'
      }} />

      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <filter id="ticksy-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* T-Bar: Sleek horizontal pill representing the 'T' top */}
        <rect
          x="7.5"
          y="8"
          width="13"
          height="3.2"
          rx="1.6"
          fill="#ffffff"
          filter="url(#ticksy-mark-shadow)"
        />

        {/* Energetic dynamic Checkmark (Tick) surging upward through the right wing */}
        <path
          d="M 8.5 17.5 L 13.5 22.5 L 24.5 8.5"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ticksy-mark-shadow)"
        />
      </svg>
    </div>
  );
};

