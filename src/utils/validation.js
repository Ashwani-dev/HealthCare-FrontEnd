/**
 * Validation utility functions for form inputs
 */

// Validation rules
export const validateUsername = (value) => {
  const errors = [];
  if (!value) {
    errors.push('Username is required');
  } else {
    if (value.length < 3) errors.push('Username must be at least 3 characters');
    if (value.length > 20) errors.push('Username must not exceed 20 characters');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFullName = (value) => {
  const errors = [];
  if (!value) {
    errors.push('Full name is required');
  } else {
    if (value.length < 3) errors.push('Full name must be at least 3 characters');
    if (value.length > 20) errors.push('Full name must not exceed 20 characters');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (value) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!value) {
    errors.push('Email is required');
  } else if (!emailRegex.test(value)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (value) => {
  const errors = [];
  if (!value) {
    errors.push('Password is required');
  } else if (value.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateContactNumber = (value) => {
  const errors = [];
  const phoneRegex = /^[0-9]{10,15}$/;
  
  if (!value) {
    errors.push('Contact number is required');
  } else if (!phoneRegex.test(value)) {
    if (!/^[0-9]+$/.test(value)) {
      errors.push('Contact number must contain only digits');
    } else if (value.length < 10) {
      errors.push('Contact number must be at least 10 digits');
    } else if (value.length > 15) {
      errors.push('Contact number must not exceed 15 digits');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAddress = (value) => {
  const errors = [];
  if (!value) {
    errors.push('Address is required');
  } else if (value.trim().length < 5) {
    errors.push('Please provide a complete address');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMedicalExperience = (value) => {
  const errors = [];
  const numValue = parseInt(value, 10);
  
  if (!value && value !== 0) {
    errors.push('Medical experience is required');
  } else if (isNaN(numValue)) {
    errors.push('Medical experience must be a number');
  } else if (numValue < 0) {
    errors.push('Medical experience cannot be negative');
  } else if (numValue > 70) {
    errors.push('Medical experience seems unusually high');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSpecialization = (value) => {
  const errors = [];
  if (!value) {
    errors.push('Area of specialization is required');
  } else if (value.trim().length < 2) {
    errors.push('Specialization must be at least 2 characters');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateGender = (value) => {
  const errors = [];
  const validGenders = ['MALE', 'FEMALE', 'OTHER'];
  
  if (!value) {
    errors.push('Gender is required');
  } else if (!validGenders.includes(value.toUpperCase())) {
    errors.push('Please select a valid gender');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLicenseNumber = (value) => {
  const errors = [];
  const licenseRegex = /^[A-Za-z0-9\-]+$/;
  
  if (!value) {
    errors.push('License number is required');
  } else {
    if (value.length < 5) errors.push('License number must be at least 5 characters');
    if (value.length > 50) errors.push('License number must not exceed 50 characters');
    if (!licenseRegex.test(value)) {
      errors.push('License number must be alphanumeric with optional hyphens');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Constraint messages for each field (shown on focus)
export const FIELD_CONSTRAINTS = {
  username: [
    'Must be between 3 and 20 characters',
    'Required field'
  ],
  full_name: [
    'Must be between 3 and 20 characters',
    'Required field'
  ],
  email: [
    'Must be a valid email format (e.g., user@example.com)',
    'Required field'
  ],
  password: [
    'Must be at least 6 characters long',
    'Required field'
  ],
  contact_number: [
    'Must be between 10 and 15 digits',
    'Only numeric characters allowed',
    'Required field'
  ],
  address: [
    'Provide your complete address',
    'Required field'
  ],
  medical_experience: [
    'Enter your years of medical experience',
    'Must be a positive number',
    'Required field'
  ],
  specialization: [
    'Enter your area of medical specialization',
    'Required field'
  ],
  gender: [
    'Select your gender (Male, Female, or Other)',
    'Required field'
  ],
  license_number: [
    'Must be between 5 and 50 characters',
    'Alphanumeric with optional hyphens only',
    'Must be unique',
    'Required field'
  ]
};

// Validate entire patient form
export const validatePatientForm = (formData) => {
  const validations = {
    username: validateUsername(formData.username),
    full_name: validateFullName(formData.full_name),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    contact_number: validateContactNumber(formData.contact_number),
    address: validateAddress(formData.address)
  };
  
  const isValid = Object.values(validations).every(v => v.isValid);
  const errors = Object.entries(validations)
    .filter(([_, v]) => !v.isValid)
    .reduce((acc, [key, v]) => ({ ...acc, [key]: v.errors }), {});
  
  return { isValid, errors, validations };
};

// Validate entire doctor form
export const validateDoctorForm = (formData) => {
  const validations = {
    username: validateUsername(formData.username),
    full_name: validateFullName(formData.full_name),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    contact_number: validateContactNumber(formData.contact_number),
    medical_experience: validateMedicalExperience(formData.medical_experience),
    specialization: validateSpecialization(formData.specialization),
    gender: validateGender(formData.gender),
    license_number: validateLicenseNumber(formData.license_number)
  };
  
  const isValid = Object.values(validations).every(v => v.isValid);
  const errors = Object.entries(validations)
    .filter(([_, v]) => !v.isValid)
    .reduce((acc, [key, v]) => ({ ...acc, [key]: v.errors }), {});
  
  return { isValid, errors, validations };
};
