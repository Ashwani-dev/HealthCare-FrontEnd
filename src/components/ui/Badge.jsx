import React from 'react';

/**
 * Badge Component
 * 
 * A small label component for status indicators
 * 
 * @param {string} variant - primary | secondary | success | danger | warning | info
 * @param {string} size - sm | md | lg
 * @param {boolean} dot - Show dot indicator
 * @param {string} className - Additional custom classes
 * @param {node} children - Badge content
 */

const Badge = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  children,
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={combinedStyles}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-1.5 ${variantStyles[variant].split(' ')[1].replace('text', 'bg')}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
