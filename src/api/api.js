import axios from "axios";

// Get API base URL from environment variable, fallback to deployed backend or relative path
// const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "https://health-care-7oam.onrender.com/api";
const baseURL = "http://localhost:8080/api";

// Add a request interceptor to include token if present
axios.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
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

// ================= Authentication API =================

/**
 * Register a new user (doctor or patient)
 * @param {Object} data - User registration data (name, email, password, etc.)
 * @param {string} type - User type: 'doctor' or 'patient'
 * @returns {Promise<Object>} Registration response with user data and token
 * @throws {Error} If user type is invalid
 */
export const registerUser = async (data, type) => {
  let url;
  if (type === "doctor") {
    url = `${baseURL}/auth/doctor/register`;
  } else if (type === "patient") {
    url = `${baseURL}/auth/patient/register`;
  } else {
    throw new Error("Invalid user type for registration");
  }
  const res = await axios.post(url, data);
  return res.data;
};

/**
 * Authenticate user login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} type - User type: 'doctor' or 'patient'
 * @returns {Promise<Object>} Login response with user data and token
 * @throws {Error} If user type is invalid
 */
export const loginUser = async (email, password, type) => {
  let url;
  if (type === "doctor") {
    url = `${baseURL}/auth/doctor/login`;
  } else if (type === "patient") {
    url = `${baseURL}/auth/patient/login`;
  } else {
    throw new Error("Invalid user type for login");
  }
  const res = await axios.post(url, { email, password });
  return res.data;
};

// ================= Password Reset API =================

/**
 * Request password reset for patient
 * @param {string} email - Patient's email address
 * @returns {Promise<Object>} Success message
 */
export const forgotPasswordPatient = async (email) => {
  const response = await axios.post(`${baseURL}/auth/patient/forgot-password`, { email });
  return response.data;
};

/**
 * Request password reset for doctor
 * @param {string} email - Doctor's email address
 * @returns {Promise<Object>} Success message
 */
export const forgotPasswordDoctor = async (email) => {
  const response = await axios.post(`${baseURL}/auth/doctor/forgot-password`, { email });
  return response.data;
};

/**
 * Reset password using token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password (minimum 6 characters)
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${baseURL}/auth/reset-password`, {
    token,
    newPassword
  });
  return response.data;
};

// ================= Appointment API =================

/**
 * Create an appointment hold
 * @param {Object} holdData - Appointment hold data
 * @param {number|string} holdData.patientId - Patient ID
 * @param {number|string} holdData.doctorId - Doctor ID
 * @param {string} holdData.date - Appointment date (YYYY-MM-DD format)
 * @param {string} holdData.startTime - Appointment start time (HH:MM format)
 * @param {string} holdData.reason - Reason for the appointment
 * @returns {Promise<string>} Hold ID with prefix "hold_"
 */
