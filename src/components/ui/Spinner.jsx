import React from 'react';

/**
 * Spinner Component
 * 
 * A loading spinner component
 * 
 * @param {string} size - sm | md | lg | xl
 * @param {string} color - primary | white | gray
 * @param {string} text - Loading text to display
 * @param {boolean} fullScreen - Center in full screen
 * @param {string} className - Additional custom classes
 */

const Spinner = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = '',
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  // Color styles
  const colorStyles = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  const spinnerStyles = `${sizeStyles[size]} ${colorStyles[color]} rounded-full animate-spin`;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={spinnerStyles} />
      {text && (
        <p className="text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * LoadingDots Component
 * 
 * Alternative loading indicator with animated dots
 */
export const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

/**
 * LoadingSpinner Component (App-wide)
 * 
 * Full-page loading spinner with app branding
 */
export const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-gray-600 font-medium text-lg">Loading...</p>
    </div>
  </div>
);

export default Spinner;
