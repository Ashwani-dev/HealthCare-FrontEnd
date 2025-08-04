import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, fetchDoctorProfile } from "../../api/api";
import Logo from "./Logo";

const getInitials = (user, profile) => {
  if (!user) return "";

  // Use profile data if available
  if (profile?.full_name) {
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
  }

  // Fallback to user data
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
  if (profile?.full_name) {
    return profile.full_name;
  }
  if (user.full_name) {
    return user.full_name;
  }
  if (user.name) {
    return user.name;
  }
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
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
  const avatarRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch user profile when user is logged in or role changes
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
          // Clear profile on error to prevent stale data
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        // Clear profile when user logs out
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [user, user?.role, user?.id]); // Added user.role and user.id as dependencies

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
    }
    if (avatarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarOpen]);

  return (
    <nav className="relative bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always consistent */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Go to Home">
            <Logo size="medium" variant="white" />
            <span className="text-white font-bold text-xl group-hover:text-blue-100 transition-colors duration-200">
              TheraConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>

            {/* Auth Section */}
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative ml-4" ref={avatarRef}>
                <button
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  onClick={() => setAvatarOpen((open) => !open)}
                  aria-label="Open user menu"
                  aria-haspopup="true"
                  aria-expanded={avatarOpen}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{getInitials(user, userProfile)}</span>
                  )}
                </button>

                {/* Avatar Dropdown Menu */}
                {avatarOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 animate-fadeIn border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {loading ? "Loading..." : getUserDisplayName(user, userProfile)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role || 'User'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                        onClick={() => setAvatarOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        My Dashboard
                      </Link>
                      {user.role?.toLowerCase() === "doctor" && (
                        <Link
                          to="/availability"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          onClick={() => setAvatarOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Manage Availability
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                        onClick={() => setAvatarOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => { setAvatarOpen(false); handleLogout(); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        aria-label="Logout"
                      >
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
          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-br from-blue-600 to-blue-700 min-h-screen">
          {/* Mobile Menu Content */}
          <div className="px-4 py-6 space-y-2">
            {/* Main Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/"
                    ? "bg-white/20 text-white border-l-4 border-white"
                    : "text-white hover:text-blue-100 hover:bg-white/10"
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
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/about"
                    ? "bg-white/20 text-white border-l-4 border-white"
                    : "text-white hover:text-blue-100 hover:bg-white/10"
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </Link>
              <Link
                to="/contact"
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/contact"
                    ? "bg-white/20 text-white border-l-4 border-white"
                    : "text-white hover:text-blue-100 hover:bg-white/10"
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Us
              </Link>
            </div>

            {/* Auth Section */}
            {!user ? (
              <div className="pt-6 pb-4 border-t border-blue-500/30">
                <Link
                  to="/login"
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-white hover:text-blue-100 hover:bg-white/10 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center mt-3 px-4 py-3 rounded-lg text-base font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
              </div>
            ) : (
              <div className="pt-6 pb-4 border-t border-blue-500/30">
                {/* User Profile Section */}
                <div className="flex items-center px-4 py-4 mb-4 bg-white/10 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(user, userProfile)}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-white">
                      {loading ? "Loading..." : getUserDisplayName(user, userProfile)}
                    </p>
                    <p className="text-sm text-blue-100 capitalize">
                      {user.role || 'User'}
                    </p>
                  </div>
                </div>

                {/* User Menu Items */}
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/dashboard"
                        ? "bg-white/20 text-white border-l-4 border-white"
                        : "text-white hover:text-blue-100 hover:bg-white/10"
                      }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    My Dashboard
                  </Link>
                  {user.role?.toLowerCase() === "doctor" && (
                    <Link
                      to="/availability"
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/availability"
                          ? "bg-white/20 text-white border-l-4 border-white"
                          : "text-white hover:text-blue-100 hover:bg-white/10"
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
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${location.pathname === "/profile"
                        ? "bg-white/20 text-white border-l-4 border-white"
                        : "text-white hover:text-blue-100 hover:bg-white/10"
                      }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-blue-500/30">
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-red-300 border border-red-300/30 hover:bg-red-500/10 hover:text-red-200 hover:border-red-300/50 transition-all duration-200"
                    aria-label="Logout"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