export const createAppointmentHold = async (holdData) => {
  const url = `${baseURL}/appointments/hold`;
  const res = await axios.post(url, holdData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

/**
 * Fetch appointments for a specific doctor with optional filters and pagination
 * @param {number|string} doctorId - ID of the doctor
 * @param {Object} options - Optional parameters for filtering and pagination
 * @param {string} options.appointmentDate - Filter by specific date (YYYY-MM-DD)
 * @param {string} options.startTime - Filter by start time (HH:MM)
 * @param {string} options.status - Filter by appointment status
 * @param {string} options.dateFilter - Filter by date range (today, tomorrow, week)
 * @param {string} options.search - Search term for patient name
 * @param {number} options.page - Page number (0-based, default: 0)
 * @param {number} options.size - Page size (default: 10)
 * @param {string} options.sort - Sort field (default: "appointmentDate,asc")
 * @returns {Promise<Object>} Paginated response with appointments and pagination metadata
 */
export const fetchDoctorAppointments = async (doctorId, { 
  appointmentDate, 
  startTime, 
  status, 
  dateFilter,
  page = 0, 
  size = 10, 
  sort = "appointmentDate,asc" 
} = {}) => {
  let url = `${baseURL}/appointments/doctor/${doctorId}`;
  const params = [];
  
  // Add filter parameters
  if (appointmentDate) params.push(`appointmentDate=${encodeURIComponent(appointmentDate)}`);
  if (startTime) params.push(`startTime=${encodeURIComponent(startTime)}`);
  if (status && status !== "ALL") params.push(`status=${encodeURIComponent(status)}`);
  
  // Handle date filter conversion
  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    let targetDate;
    
    if (dateFilter === "today") {
      targetDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDate = tomorrow.getFullYear() + '-' + 
        String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
        String(tomorrow.getDate()).padStart(2, '0');
    } else if (dateFilter === "week") {
      // For week filter, we'll need to handle this differently
      // For now, let's just use today's date and let the backend handle week filtering
      targetDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    }
    
    if (targetDate) {
      params.push(`appointmentDate=${encodeURIComponent(targetDate)}`);
    }
  }
  
  // Add pagination parameters
  params.push(`page=${page}`);
  params.push(`size=${size}`);
  params.push(`sort=${encodeURIComponent(sort)}`);
  
  if (params.length) url += "?" + params.join("&");
  const res = await axios.get(url);
  return res.data;
};

/**
 * Fetch appointments for a specific patient with optional filters and pagination
 * @param {number|string} patientId - ID of the patient
 * @param {Object} options - Optional parameters for filtering and pagination
 * @param {string} options.appointmentDate - Filter by specific date (YYYY-MM-DD)
 * @param {string} options.startTime - Filter by start time (HH:MM)
 * @param {string} options.status - Filter by appointment status
 * @param {string} options.dateFilter - Filter by date range (today, tomorrow, week)
 * @param {number} options.page - Page number (0-based, default: 0)
 * @param {number} options.size - Page size (default: 10)
 * @param {string} options.sort - Sort field (default: "appointmentDate,asc")
 * @returns {Promise<Object>} Paginated response with appointments and pagination metadata
 */
export const fetchPatientAppointments = async (patientId, { 
  appointmentDate, 
  startTime, 
  status, 
  dateFilter,
  page = 0, 
  size = 10, 
  sort = "appointmentDate,asc" 
} = {}) => {
  let url = `${baseURL}/appointments/patient/${patientId}`;
  const params = [];
  
  // Add filter parameters
  if (appointmentDate) params.push(`appointmentDate=${encodeURIComponent(appointmentDate)}`);
  if (startTime) params.push(`startTime=${encodeURIComponent(startTime)}`);
  if (status && status !== "ALL") params.push(`status=${encodeURIComponent(status)}`);
  
  // Handle date filter conversion
  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    let targetDate;
    
    if (dateFilter === "today") {
      targetDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDate = tomorrow.getFullYear() + '-' + 
        String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
        String(tomorrow.getDate()).padStart(2, '0');
    } else if (dateFilter === "week") {
      // For week filter, we'll need to handle this differently
      // For now, let's just use today's date and let the backend handle week filtering
      targetDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    }
    
    if (targetDate) {
      params.push(`appointmentDate=${encodeURIComponent(targetDate)}`);
    }
  }
  
  // Add pagination parameters
  params.push(`page=${page}`);
  params.push(`size=${size}`);
  params.push(`sort=${encodeURIComponent(sort)}`);
  
  if (params.length) url += "?" + params.join("&");
  const res = await axios.get(url);
  return res.data;
};

/**
 * Cancel an existing appointment
 * @param {number|string} appointmentId - ID of the appointment to cancel
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelAppointment = async (appointmentId) => {
  const url = `${baseURL}/appointments/${appointmentId}`;
  const res = await axios.delete(url);
  return res.data;
};

/**
 * Fetch available appointment slots for a doctor on a specific date
 * @param {number|string} doctorId - ID of the doctor
 * @param {string} date - Date to check availability (YYYY-MM-DD format)
 * @returns {Promise<Array>} Array of available time slots
 */
