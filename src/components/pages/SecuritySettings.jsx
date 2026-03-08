import React, { useState, useEffect } from 'react';
import { disableTOTP } from '../../api/api';
import TotpSetup from '../auth/TotpSetup';
import { useAuth } from '../../context/AuthContext';

const SecuritySettings = () => {
  const { user, login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('PASSWORD');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch TOTP status from cached profile data or API
  useEffect(() => {
    const getTotpStatus = () => {
      try {
        setProfileLoading(true);
        
        // First, try to get cached profile data from localStorage
        const cachedProfile = localStorage.getItem('profileData');
        
        if (cachedProfile) {
          const profileData = JSON.parse(cachedProfile);
          
          // Check if profile has totpEnabled field
          if (profileData && typeof profileData.totpEnabled === 'boolean') {
            const method = profileData.totpEnabled ? 'TOTP' : 'PASSWORD';
            setLoginMethod(method);
            localStorage.setItem('loginMethod', method);
            setProfileLoading(false);
            return;
          }
        }
        
        // Fallback: If no cached profile or no totpEnabled field, use localStorage loginMethod
        const method = localStorage.getItem('loginMethod') || 'PASSWORD';
        setLoginMethod(method);
        
      } catch (err) {
        console.error('Failed to get TOTP status:', err);
        // Fallback to localStorage if parsing fails
        const method = localStorage.getItem('loginMethod') || 'PASSWORD';
        setLoginMethod(method);
      } finally {
        setProfileLoading(false);
      }
    };
    
    getTotpStatus();
  }, [user]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showDisableModal && !loading) {
        setShowDisableModal(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDisableModal, loading]);

  const handleDisableTotp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowDisableModal(false); // Close modal

    try {
      await disableTOTP();
      
      setLoginMethod('PASSWORD');
      
      // Update localStorage
      localStorage.setItem('loginMethod', 'PASSWORD');
      
      // Update cached profile data with new totpEnabled status
      const cachedProfile = localStorage.getItem('profileData');
      if (cachedProfile) {
        const profileData = JSON.parse(cachedProfile);
        profileData.totpEnabled = false;
        localStorage.setItem('profileData', JSON.stringify(profileData));
      }
      
      // Update user context
      const updatedUser = { ...user, loginMethod: 'PASSWORD' };
      login(updatedUser);
      
      setSuccess('Authenticator disabled successfully. You can now login with your password.');
      
    } catch (err) {
      console.error('Disable TOTP error:', err);
      setError(err.response?.data?.message || 'Failed to disable authenticator. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSuccess = async () => {
    setShowSetup(false);
    setLoginMethod('TOTP');
    setSuccess('Authenticator enabled successfully! You must now use your authenticator app to login.');
    
    // Update localStorage
    localStorage.setItem('loginMethod', 'TOTP');
    
    // Update cached profile data with new totpEnabled status
    const cachedProfile = localStorage.getItem('profileData');
    if (cachedProfile) {
      const profileData = JSON.parse(cachedProfile);
      profileData.totpEnabled = true;
      localStorage.setItem('profileData', JSON.stringify(profileData));
    }
    
    // Update user context
    const updatedUser = { ...user, loginMethod: 'TOTP' };
    login(updatedUser);
    
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Loading State */}
        {profileLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block">
                <svg className="animate-spin h-16 w-16 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">Loading security settings...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Modern Header with Pattern */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-4 sm:mb-6 lg:mb-8">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          </div>
          
          <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-0.5 sm:mb-1">Security Center</h1>
                    <p className="text-blue-100 text-xs sm:text-sm lg:text-lg">Protect your account with advanced security features</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Status Badge */}
              <div className="bg-white/10 backdrop-blur-md px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl border border-white/20 shadow-lg">
                <div className="text-white/80 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Security Level</div>
                <div className="flex items-center gap-2">
                  {loginMethod === 'TOTP' ? (
                    <>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-bold text-sm sm:text-base lg:text-lg">Enhanced</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-bold text-sm sm:text-base lg:text-lg">Standard</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages with Modern Design */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-8">
          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg animate-slideDown">
              <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-green-900 font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Success!</h3>
                  <p className="text-green-800 text-sm sm:text-base">{success}</p>
                </div>
                <button 
                  onClick={() => setSuccess('')}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg animate-slideDown">
              <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Error</h3>
                  <p className="text-red-800 text-sm sm:text-base">{error}</p>
                </div>
                <button 
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Login Method - Modern Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6 lg:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 border-b border-gray-100">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Current Authentication Method
            </h2>
          </div>
          
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 flex-wrap">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0">
                {loginMethod === 'TOTP' ? (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Authenticator App</h3>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Two-factor authentication is active. Your account has enhanced protection.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Password Only</h3>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Standard password authentication. Consider enabling 2FA for better security.
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="w-full sm:w-auto">
                {loginMethod === 'TOTP' ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Protected
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Basic
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enable Two-Factor Authentication */}
        {loginMethod !== 'TOTP' && !showSetup && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden xs:inline">Enable Two-Factor Authentication</span>
                <span className="xs:hidden">Enable 2FA</span>
              </h3>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg lg:text-xl mb-1.5 sm:mb-2">Enhance Your Account Security</h4>
                    <p className="text-blue-50 text-sm sm:text-base leading-relaxed">
                      Add an extra layer of protection to your account with two-factor authentication. It only takes a few minutes to set up and significantly improves your security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
                <div className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-md">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Extra Protection Layer</h5>
                  <p className="text-gray-700 text-xs sm:text-sm">Adds security beyond just your password</p>
                </div>

                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Breach Protection</h5>
                  <p className="text-gray-700 text-xs sm:text-sm">Secure even if password is compromised</p>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Popular Apps</h5>
                  <p className="text-gray-700 text-xs sm:text-sm">Works with Google Authenticator & more</p>
                </div>

                <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-md">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Quick Setup</h5>
                  <p className="text-gray-700 text-xs sm:text-sm">Free and ready in just a few minutes</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowSetup(true)}
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="hidden xs:inline">Enable Two-Factor Authentication</span>
                  <span className="xs:hidden">Enable 2FA</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}

        {/* Show TOTP Setup Component */}
        {showSetup && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <TotpSetup 
              onSuccess={handleSetupSuccess}
              onCancel={handleSetupCancel}
            />
          </div>
        )}

        {/* Disable Two-Factor Authentication */}
        {loginMethod === 'TOTP' && !showSetup && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="hidden xs:inline">Disable Two-Factor Authentication</span>
                <span className="xs:hidden">Disable 2FA</span>
              </h3>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1">Protection Active</h4>
                    <p className="text-green-50 text-sm sm:text-base">
                      Your account is currently protected with two-factor authentication
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 shadow-md">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-900 text-sm sm:text-base mb-1.5 sm:mb-2">Security Warning</h4>
                    <p className="text-yellow-800 text-xs sm:text-sm mb-2 sm:mb-3">
                      Disabling two-factor authentication will <strong>significantly reduce</strong> your account security.
                    </p>
                    <ul className="space-y-1 text-xs sm:text-sm text-yellow-800">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>Your account will only be protected by your password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>Higher risk if your password is compromised</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>Less protection against unauthorized access</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Danger Button */}
              <button
                onClick={() => setShowDisableModal(true)}
                disabled={loading}
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm sm:text-base rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Disabling...
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="hidden xs:inline">Disable Two-Factor Authentication</span>
                      <span className="xs:hidden">Disable 2FA</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Modern Disable TOTP Confirmation Modal */}
      {showDisableModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) {
              setShowDisableModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Modal Header with Gradient */}
            <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 sm:px-6 py-4 sm:py-6 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              </div>
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                    <span className="hidden xs:inline">Disable Two-Factor Authentication</span>
                    <span className="xs:hidden">Disable 2FA</span>
                  </h3>
                  <p className="text-red-100 text-xs sm:text-sm">This action will reduce your account security</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 lg:p-6">
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-5 lg:mb-6">
                Are you sure you want to disable two-factor authentication? Your account will be protected only by your password.
              </p>
              
              {/* Security Warning Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 sm:p-5 mb-4 sm:mb-5 lg:mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-900 text-sm sm:text-base mb-1.5 sm:mb-2">⚠️ Security Impact</h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-yellow-900">
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>Your account will revert to password-only authentication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>Significantly higher risk if password is compromised</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>Less protection against unauthorized access attempts</span>
                      </li>
                    </ul>
                    <p className="text-2xs sm:text-xs text-yellow-800 mt-2 sm:mt-3 italic">
                      💡 You can re-enable it anytime from Security Settings
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={() => setShowDisableModal(false)}
                  disabled={loading}
                  className="flex-1 px-5 sm:px-6 py-3 sm:py-3.5 bg-white border-2 border-gray-300 rounded-xl font-bold text-sm sm:text-base text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisableTotp}
                  disabled={loading}
                  className="group relative flex-1 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm sm:text-base rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Disabling...
                      </>
                    ) : (
                      <>
                        <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Yes, Disable
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SecuritySettings;
