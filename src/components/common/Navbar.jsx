import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, fetchDoctorProfile } from "../../api/api";
import Logo from "./Logo";

const getInitials = (user, profile) => {
  if (!user) return "";
  if (profile?.full_name) {
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
  }
  if (user.full_name) {
    return user.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
  }
  if (user.name) {
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase();
  }
  if (user.firstName && user.lastName) {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
  return "U";
};

const getUserDisplayName = (user, profile) => {
  if (profile?.full_name) return profile.full_name;
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return "User";
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const avatarRef = useRef();
  const mobileMenuRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          let profileData;
          if (user.role?.toLowerCase() === "doctor") {
            profileData = await fetchDoctorProfile();
          } else {
            profileData = await fetchPatientProfile();
          }
          setUserProfile(profileData);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchProfile();
  }, [user, user?.role, user?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('[data-mobile-menu-button]')) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gradient-to-r from-blue-600/95 to-blue-700/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="Go to Home" onClick={() => setMenuOpen(false)}>
              <Logo size="medium" variant="white" />
              <span className="text-white font-bold text-xl group-hover:text-blue-100 transition-colors duration-200">
                TheraConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Home
                </Link>
                <Link to="/about" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  About
                </Link>
                <Link to="/contact" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Contact Us
                </Link>
              </div>

              {/* Desktop Auth */}
              {!user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Login
                  </Link>
                  <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative ml-4" ref={avatarRef}>
                  <button
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    aria-label="Open user menu"
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(user, userProfile)}</span>
                    )}
                  </button>

                  {avatarOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{loading ? "Loading..." : getUserDisplayName(user, userProfile)}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role || 'User'}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150" onClick={() => setAvatarOpen(false)}>
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          My Dashboard
                        </Link>
                        {user.role?.toLowerCase() === "patient" && (
                          <Link to="/payments" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150" onClick={() => setAvatarOpen(false)}>
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payments
                          </Link>
                        )}
                        {user.role?.toLowerCase() === "doctor" && (
                          <Link to="/availability" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150" onClick={() => setAvatarOpen(false)}>
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Manage Availability
                          </Link>
                        )}
                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150" onClick={() => setAvatarOpen(false)}>
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button onClick={() => { setAvatarOpen(false); handleLogout(); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              data-mobile-menu-button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Mobile Menu - Full Screen Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu Panel - Slide from right */}
          <div
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideInRight"
            style={{
              animation: menuOpen ? 'slideInRight 0.3s ease-out' : 'none'
            }}
          >
            {/* Mobile Menu Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white z-10 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {user && (
                <div className="flex items-center gap-3 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(user, userProfile)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{loading ? "Loading..." : getUserDisplayName(user, userProfile)}</p>
                    <p className="text-sm text-blue-100 capitalize truncate">{user.role || 'User'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="p-4 space-y-1">
              {/* Navigation Section */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Navigation</p>
                <Link
                  to="/"
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    location.pathname === "/" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    location.pathname === "/about" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    location.pathname === "/contact" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Us
                </Link>
              </div>

              {/* Auth/Account Section */}
              {!user ? (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-4 py-3.5 rounded-xl text-base font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 mb-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-4 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </Link>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Account</p>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      location.pathname === "/dashboard" 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    My Dashboard
                  </Link>
                  {user.role?.toLowerCase() === "patient" && (
                    <Link
                      to="/payments"
                      className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        location.pathname === "/payments" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payments
                    </Link>
                  )}
                  {user.role?.toLowerCase() === "doctor" && (
                    <Link
                      to="/availability"
                      className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        location.pathname === "/availability" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Manage Availability
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      location.pathname === "/profile" 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  
                  {/* Logout Button */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Safe Area for iOS */}
            <div className="h-20 md:h-0" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;