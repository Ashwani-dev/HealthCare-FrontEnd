import React from 'react';

/**
 * Input Component
 * 
 * A reusable input component with label, error handling, and different types
 * 
 * @param {string} type - text | email | password | number | tel | date
 * @param {string} label - Label text
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Makes input required
 * @param {boolean} disabled - Disables input
 * @param {string} error - Error message to display
 * @param {string} className - Additional custom classes
 * @param {string} autoComplete - Autocomplete attribute
 */

const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  autoComplete,
  ...props
}) => {
  const inputBaseStyles = 'w-full border-2 rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2';
  const inputNormalStyles = 'border-blue-200 focus:ring-blue-400 focus:border-transparent';
  const inputErrorStyles = 'border-red-300 focus:ring-red-400 focus:border-transparent';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const inputStyles = `${inputBaseStyles} ${error ? inputErrorStyles : inputNormalStyles} ${disabledStyles} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputStyles}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * TextArea Component
 */
export const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const textareaBaseStyles = 'w-full border-2 rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2';
  const textareaNormalStyles = 'border-blue-200 focus:ring-blue-400 focus:border-transparent';
  const textareaErrorStyles = 'border-red-300 focus:ring-red-400 focus:border-transparent';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const textareaStyles = `${textareaBaseStyles} ${error ? textareaErrorStyles : textareaNormalStyles} ${disabledStyles} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={textareaStyles}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Select Component
 */
export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const selectBaseStyles = 'w-full border-2 rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2';
  const selectNormalStyles = 'border-blue-200 focus:ring-blue-400 focus:border-transparent';
  const selectErrorStyles = 'border-red-300 focus:ring-red-400 focus:border-transparent';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const selectStyles = `${selectBaseStyles} ${error ? selectErrorStyles : selectNormalStyles} ${disabledStyles} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectStyles}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
