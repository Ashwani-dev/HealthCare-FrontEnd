import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Navbar.module.css";

const getInitials = (user) => {
  if (!user) return "";
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const navLinks = (
    <>
      <Link to="/" className={styles.link} onClick={() => setMenuOpen(false)}>Home</Link>
      <Link to="/about" className={styles.link} onClick={() => setMenuOpen(false)}>About</Link>
      <Link to="/contact" className={styles.link} onClick={() => setMenuOpen(false)}>Contact Us</Link>
      {!user && (
        <>
          <Link to="/login" className={styles.link} onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className={styles.link} onClick={() => setMenuOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <nav className={`${styles.navbarShadow} flex items-center justify-between px-6 py-3 relative bg-blue-700`}>
      <Link to="/" className={styles.logo} aria-label="Go to Home">HealthCare App</Link>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Desktop nav */}
      <div className="space-x-2 items-center hidden md:flex">
        {navLinks}
        {user && (
          <div className="relative ml-2" ref={avatarRef}>
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setAvatarOpen((open) => !open)}
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={avatarOpen}
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{getInitials(user)}</span>
              )}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn text-gray-800">
                <Link to="/dashboard" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setAvatarOpen(false)}>My Dashboard</Link>
                {user.role?.toLowerCase() === "doctor" && (
                  <Link to="/availability" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setAvatarOpen(false)}>Manage Availability</Link>
                )}
                <Link to="/profile" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setAvatarOpen(false)}>Profile Settings</Link>
                <button
                  onClick={() => { setAvatarOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600 font-semibold"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-blue-700 shadow-lg z-40 flex flex-col items-center py-4 md:hidden animate-fadeIn">
          {navLinks}
          {user && (
            <>
              <div className="my-2" ref={avatarRef}>
                <button
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => setAvatarOpen((open) => !open)}
                  aria-label="Open user menu"
                  aria-haspopup="true"
                  aria-expanded={avatarOpen}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{getInitials(user)}</span>
                  )}
                </button>
                {avatarOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn text-gray-800">
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-blue-50" onClick={() => { setAvatarOpen(false); setMenuOpen(false); }}>My Dashboard</Link>
                    {user.role?.toLowerCase() === "doctor" && (
                      <Link to="/availability" className="block px-4 py-2 hover:bg-blue-50" onClick={() => { setAvatarOpen(false); setMenuOpen(false); }}>Manage Availability</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 hover:bg-blue-50" onClick={() => { setAvatarOpen(false); setMenuOpen(false); }}>Profile Settings</Link>
                    <button
                      onClick={() => { setAvatarOpen(false); setMenuOpen(false); handleLogout(); }}
                      className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600 font-semibold"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
 