export const fetchDoctorAvailableSlots = async (doctorId, date) => {
  const url = `${baseURL}/appointments/availability/${doctorId}?date=${date}`;
  const res = await axios.get(url);
  return res.data;
};

// ================= Availability API =================

/**
 * Set doctor's weekly availability schedule
 * @param {number|string} doctorId - ID of the doctor
 * @param {Array} availabilityArray - Array of availability objects for the week
 * @returns {Promise<Object>} Updated availability data
 */
export const setDoctorAvailability = async (doctorId, availabilityArray) => {
  const url = `${baseURL}/availability/${doctorId}`;
  const res = await axios.post(url, availabilityArray);
  return res.data;
};

/**
 * Fetch doctor's weekly availability schedule
 * @param {number|string} doctorId - ID of the doctor
 * @returns {Promise<Array>} Array of availability objects for the week
 */
export const fetchDoctorAvailability = async (doctorId) => {
  const url = `${baseURL}/availability/${doctorId}`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Delete a specific availability slot for a doctor
 * @param {number|string} doctorId - ID of the doctor
 *  @param {number|string} slotId - ID of the availability slot to delete
 * @returns {Promise<Object>} Deletion response
 * @throws {Error} If deletion fails
 */
export const deleteAvailabilitySlot = async (doctorId, slotId) => {
  const url = `${baseURL}/availability/${doctorId}/${slotId}`;
  // Use axios.delete matching the Controller @DeleteMapping
  const res = await axios.delete(url); 
  return res.data;
};

// ================= Doctor Search API =================

/**
 * Search for doctors by name or specialization
 * @param {string} q - Search query (doctor name or specialization)
 * @returns {Promise<Array>} Array of matching doctor objects
 */
export const fetchDoctorsSearch = async (q = "") => {
  let url = `${baseURL}/doctor/search`;
  if (q) url += `?q=${encodeURIComponent(q)}`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Fetch doctors filtered by specialization
 * @param {string} specialization - Specialization to filter by
 * @returns {Promise<Array>} Array of doctors with the specified specialization
 */
export const fetchDoctorsBySpecialization = async (specialization = "") => {
  let url = `${baseURL}/doctor/filter`;
  if (specialization) url += `?specialization=${encodeURIComponent(specialization)}`;
  const res = await axios.get(url);
  return res.data;
};

// ================= Profile API =================

/**
 * Fetch current patient's profile information
 * @returns {Promise<Object>} Patient profile data
 */
export const fetchPatientProfile = async () => {
  const url = `${baseURL}/patient/profile`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Fetch current doctor's profile information
 * @returns {Promise<Object>} Doctor profile data
 */
export const fetchDoctorProfile = async () => {
  const url = `${baseURL}/doctor/profile`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Fetch a doctor's profile by ID
 * @param {number|string} doctorId - ID of the doctor
 * @returns {Promise<Object>} Doctor profile data
 */
export const fetchDoctorProfileById = async (doctorId) => {
  // Try the standard REST endpoint first: /api/doctor/{id}
  // If backend uses /api/doctor/profile/{id} or /api/doctor/profile?id={id}, adjust accordingly
  const url = `${baseURL}/doctor/${doctorId}`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    // Fallback: try alternative endpoint patterns if the first one fails
    // Uncomment and adjust if your backend uses a different pattern:
    // const altUrl = `${baseURL}/doctor/profile/${doctorId}`;
    // const res = await axios.get(altUrl);
    // return res.data;
    throw error;
  }
};

/**
 * Update current patient's profile information
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated patient profile
 */
export const updatePatientProfile = async (data) => {
  const url = `${baseURL}/patient/profile`;
  const res = await axios.put(url, data);
  return res.data;
};

/**
 * Update current doctor's profile information
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated doctor profile
 */
export const updateDoctorProfile = async (data) => {
  const url = `${baseURL}/doctor/profile`;
  const res = await axios.put(url, data);
  return res.data;
};

// ================= Video Call API =================

/**
 * Create a new video session for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<Object>} VideoSession object with Twilio room details
 */
export const createVideoSession = async (appointmentId) => {
  const url = `${baseURL}/video-call/session/${appointmentId}`;
  const res = await axios.post(url, {}, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

/**
 * Get video session info for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<Object>} VideoSession object with existing session details
 */
export const getVideoSession = async (appointmentId) => {
  const url = `${baseURL}/video-call/session/${appointmentId}`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Get Twilio access token for a user to join a video call
 * @param {number|string} appointmentId - ID of the appointment
 * @param {string} userType - User type: 'DOCTOR' or 'PATIENT'
 * @param {number|string} userId - ID of the user joining the call
 * @returns {Promise<string>} Twilio access token for video call
 */
export const getVideoToken = async (appointmentId, userType, userId) => {
  const url = `${baseURL}/video-call/token/${appointmentId}?userType=${userType}&userId=${userId}`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * End a video session for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<void>} No return value
 */
export const endVideoSession = async (appointmentId) => {
  const url = `${baseURL}/video-call/end/${appointmentId}`;
  await axios.post(url, {}, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// ================= Payment API =================

/**
 * Initiate payment with appointment hold ID
 * @param {Object} paymentData - Payment data with hold ID
 * @param {string} paymentData.appointmentHoldReference - Appointment hold reference from createAppointmentHold
 * @param {string} paymentData.customerId - Customer ID
 * @param {string} paymentData.customerPhone - Customer phone number
 * @param {string} paymentData.customerEmail - Customer email
 * @param {number} paymentData.amount - Payment amount
 * @returns {Promise<Object>} Payment session response with paymentSessionId
 */
export const initiatePaymentWithHold = async (paymentData) => {
  const url = `${baseURL}/payments/initiate`;
  const res = await axios.post(url, paymentData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

/**
 * Get payment status for an order
 * @param {string} orderId - Order ID to check status for
 * @returns {Promise<string>} Payment status (SUCCESS, PENDING, FAILED, etc.)
 */
export const getPaymentStatus = async (orderId) => {
  const url = `${baseURL}/payments/status/${orderId}`;
  const res = await axios.get(url);
  return res.data;
};

/**
 * Fetch paginated payments for a patient with optional filters
 * @param {number|string} patientId - ID of the patient
 * @param {Object} options - Optional filters and pagination
 * @param {string} options.status - Payment status filter (e.g., SUCCESS, FAILED, PENDING)
 * @param {string} options.paymentMode - Payment mode filter (e.g., debit_card, wallet)
 * @param {number|string} options.minAmount - Minimum amount filter
 * @param {number|string} options.maxAmount - Maximum amount filter
 * @param {number} options.page - Page number (0-based, default: 0)
 * @param {number} options.size - Page size (default: 10)
 * @param {string} options.sort - Sort field and direction (default: "id,desc")
 * @returns {Promise<Object>} HAL paged model with `_embedded.paymentEntityList`, `_links`, and `page`
 */
export const fetchPatientPayments = async (
  patientId,
  { status, paymentMode, minAmount, maxAmount, page = 0, size = 10, sort = "id,desc" } = {}
) => {
  let url = `${baseURL}/payments/payment-details/${patientId}`;
  const params = [];
  if (status && status !== "ALL") params.push(`status=${encodeURIComponent(status)}`);
  if (paymentMode && paymentMode !== "ALL") params.push(`paymentMode=${encodeURIComponent(paymentMode)}`);
  if (minAmount !== undefined && minAmount !== null && minAmount !== "") params.push(`minAmount=${encodeURIComponent(minAmount)}`);
  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== "") params.push(`maxAmount=${encodeURIComponent(maxAmount)}`);
  params.push(`page=${page}`);
  params.push(`size=${size}`);
  params.push(`sort=${encodeURIComponent(sort)}`);
  if (params.length) url += `?${params.join("&")}`;
  const res = await axios.get(url);
  return res.data;
};