import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role, userId, token, loginMethod, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage if present
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData should include: role, userId, token, and optionally loginMethod
    const userWithDefaults = {
      ...userData,
      loginMethod: userData.loginMethod || 'PASSWORD' // Default to PASSWORD if not specified
    };
    setUser(userWithDefaults);
    localStorage.setItem("user", JSON.stringify(userWithDefaults));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 