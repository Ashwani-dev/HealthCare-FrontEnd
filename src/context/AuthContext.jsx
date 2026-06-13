import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "@/services/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role, userId, loginMethod, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        // No stored session — user is logged out
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }

      // ─── PROACTIVE SESSION CHECK ────────────────────────────────────────────
      // Uncomment the block below once you add GET /auth/verify to your
      // Spring Boot backend (protected, NOT in permitAll).
      // It validates the JWT cookie on every app load so that a user returning
      // after 24h is redirected to /login immediately with a graceful message,
      // instead of seeing a broken dashboard until the first real API call fails.
      //
      // try {
      //   await apiClient.get("/auth/verify");
      // } catch {
      //   // 401 is handled by the interceptor — any other error (network, 5xx)
      //   // we ignore so the app still loads with the cached user.
      // }
      // ────────────────────────────────────────────────────────────────────────

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData) => {
    // userData should include: role, userId, and optionally loginMethod
    const userWithDefaults = {
      ...userData,
      loginMethod: userData.loginMethod || "PASSWORD", // Default to PASSWORD if not specified
    };
    delete userWithDefaults.token;
    setUser(userWithDefaults);
    localStorage.setItem("user", JSON.stringify(userWithDefaults));
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Failed to log out from server:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      sessionStorage.removeItem("profileData");
      sessionStorage.removeItem("paymentData");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);