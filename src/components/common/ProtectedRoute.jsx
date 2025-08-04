import React from "react";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user } = useAuth();
  if (!user) return fallback;
  return children;
};

export default ProtectedRoute; 