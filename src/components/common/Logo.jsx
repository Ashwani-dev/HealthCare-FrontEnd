import React from 'react';

const Logo = ({ 
  size = 'medium', 
  variant = 'default', 
  className = '',
  showText = false,
  text = 'HealthCare App'
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const variants = {
    default: {
      heartGradient: 'url(#heartGradient)',
      strokeColor: '#2563EB',
      connectionColor: '#2563EB',
      dotColor: '#059669'
    },
    white: {
      heartGradient: 'url(#heartGradientWhite)',
      strokeColor: '#FFFFFF',
      connectionColor: '#FFFFFF',
      dotColor: '#FFFFFF'
    },
    monochrome: {
      heartGradient: 'url(#heartGradientMono)',
      strokeColor: '#6B7280',
      connectionColor: '#6B7280',
      dotColor: '#9CA3AF'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle for better visibility */}
        <circle cx="60" cy="60" r="58" fill={variant === 'white' ? 'transparent' : 'white'} stroke={variant === 'white' ? '#FFFFFF' : '#E5E7EB'} strokeWidth="2"/>
        
        {/* Connection lines radiating outward */}
        <g stroke={currentVariant.connectionColor} strokeWidth="2" opacity={variant === 'white' ? '0.8' : '0.6'}>
          {/* Top connection lines */}
          <line x1="60" y1="20" x2="60" y2="35" strokeLinecap="round"/>
          <line x1="45" y1="25" x2="55" y2="35" strokeLinecap="round"/>
          <line x1="75" y1="25" x2="65" y2="35" strokeLinecap="round"/>
          
          {/* Bottom connection lines */}
          <line x1="60" y1="85" x2="60" y2="100" strokeLinecap="round"/>
          <line x1="45" y1="95" x2="55" y2="85" strokeLinecap="round"/>
          <line x1="75" y1="95" x2="65" y2="85" strokeLinecap="round"/>
          
          {/* Left connection lines */}
          <line x1="20" y1="60" x2="35" y2="60" strokeLinecap="round"/>
          <line x1="25" y1="45" x2="35" y2="55" strokeLinecap="round"/>
          <line x1="25" y1="75" x2="35" y2="65" strokeLinecap="round"/>
          
          {/* Right connection lines */}
          <line x1="85" y1="60" x2="100" y2="60" strokeLinecap="round"/>
          <line x1="95" y1="45" x2="85" y2="55" strokeLinecap="round"/>
          <line x1="95" y1="75" x2="85" y2="65" strokeLinecap="round"/>
          
          {/* Diagonal connection lines */}
          <line x1="30" y1="30" x2="40" y2="40" strokeLinecap="round"/>
          <line x1="90" y1="30" x2="80" y2="40" strokeLinecap="round"/>
          <line x1="30" y1="90" x2="40" y2="80" strokeLinecap="round"/>
          <line x1="90" y1="90" x2="80" y2="80" strokeLinecap="round"/>
        </g>
        
        {/* Connection dots */}
        <g fill={currentVariant.connectionColor} opacity={variant === 'white' ? '1' : '0.8'}>
          <circle cx="60" cy="20" r="2"/>
          <circle cx="60" cy="100" r="2"/>
          <circle cx="20" cy="60" r="2"/>
          <circle cx="100" cy="60" r="2"/>
          <circle cx="30" cy="30" r="2"/>
          <circle cx="90" cy="30" r="2"/>
          <circle cx="30" cy="90" r="2"/>
          <circle cx="90" cy="90" r="2"/>
        </g>
        
        {/* Main heart shape */}
        <path 
          d="M60 45C60 45 50 35 40 35C30 35 25 45 25 55C25 65 35 75 60 85C85 75 95 65 95 55C95 45 90 35 80 35C70 35 60 45 60 45Z" 
          fill={currentVariant.heartGradient} 
          stroke={currentVariant.strokeColor} 
          strokeWidth="2"
        />
        
        {/* Inner heart highlight */}
        <path 
          d="M60 50C60 50 52 42 44 42C38 42 34 48 34 54C34 60 40 66 60 72C80 66 86 60 86 54C86 48 82 42 76 42C68 42 60 50 60 50Z" 
          fill={variant === 'white' ? 'url(#highlightGradientWhite)' : 'url(#highlightGradient)'} 
          opacity={variant === 'white' ? '0.2' : '0.3'}
        />
        
        {/* Small connection dots around heart */}
        <g fill={currentVariant.dotColor} opacity={variant === 'white' ? '0.9' : '0.7'}>
          <circle cx="45" cy="40" r="1.5"/>
          <circle cx="75" cy="40" r="1.5"/>
          <circle cx="50" cy="70" r="1.5"/>
          <circle cx="70" cy="70" r="1.5"/>
          <circle cx="60" cy="35" r="1.5"/>
          <circle cx="60" cy="75" r="1.5"/>
        </g>
        
        {/* Gradients */}
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#2563EB', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="heartGradientWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#E5E7EB', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="heartGradientMono" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#6B7280', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#9CA3AF', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#DBEAFE', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="highlightGradientWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#F3F4F6', stopOpacity: 1}} />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className={`font-bold text-blue-700 ${textSizes[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Logo; 