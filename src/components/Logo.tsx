import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcebbb" />
          <stop offset="50%" stopColor="#e5b85c" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="goldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5b85c" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <filter id="glowLogo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g transform="translate(256, 256)" filter="url(#glowLogo)">
        {/* Outer decorative dashed ring */}
        <circle cx="0" cy="0" r="230" fill="none" stroke="url(#goldGradDark)" strokeWidth="3" strokeDasharray="8 8" opacity="0.7" />
        <circle cx="0" cy="0" r="242" fill="none" stroke="url(#goldGradMain)" strokeWidth="1" opacity="0.5" />

        {/* 16-pointed complex star background (4 squares) */}
        <g stroke="url(#goldGradDark)" strokeWidth="2" opacity="0.5">
          <rect x="-160" y="-160" width="320" height="320" rx="16" />
          <rect x="-160" y="-160" width="320" height="320" rx="16" transform="rotate(22.5)" />
          <rect x="-160" y="-160" width="320" height="320" rx="16" transform="rotate(45)" />
          <rect x="-160" y="-160" width="320" height="320" rx="16" transform="rotate(67.5)" />
        </g>

        {/* 8-pointed primary star (2 squares) */}
        <g stroke="url(#goldGradMain)" strokeWidth="6" fill="rgba(10, 26, 17, 0.6)">
          <rect x="-125" y="-125" width="250" height="250" rx="12" />
          <rect x="-125" y="-125" width="250" height="250" rx="12" transform="rotate(45)" />
        </g>

        {/* Inner 8-pointed star (offset) */}
        <g stroke="url(#goldGradMain)" strokeWidth="3" fill="none">
          <rect x="-90" y="-90" width="180" height="180" rx="8" transform="rotate(22.5)" />
          <rect x="-90" y="-90" width="180" height="180" rx="8" transform="rotate(67.5)" />
        </g>

        {/* Center Emblem Shield/Circle */}
        <circle cx="0" cy="0" r="85" fill="#05100a" stroke="url(#goldGradMain)" strokeWidth="4" />
        <circle cx="0" cy="0" r="75" fill="none" stroke="url(#goldGradDark)" strokeWidth="2" strokeDasharray="4 4" />

        {/* Arabic Text "اقرأ" */}
        <text x="0" y="30" fontFamily="'Amiri', 'Traditional Arabic', serif" fontSize="85" fontWeight="bold" textAnchor="middle" fill="url(#goldGradMain)">اقرأ</text>
        
        {/* Small decorative dots around the text */}
        <circle cx="0" cy="-50" r="4" fill="url(#goldGradMain)" />
        <circle cx="0" cy="58" r="4" fill="url(#goldGradMain)" />
        <circle cx="-54" cy="4" r="4" fill="url(#goldGradMain)" />
        <circle cx="54" cy="4" r="4" fill="url(#goldGradMain)" />
      </g>
    </svg>
  );
}
