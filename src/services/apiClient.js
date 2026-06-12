import axios from "axios";

// Base API URL from environment variable, fallback to deployed backend or relative path
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include token if present
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    // Inject authorization token if user session is present
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
export { baseURL };
