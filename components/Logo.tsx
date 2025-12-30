
import React from 'react';
import { APP_CONFIG } from '../config';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  layout?: 'horizontal' | 'vertical';
  logoUrl?: string;
  businessName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = 'dark',
  layout = 'horizontal',
  logoUrl,
  businessName
}) => {
  const textColor = variant === 'dark' ? 'text-stone-900' : 'text-white';
  const taglineColor = variant === 'dark' ? 'text-stone-400' : 'text-stone-300';
  const borderColor = variant === 'dark' ? 'border-gold-300' : 'border-gold-400';

  const isVertical = layout === 'vertical';
  const displayTitle = businessName || APP_CONFIG.appName;

  return (
    <div className={`flex items-center gap-3 ${isVertical ? 'flex-col text-center' : 'flex-row'} ${className}`}>
      {/* Icon or Custom Logo */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full">
        {logoUrl ? (
          <img src={logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Energetic Circle */}
            <div className={`absolute inset-0 rounded-full border ${borderColor} opacity-30`}></div>

            {/* The Spark */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-gold-500 relative z-10 drop-shadow-sm"
            >
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </>
        )}
      </div>

      {/* Typography - Hide if custom logo is present and on small layouts to keep it clean, 
          OR keep it as the brand identity of the platform depending on vision. 
          The user said: "Login Page: brand yours. Dashboard: their logo reflects on docs, but sidebar logo could be theirs too."
          Decision: If a custom logo is uploaded, it REPLACES the spark icon but we keep the text appName next to it, 
          OR we can hide the text if the custom logo is enough. 
          Let's keep the text for now as it's the 'Empire name' but the ICON is the unique identifier.
      */}
      <div className={`flex flex-col justify-center ${isVertical ? 'items-center' : ''}`}>
        <h1 className={`font-serif text-2xl font-bold tracking-tight leading-none ${textColor}`}>
          {displayTitle}<span className="text-gold-500">.</span>
        </h1>
        <span className={`text-[8px] uppercase tracking-[0.15em] font-medium leading-none mt-1.5 ${taglineColor}`}>
          {APP_CONFIG.tagline}
        </span>
      </div>
    </div>
  );
};
