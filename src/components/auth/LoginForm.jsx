import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/AuthTypeBubbles.css";
import styles from "../../styles/RegisterForm.module.css";

const LoginForm = () => {
  const { login } = useAuth();
  const [type, setType] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from registration redirect
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      const res = await loginUser(email, password, type);
      if (res.success) {
        login({
          role: res.role,
          userId: res.userId,
          token: res.token
        });
        navigate("/dashboard");
      } else {
        setErr("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            setErr("Invalid email or password. Please try again.");
            break;
          case 403:
            setErr("Account is disabled. Please contact support.");
            break;
          case 404:
            setErr(`${type === 'doctor' ? 'Doctor' : 'Patient'} account not found. Please check your email or register.`);
            break;
          case 422:
            setErr(data.message || "Invalid input. Please check your email format.");
            break;
          case 500:
            setErr("Server error. Please try again later.");
            break;
          default:
            setErr(data.message || "Login failed. Please try again.");
        }
      } else if (error.request) {
        // Network error
        setErr("Network error. Please check your internet connection and try again.");
      } else {
        // Other error
        setErr("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Login</h2>
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            className={`bubble-btn ${type === "patient" ? "selected" : ""} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !loading && setType("patient")}
            disabled={loading}
          >
            Patient
          </button>
          <button
            type="button"
            className={`bubble-btn ${type === "doctor" ? "selected" : ""} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !loading && setType("doctor")}
            disabled={loading}
          >
            Doctor
          </button>
        </div>
        <input
          type="email"
          placeholder="Email"
          className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
            loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
          }`}
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (err) setErr("");
          }}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className={`w-full p-3 mb-3 border rounded focus:border-blue-500 ${
            loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
          }`}
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (err) setErr("");
          }}
          required
          disabled={loading}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors duration-200"
          >
            Forgot Password?
          </button>
        </div>
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 text-sm font-medium">{success}</span>
            </div>
          </div>
        )}
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
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
      <div className="flex items-center justify-center mt-6 ">
        <span className="text-gray-700 mr-2">Don't have an account?</span>
        <button
          type="button"
          className="text-blue-600 font-semibold hover:underline focus:outline-none"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </>
  );
};

export default LoginForm;