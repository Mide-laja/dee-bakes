import React from 'react';

interface LogoProps {
  variant?: 'full' | 'monogram' | 'wordmark' | 'badge';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className = '',
  size = 'md',
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  // Color classes depending on theme mode
  const textPrimary =
    theme === 'dark'
      ? 'fill-[#F6EFE5]'
      : theme === 'light'
      ? 'fill-[#291B17]'
      : 'fill-[#291B17] dark:fill-[#F6EFE5]';

  const textSecondary =
    theme === 'dark'
      ? 'fill-[#D1B18B]'
      : theme === 'light'
      ? 'fill-[#A66D48]'
      : 'fill-[#A66D48] dark:fill-[#D1B18B]';

  const accentFill = '#A66D48';

  if (variant === 'monogram') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="DEE BAKES Monogram"
      >
        {/* Monogram Seal Outer Ring */}
        <circle cx="50" cy="50" r="46" stroke={accentFill} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="50" cy="50" r="42" stroke={accentFill} strokeWidth="1" opacity="0.8" />
        
        {/* DB Interlocking / Stylized Letters */}
        <g className="transition-colors duration-300">
          {/* Letter D */}
          <path
            d="M32 30H46C56 30 63 38 63 50C63 62 56 70 46 70H32V30ZM38 36V64H45C52 64 57 58 57 50C57 42 52 36 45 36H38Z"
            className={textPrimary}
          />
          {/* Letter B overlap accent */}
          <path
            d="M50 30H64C71 30 76 34 76 40C76 45 72 48 67 49C73 50 78 54 78 60C78 66 72 70 64 70H48V64H63C67 64 71 62 71 58C71 54 67 52 62 52H54V46H63C67 46 70 44 70 41C70 37 67 36 63 36H50V30Z"
            fill={accentFill}
          />
          {/* Flourish Star */}
          <path
            d="M50 20L51.5 24.5L56 26L51.5 27.5L50 32L48.5 27.5L44 26L48.5 24.5L50 20Z"
            fill={accentFill}
          />
          <path
            d="M50 68L51.5 72.5L56 74L51.5 75.5L50 80L48.5 75.5L44 74L48.5 72.5L50 68Z"
            fill={accentFill}
          />
        </g>
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span
          className={`font-serif tracking-[0.25em] font-medium uppercase text-2xl md:text-3xl transition-colors duration-300 ${
            theme === 'dark'
              ? 'text-[#F6EFE5]'
              : theme === 'light'
              ? 'text-[#291B17]'
              : 'text-espresso dark:text-ivory'
          }`}
        >
          DEE BAKES
        </span>
        <span
          className={`text-[9px] uppercase tracking-[0.3em] font-sans font-light -mt-0.5 ${
            theme === 'dark'
              ? 'text-[#D1B18B]'
              : theme === 'light'
              ? 'text-[#A66D48]'
              : 'text-caramel dark:text-sand'
          }`}
        >
          Artisan Bakery & Treats
        </span>
      </div>
    );
  }

  // Full Logo with Monogram Icon + Wordmark + Tagline
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* DB Monogram Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto shrink-0`}
        aria-label="DEE BAKES Emblem"
      >
        <circle cx="50" cy="50" r="47" stroke={accentFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
        <circle cx="50" cy="50" r="43" stroke={accentFill} strokeWidth="1" />
        
        {/* D Letter */}
        <path
          d="M32 30H46C56 30 63 38 63 50C63 62 56 70 46 70H32V30ZM38 36V64H45C52 64 57 58 57 50C57 42 52 36 45 36H38Z"
          className={textPrimary}
        />
        {/* B Flourish */}
        <path
          d="M50 30H64C71 30 76 34 76 40C76 45 72 48 67 49C73 50 78 54 78 60C78 66 72 70 64 70H48V64H63C67 64 71 62 71 58C71 54 67 52 62 52H54V46H63C67 46 70 44 70 41C70 37 67 36 63 36H50V30Z"
          fill={accentFill}
        />
        <circle cx="50" cy="18" r="2" fill={accentFill} />
        <circle cx="50" cy="82" r="2" fill={accentFill} />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif tracking-[0.2em] font-bold uppercase leading-none ${
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-xl'
          } ${
            theme === 'dark'
              ? 'text-[#F6EFE5]'
              : theme === 'light'
              ? 'text-[#291B17]'
              : 'text-espresso dark:text-ivory'
          }`}
        >
          DEE BAKES
        </span>
        <span
          className={`tracking-[0.25em] font-sans uppercase font-medium mt-1 leading-tight ${
            size === 'sm' ? 'text-[8px]' : 'text-[9px]'
          } ${
            theme === 'dark'
              ? 'text-[#D1B18B]'
              : theme === 'light'
              ? 'text-[#A66D48]'
              : 'text-caramel dark:text-sand'
          }`}
        >
          Artisan Delights
        </span>
      </div>
    </div>
  );
};

export default Logo;
