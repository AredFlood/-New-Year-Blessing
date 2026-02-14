import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  onBack?: () => void;
  currentView: AppView;
}

export const Header: React.FC<HeaderProps> = ({ onBack, currentView }) => {
  return (
    <header className="sticky top-0 z-50 shadow-md text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #B91C1C 0%, #D92525 50%, #B91C1C 100%)' }}>
      {/* Dragon/Lion Dance Pattern Layer */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dragonPattern" x="0" y="0" width="80" height="60" patternUnits="userSpaceOnUse">
              {/* Swirl / Cloud motif */}
              <path d="M10 30 Q20 10 30 30 Q40 50 50 30" stroke="#F2C84B" strokeWidth="1.5" fill="none" opacity="0.8" />
              <path d="M50 30 Q60 10 70 30 Q80 50 90 30" stroke="#F2C84B" strokeWidth="1.5" fill="none" opacity="0.6" />
              {/* Dragon scale pattern */}
              <circle cx="20" cy="15" r="4" stroke="#F2C84B" strokeWidth="1" fill="none" opacity="0.5" />
              <circle cx="60" cy="45" r="4" stroke="#F2C84B" strokeWidth="1" fill="none" opacity="0.5" />
              {/* Lion mane curls */}
              <path d="M35 5 Q40 0 45 5 Q50 10 45 15 Q40 10 35 15 Q30 10 35 5" stroke="#F2C84B" strokeWidth="1" fill="none" opacity="0.7" />
              <path d="M5 45 Q10 40 15 45 Q20 50 15 55 Q10 50 5 55 Q0 50 5 45" stroke="#F2C84B" strokeWidth="1" fill="none" opacity="0.7" />
              {/* Festive ribbon swirls */}
              <path d="M0 20 C10 15 15 25 25 20" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.4" />
              <path d="M55 10 C65 5 70 15 80 10" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dragonPattern)" />
        </svg>
      </div>

      {/* Decorative gold border at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-festive-gold to-transparent opacity-60"></div>

      {/* Content */}
      <div className="relative max-w-md mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {currentView !== AppView.DASHBOARD && (
            <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          )}
          {/* Dragon left */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64" className="text-festive-gold opacity-90 flex-shrink-0">
            <path fill="currentColor" d="M32 4c-4 0-8 2-10 6-3 5-2 10 1 14-6 2-10 8-10 15 0 8 5 14 12 17 3 1 6 2 9 2s6-1 9-2c7-3 12-9 12-17 0-7-4-13-10-15 3-4 4-9 1-14C44 6 38 4 32 4zm-8 10c1-3 4-5 8-5s7 2 8 5c1 2 0 5-2 7l-6 4-6-4c-2-2-3-5-2-7zm8 40c-10 0-17-7-17-15s5-12 11-13l6 4 6-4c6 1 11 5 11 13s-7 15-17 15z" />
            <circle fill="currentColor" cx="26" cy="36" r="2.5" />
            <circle fill="currentColor" cx="38" cy="36" r="2.5" />
          </svg>
        </div>

        {/* Dragon right */}
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64" className="text-festive-gold opacity-90 flex-shrink-0" style={{ transform: 'scaleX(-1)' }}>
          <path fill="currentColor" d="M32 4c-4 0-8 2-10 6-3 5-2 10 1 14-6 2-10 8-10 15 0 8 5 14 12 17 3 1 6 2 9 2s6-1 9-2c7-3 12-9 12-17 0-7-4-13-10-15 3-4 4-9 1-14C44 6 38 4 32 4zm-8 10c1-3 4-5 8-5s7 2 8 5c1 2 0 5-2 7l-6 4-6-4c-2-2-3-5-2-7zm8 40c-10 0-17-7-17-15s5-12 11-13l6 4 6-4c6 1 11 5 11 13s-7 15-17 15z" />
          <circle fill="currentColor" cx="26" cy="36" r="2.5" />
          <circle fill="currentColor" cx="38" cy="36" r="2.5" />
        </svg>
      </div>
    </header>
  );
};