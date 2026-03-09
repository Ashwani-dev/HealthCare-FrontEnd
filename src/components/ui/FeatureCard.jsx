import React from 'react';

/**
 * Reusable FeatureCard component for displaying feature highlights
 * Used in HomePage and AboutPage
 * 
 * @param {React.ReactNode} icon - SVG icon element to display
 * @param {string} title - Card title/heading
 * @param {string} description - Card description text
 * @param {string} bgColor - Tailwind background color class (e.g., 'bg-blue-50')
 * @param {string} titleColor - Tailwind text color class for title (e.g., 'text-blue-700')
 * @param {string} rounded - Tailwind border radius class (e.g., 'rounded-lg', 'rounded-xl')
 * @param {string} textSize - Optional text size for description (default: 'text-sm')
 */
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  bgColor = 'bg-blue-50', 
  titleColor = 'text-blue-700', 
  rounded = 'rounded-lg',
  textSize = 'text-sm'
}) => {
  return (
    <div className={`flex flex-col items-center text-center p-6 ${bgColor} ${rounded} shadow-sm`}>
      {icon}
      <h3 className={`font-semibold ${titleColor} mt-2 mb-1`}>{title}</h3>
      <p className={`text-gray-600 ${textSize}`}>{description}</p>
    </div>
  );
};

export default FeatureCard;
