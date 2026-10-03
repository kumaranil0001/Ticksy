import React from 'react';

export const TicksyLogo = ({ size = 36 }) => {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.round(size * 0.28)}px`,
      background: 'var(--logo-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--logo-shadow)',
      flexShrink: 0,
      transition: 'all 0.2s ease'
    }}>
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern Stylized T with integrated dynamic Checkmark / Tick */}
        <path
          d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5C21 7.32843 20.3284 8 19.5 8H13.5V19.5C13.5 20.3284 12.8284 21 12 21C11.1716 21 10.5 20.3284 10.5 19.5V8H4.5C3.67157 8 3 7.32843 3 6.5Z"
          fill="var(--logo-icon)"
          opacity="0.35"
        />
        <path
          d="M6 13.5L10.5 18L19.5 7.5"
          stroke="var(--logo-icon)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
