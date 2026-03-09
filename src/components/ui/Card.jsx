import React from 'react';

/**
 * Card Component
 * 
 * A reusable card container component
 * 
 * @param {string} variant - default | elevated | bordered | gradient
 * @param {string} padding - none | sm | md | lg
 * @param {string} className - Additional custom classes
 * @param {node} children - Card content
 * @param {function} onClick - Click handler (makes card clickable)
 */

const Card = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl transition-all';

  // Variant styles
  const variantStyles = {
    default: 'shadow',
    elevated: 'shadow-lg hover:shadow-xl',
    bordered: 'border border-blue-100',
    gradient: 'bg-gradient-to-br from-white to-blue-50 shadow-md',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Clickable styles
  const clickableStyles = onClick ? 'cursor-pointer hover:scale-[1.02]' : '';

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${clickableStyles} ${className}`;

  return (
    <div
      className={combinedStyles}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 * 
 * Header section for Card
 */
export const CardHeader = ({ className = '', children }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardTitle Component
 * 
 * Title for Card
 */
export const CardTitle = ({ className = '', children }) => {
  return (
    <h3 className={`text-xl font-bold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
};

/**
 * CardBody Component
 * 
 * Body section for Card
 */
export const CardBody = ({ className = '', children }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 * 
 * Footer section for Card
 */
export const CardFooter = ({ className = '', children }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
