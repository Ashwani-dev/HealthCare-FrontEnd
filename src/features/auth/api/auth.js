import apiClient from "@/services/apiClient";

/**
 * Register a new user (doctor or patient)
 * @param {Object} data - User registration data (name, email, password, etc.)
 * @param {string} type - User type: 'doctor' or 'patient'
 * @returns {Promise<Object>} Registration response with user data and token
 */
export const registerUser = async (data, type) => {
  let url;
  if (type === "doctor") {
    url = "/auth/doctor/register";
  } else if (type === "patient") {
    url = "/auth/patient/register";
  } else {
    throw new Error("Invalid user type for registration");
  }
  const res = await apiClient.post(url, data);
  return res.data;
};

/**
 * Authenticate user login with password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} type - User type: 'doctor' or 'patient'
 * @returns {Promise<Object>} Login response with user data and token
 */
export const loginUser = async (email, password, type) => {
  const userType = type.toUpperCase(); // Convert to 'PATIENT' or 'DOCTOR'
  const res = await apiClient.post(
    "/auth/login/password",
    { email, password },
    { params: { userType } }
  );
  return res.data;
};

/**
 * Request password reset for patient
 * @param {string} email - Patient's email address
 * @returns {Promise<Object>} Success message
 */
export const forgotPasswordPatient = async (email) => {
  const response = await apiClient.post("/auth/patient/forgot-password", { email });
  return response.data;
};

/**
 * Request password reset for doctor
 * @param {string} email - Doctor's email address
 * @returns {Promise<Object>} Success message
 */
export const forgotPasswordDoctor = async (email) => {
  const response = await apiClient.post("/auth/doctor/forgot-password", { email });
  return response.data;
};

/**
 * Reset password using token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password (minimum 6 characters)
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post("/auth/reset-password", {
    token,
    newPassword
  });
  return response.data;
};

/**
 * Login with TOTP code (authenticator app)
 * @param {string} email - User's email address
 * @param {string} code - 6-digit TOTP code from authenticator app
 * @param {string} userType - User type: 'PATIENT' or 'DOCTOR' (uppercase)
 * @returns {Promise<Object>} Login response with token, role, userId, and loginMethod
 */
export const loginWithTOTP = async (email, code, userType) => {
  const res = await apiClient.post(`/auth/login/totp?userType=${userType}`, { email, code });
  return res.data;
};

/**
 * Setup TOTP for current user (generate QR code)
 * @returns {Promise<Object>} Object with qrCodeImage (base64) and secret
 */
export const setupTOTP = async () => {
  const res = await apiClient.post("/auth/totp/setup");
  return res.data;
};

/**
 * Confirm TOTP setup by verifying code from authenticator app
 * @param {string} secret - TOTP secret from setup
 * @param {string} code - 6-digit code from authenticator app
 * @returns {Promise<Object>} Success message and loginMethod
 */
export const confirmTOTP = async (secret, code) => {
  const res = await apiClient.post("/auth/totp/confirm", { secret, code });
  return res.data;
};

/**
 * Disable TOTP for current user
 * @returns {Promise<Object>} Success message and loginMethod (PASSWORD)
 */
export const disableTOTP = async () => {
  const res = await apiClient.post("/auth/totp/disable");
  return res.data;
};
