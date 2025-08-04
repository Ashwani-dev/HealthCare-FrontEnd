import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/api";
import { useNavigate } from "react-router-dom";

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (err) setErr("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      const res = await registerUser(form, "patient");
      if (res.success) {
        login(res.user);
        navigate("/dashboard");
      } else {
        setErr("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            setErr(data.message || "Invalid input. Please check your information.");
            break;
          case 409:
            setErr("Email or username already exists. Please use different credentials.");
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
      <div className="text-2xl font-bold text-blue-600 mb-6 text-center">Patient Registration</div>
      
      <input 
        name="username" 
        placeholder="Username" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="password" 
        type="password" 
        placeholder="Password" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="email" 
        type="email" 
        placeholder="Email" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="full_name" 
        placeholder="Full Name" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="contact_number" 
        placeholder="Contact Number" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      <input 
        name="address" 
        placeholder="Address" 
        className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
          loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`} 
        onChange={handleChange} 
        required 
        disabled={loading}
      />
      
      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 text-sm font-medium">{err}</span>
          </div>
        </div>
      )}
      
      <button 
        type="submit" 
        className={`w-full font-semibold py-3 rounded transition ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </div>
        ) : (
          'Register'
        )}
      </button>
    </form>
  );
};

export default PatientRegisterForm; 