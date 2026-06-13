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
    const isAuthRoute =
      window.location.pathname === "/login" ||
      window.location.pathname === "/register";

    // Only intercept 401s that happen outside the login/register pages
    // and skip the logout call itself (avoid infinite loop)
    const isLogoutCall = error.config?.url?.includes("/auth/logout");

    if (status === 401 && !isAuthRoute && !isLogoutCall) {
      handleSessionExpiry();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { baseURL };
