import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  validateUsername,
  validateFullName,
  validateEmail,
  validatePassword,
  validateContactNumber,
  validateMedicalExperience,
  validateSpecialization,
  validateGender,
  validateLicenseNumber,
  FIELD_CONSTRAINTS,
  validateDoctorForm
} from "../../utils/validation";

const DoctorRegisterForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    contact_number: "",
    medical_experience: "",
    specialization: "",
    gender: "",
    license_number: ""
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [fieldValidation, setFieldValidation] = useState({});
  const [touched, setTouched] = useState({});
  const [constraintsShownOnce, setConstraintsShownOnce] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (err) setErr("");

    // Real-time validation only if field was touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, errors: [] };

    switch (fieldName) {
      case 'username':
        validation = validateUsername(value);
        break;
      case 'full_name':
        validation = validateFullName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'contact_number':
        validation = validateContactNumber(value);
        break;
      case 'medical_experience':
        validation = validateMedicalExperience(value);
        break;
      case 'specialization':
        validation = validateSpecialization(value);
        break;
      case 'gender':
        validation = validateGender(value);
        break;
      case 'license_number':
        validation = validateLicenseNumber(value);
        break;
      default:
        break;
    }

    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: validation
    }));

    return validation.isValid;
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
    // Mark this field's constraints as shown
    if (!constraintsShownOnce[fieldName]) {
      setConstraintsShownOnce(prev => ({ ...prev, [fieldName]: true }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, form[fieldName]);
    setFocusedField(null);
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate all fields
    const validation = validateDoctorForm(form);
    
    if (!validation.isValid) {
      setErr("Please fix all validation errors before submitting");
      setFieldValidation(validation.validations);
      setTouched({
        username: true,
        full_name: true,
        email: true,
        password: true,
        contact_number: true,
        medical_experience: true,
        specialization: true,
        gender: true,
        license_number: true
      });
      // Show constraints for ALL fields that have errors on submit
      const newConstraintsShown = {};
      Object.keys(validation.validations).forEach(key => {
        if (!validation.validations[key].isValid) {
          newConstraintsShown[key] = true;
        }
      });
      setConstraintsShownOnce(prev => ({ ...prev, ...newConstraintsShown }));
      return;
    }

    setLoading(true);
    setErr("");
    
    try {
      const res = await registerUser(form, "doctor");
      
      let token = null;
      let userData = null;
      
      if (typeof res === 'string' && res.startsWith('eyJ')) {
        token = res;
        const decoded = decodeJWT(token);
        if (decoded) {
          userData = {
            role: decoded.role || "DOCTOR",
            userId: decoded.sub || decoded.userId || decoded.id,
            username: decoded.username || form.username,
            token: token
          };
        }
      } else if (res && typeof res === 'object') {
        token = res.token || res;
        if (res.success || token || (res.userId && res.role)) {
          userData = {
            role: res.role || "DOCTOR",
            userId: res.userId || res.id || res.user?.id,
            username: res.username || res.user?.username || form.username,
            token: token,
            ...(res.user || {})
          };
        }
      }
      
      if (token && userData) {
        login(userData);
        navigate("/dashboard");
      } else if (token) {
        const decoded = decodeJWT(token);
        if (decoded) {
          login({
            role: decoded.role || "DOCTOR",
            userId: decoded.sub || decoded.userId || decoded.id,
            username: decoded.username || form.username,
            token: token
          });
          navigate("/dashboard");
        } else {
          navigate("/login", { 
            state: { message: "Registration successful! Please login with your credentials." } 
          });
        }
      } else if (res && typeof res === 'object' && res.message && res.message.toLowerCase().includes("success")) {
        navigate("/login", { 
          state: { message: "Registration successful! Please login with your credentials." } 
        });
      } else {
        setErr(res?.message || "Registration completed, but unable to auto-login. Please try logging in.");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 200 || status === 201) {
          navigate("/login", { 
            state: { message: "Registration successful! Please login with your credentials." } 
          });
          return;
        }
        
        switch (status) {
          case 400:
            setErr(data.message || "Invalid input. Please check your information.");
            break;
          case 409:
            if (data.message?.includes("username")) {
              setErr("Username already exists. Please choose a different username.");
            } else if (data.message?.includes("email")) {
              setErr("Email already exists. Please use a different email address.");
            } else if (data.message?.includes("license")) {
              setErr("License number already exists. Please check your license number.");
            } else if (data.message?.includes("contact")) {
              setErr("Contact number already exists. Please use a different number.");
            } else {
              setErr("Email, username, or license number already exists. Please use different credentials.");
            }
            break;
          case 422:
            setErr(data.message || "Invalid input format. Please check your information.");
            break;
          case 500:
            setErr("Server error. Please try again later.");
            break;
          default:
            setErr(data.message || "Registration failed. Please try again.");
        }
      } else if (error.request) {
        setErr("Network error. Please check your internet connection and try again.");
      } else {
        setErr("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const ValidationHint = ({ constraints, show, fieldName }) => {
    // Only show if:
    // 1. Field is currently focused AND hasn't been shown before, OR
    // 2. Field has validation errors after being touched
    const shouldShow = (show && !constraintsShownOnce[fieldName]) || 
                       (touched[fieldName] && fieldValidation[fieldName] && !fieldValidation[fieldName].isValid && constraintsShownOnce[fieldName]);
    
    if (!shouldShow) return null;
    
    return (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="space-y-1 text-xs text-blue-800">
            {constraints.map((constraint, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{constraint}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ValidationErrors = ({ errors, show }) => {
    if (!show || !errors || errors.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {errors.map((error, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-red-600">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full border rounded-lg px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400";
    
    if (touched[fieldName] && fieldValidation[fieldName]) {
      if (fieldValidation[fieldName].isValid) {
        return `${baseClass} border-green-300 focus:ring-green-500 focus:border-transparent`;
      } else {
        return `${baseClass} border-red-300 focus:ring-red-500 focus:border-transparent`;
      }
    }
    
    return `${baseClass} border-gray-300 focus:ring-blue-500 focus:border-transparent`;
  };

  const ValidationIcon = ({ fieldName }) => {
    if (!touched[fieldName] || !fieldValidation[fieldName]) return null;
    
    if (fieldValidation[fieldName].isValid) {
      return (
        <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Card Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Doctor Registration</h1>
                <p className="text-green-100 text-sm md:text-base">Join our network of healthcare professionals</p>
              </div>
              <div className="hidden sm:block">
                <svg className="w-16 h-16 text-white opacity-20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mx-6 sm:mx-8 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm animate-shake">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium text-sm">{err}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6">
            <div className="space-y-5">
              {/* Username */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Username
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="username" />
                  </span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => handleFocus('username')}
                  onBlur={() => handleBlur('username')}
                  required
                  minLength={3}
                  maxLength={20}
                  placeholder="Enter your username"
                  className={getInputClassName('username')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'username'}
                  fieldName="username"
                  constraints={FIELD_CONSTRAINTS.username}
                />
                <ValidationErrors 
                  show={touched.username}
                  errors={fieldValidation.username?.errors}
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Full Name
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="full_name" />
                  </span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('full_name')}
                  onBlur={() => handleBlur('full_name')}
                  required
                  minLength={3}
                  maxLength={20}
                  placeholder="Enter your full name"
                  className={getInputClassName('full_name')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'full_name'}
                  fieldName="full_name"
                  constraints={FIELD_CONSTRAINTS.full_name}
                />
                <ValidationErrors 
                  show={touched.full_name}
                  errors={fieldValidation.full_name?.errors}
                />
              </div>

              {/* Email */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email Address
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="email" />
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  required
                  placeholder="your.email@example.com"
                  className={getInputClassName('email')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'email'}
                  fieldName="email"
                  constraints={FIELD_CONSTRAINTS.email}
                />
                <ValidationErrors 
                  show={touched.email}
                  errors={fieldValidation.email?.errors}
                />
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Password
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="password" />
                  </span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  required
                  minLength={6}
                  placeholder="Enter a strong password"
                  className={getInputClassName('password')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'password'}
                  fieldName="password"
                  constraints={FIELD_CONSTRAINTS.password}
                />
                <ValidationErrors 
                  show={touched.password}
                  errors={fieldValidation.password?.errors}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Contact Number
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="contact_number" />
                  </span>
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  onFocus={() => handleFocus('contact_number')}
                  onBlur={() => handleBlur('contact_number')}
                  required
                  pattern="^[0-9]{10,15}$"
                  placeholder="Enter your phone number"
                  className={getInputClassName('contact_number')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'contact_number'}
                  fieldName="contact_number"
                  constraints={FIELD_CONSTRAINTS.contact_number}
                />
                <ValidationErrors 
                  show={touched.contact_number}
                  errors={fieldValidation.contact_number?.errors}
                />
              </div>

              {/* Medical Experience */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Medical Experience (years)
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="medical_experience" />
                  </span>
                </label>
                <input
                  type="number"
                  name="medical_experience"
                  value={form.medical_experience}
                  onChange={handleChange}
                  onFocus={() => handleFocus('medical_experience')}
                  onBlur={() => handleBlur('medical_experience')}
                  required
                  min="0"
                  placeholder="Enter years of experience"
                  className={getInputClassName('medical_experience')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'medical_experience'}
                  fieldName="medical_experience"
                  constraints={FIELD_CONSTRAINTS.medical_experience}
                />
                <ValidationErrors 
                  show={touched.medical_experience}
                  errors={fieldValidation.medical_experience?.errors}
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Specialization
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="specialization" />
                  </span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  onFocus={() => handleFocus('specialization')}
                  onBlur={() => handleBlur('specialization')}
                  required
                  placeholder="e.g., Cardiology, Psychiatry"
                  className={getInputClassName('specialization')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'specialization'}
                  fieldName="specialization"
                  constraints={FIELD_CONSTRAINTS.specialization}
                />
                <ValidationErrors 
                  show={touched.specialization}
                  errors={fieldValidation.specialization?.errors}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Gender
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="gender" />
                  </span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onFocus={() => handleFocus('gender')}
                  onBlur={() => handleBlur('gender')}
                  required
                  className={getInputClassName('gender')}
                  disabled={loading}
                >
                  <option value="">Select your gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <ValidationHint 
                  show={focusedField === 'gender'}
                  fieldName="gender"
                  constraints={FIELD_CONSTRAINTS.gender}
                />
                <ValidationErrors 
                  show={touched.gender}
                  errors={fieldValidation.gender?.errors}
                />
              </div>

              {/* License Number */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Medical License Number
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="license_number" />
                  </span>
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={form.license_number}
                  onChange={handleChange}
                  onFocus={() => handleFocus('license_number')}
                  onBlur={() => handleBlur('license_number')}
                  required
                  minLength={5}
                  maxLength={50}
                  placeholder="Enter your medical license number"
                  className={getInputClassName('license_number')}
                  disabled={loading}
                />
                <ValidationHint 
                  show={focusedField === 'license_number'}
                  fieldName="license_number"
                  constraints={FIELD_CONSTRAINTS.license_number}
                />
                <ValidationErrors 
                  show={touched.license_number}
                  errors={fieldValidation.license_number?.errors}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-lg text-base font-semibold shadow-lg hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Register as Doctor
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors duration-200"
                  disabled={loading}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Verified</p>
                <p className="text-xs text-gray-500">License validation</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Network</p>
                <p className="text-xs text-gray-500">Join thousands</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Quick Start</p>
                <p className="text-xs text-gray-500">Instant approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorRegisterForm;