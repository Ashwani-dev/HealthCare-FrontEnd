import axios from "axios";

// Base API URL from environment variable, fallback to deployed backend or relative path
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // CRITICAL: Instructs Axios to send and accept cookies cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Guard to prevent multiple concurrent 401 redirects
let _isHandling401 = false;

/**
 * Clears all client-side session data and tells the browser to delete
 * the HttpOnly JWT cookie via the logout endpoint, then redirects to /login.
 * Called automatically by the response interceptor on any 401.
 */
const handleSessionExpiry = async () => {
  if (_isHandling401) return; // already in progress
  _isHandling401 = true;

  try {
    // Ask the backend to set maxAge=0 on the HttpOnly cookie
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore — server may already have rejected the session
  }

  // Wipe all client-side state
  localStorage.removeItem("user");
  sessionStorage.removeItem("profileData");
  sessionStorage.removeItem("paymentData");

  // Signal the login page to show the expiry banner
  sessionStorage.setItem("sessionExpired", "true");

  // Hard redirect so React state is fully reset
  window.location.href = "/login";
};

// Response interceptor — handles expired / invalid JWT (HTTP 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // ── Requests that should NEVER trigger session-expiry flow ──────────────
    // 1. Logout itself  → would cause an infinite loop
    // 2. Login / register / TOTP endpoints → a 401 here means "wrong credentials",
    //    not an expired session. LoginForm's own catch block handles those errors.
    //    (Relying solely on window.location.pathname is fragile because React Router
    //    may update the URL asynchronously before the response is processed.)
    const isExemptCall =
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/totp") ||
      requestUrl.includes("/auth/patient/register") ||
      requestUrl.includes("/auth/doctor/register");

    if (status === 401 && !isExemptCall) {
      handleSessionExpiry();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { baseURL };
