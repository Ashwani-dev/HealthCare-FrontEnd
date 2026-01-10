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
  validateAddress,
  FIELD_CONSTRAINTS,
  validatePatientForm
} from "../../utils/validation";

const PatientRegisterForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    contact_number: "",
    address: ""
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
      case 'address':
        validation = validateAddress(value);
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
    const validation = validatePatientForm(form);
    
    if (!validation.isValid) {
      setErr("Please fix all validation errors before submitting");
      setFieldValidation(validation.validations);
      setTouched({
        username: true,
        full_name: true,
        email: true,
        password: true,
        contact_number: true,
        address: true
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
      const res = await registerUser(form, "patient");
      
      let token = null;
      let userData = null;
      
      if (typeof res === 'string' && res.startsWith('eyJ')) {
        token = res;
        const decoded = decodeJWT(token);
        if (decoded) {
          userData = {
            role: decoded.role || "PATIENT",
            userId: decoded.sub || decoded.userId || decoded.id,
            username: decoded.username || form.username,
            token: token
          };
        }
      } else if (res && typeof res === 'object') {
        token = res.token || res;
        if (res.success || token || (res.userId && res.role)) {
          userData = {
            role: res.role || "PATIENT",
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
            role: decoded.role || "PATIENT",
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
            } else if (data.message?.includes("contact")) {
              setErr("Contact number already exists. Please use a different number.");
            } else {
              setErr("Email or username already exists. Please use different credentials.");
            }
            break;
          case 422:
            setErr(data.message || "Invalid input format. Please check your email and phone number.");
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Patient Registration</h1>
                <p className="text-blue-100 text-sm md:text-base">Create your account to access healthcare services</p>
              </div>
              <div className="hidden sm:block">
                <svg className="w-16 h-16 text-white opacity-20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2m0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8m0 2a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6m0 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
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
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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

              {/* Address */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Address
                  <span className="text-red-500">*</span>
                  <span className="ml-auto">
                    <ValidationIcon fieldName="address" />
                  </span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onFocus={() => handleFocus('address')}
                  onBlur={() => handleBlur('address')}
                  required
                  rows="3"
                  placeholder="Enter your complete address"
                  className={`${getInputClassName('address')} resize-none`}
                  disabled={loading}
                ></textarea>
                <ValidationHint 
                  show={focusedField === 'address'}
                  fieldName="address"
                  constraints={FIELD_CONSTRAINTS.address}
                />
                <ValidationErrors 
                  show={touched.address}
                  errors={fieldValidation.address?.errors}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                    Create Account
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
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors duration-200"
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Secure</p>
                <p className="text-xs text-gray-500">Your data is safe</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Expert Care</p>
                <p className="text-xs text-gray-500">Professional doctors</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">24/7 Support</p>
                <p className="text-xs text-gray-500">Always available</p>
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

export default PatientRegisterForm;