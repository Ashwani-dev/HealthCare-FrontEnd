import apiClient from "@/services/apiClient";
import { formatLocalDate } from "@/utils/dateTime";

/**
 * Create an appointment hold
 * @param {Object} holdData - Appointment hold data
 * @returns {Promise<string>} Hold ID
 */
export const createAppointmentHold = async (holdData) => {
  const res = await apiClient.post("/appointments/hold", holdData);
  return res.data;
};

/**
 * Fetch appointments for a specific doctor with optional filters and pagination
 * @param {number|string} doctorId - ID of the doctor
 * @param {Object} params - Optional parameters for filtering and pagination
 * @returns {Promise<Object>} Paginated response with appointments
 */
export const fetchDoctorAppointments = async (doctorId, params = {}) => {
  const { page = 0, size = 10, sort = "appointmentDate,startTime,desc", status = "ALL", dateFilter = "all" } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort
  });

  if (status && status !== "ALL") {
    queryParams.append("status", status);
  }

  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    
    if (dateFilter === "today") {
      const todayStr = formatLocalDate(today);
      queryParams.append("appointmentStartDate", todayStr);
      queryParams.append("appointmentEndDate", todayStr);
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = formatLocalDate(tomorrow);
      queryParams.append("appointmentStartDate", tomorrowStr);
      queryParams.append("appointmentEndDate", tomorrowStr);
    } else if (dateFilter === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      queryParams.append("appointmentStartDate", formatLocalDate(weekStart));
      queryParams.append("appointmentEndDate", formatLocalDate(weekEnd));
    }
  }

  const response = await apiClient.get(`/appointments/doctor/${doctorId}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Fetch appointments for a specific patient with optional filters and pagination
 * @param {number|string} patientId - ID of the patient
 * @param {Object} params - Optional parameters for filtering and pagination
 * @returns {Promise<Object>} Paginated response with appointments
 */
export const fetchPatientAppointments = async (patientId, params = {}) => {
  const { page = 0, size = 10, sort = "appointmentDate,startTime,desc", status = "ALL", dateFilter = "all" } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort
  });

  if (status && status !== "ALL") {
    queryParams.append("status", status);
  }

  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    
    if (dateFilter === "today") {
      const todayStr = formatLocalDate(today);
      queryParams.append("appointmentStartDate", todayStr);
      queryParams.append("appointmentEndDate", todayStr);
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = formatLocalDate(tomorrow);
      queryParams.append("appointmentStartDate", tomorrowStr);
      queryParams.append("appointmentEndDate", tomorrowStr);
    } else if (dateFilter === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      queryParams.append("appointmentStartDate", formatLocalDate(weekStart));
      queryParams.append("appointmentEndDate", formatLocalDate(weekEnd));
    }
  }

  const response = await apiClient.get(`/appointments/patient/${patientId}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Cancel an existing appointment
 * @param {number|string} appointmentId - ID of the appointment to cancel
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelAppointment = async (appointmentId) => {
  const res = await apiClient.delete(`/appointments/${appointmentId}`);
  return res.data;
};

/**
 * Reschedule an existing appointment
 * @param {number} appointmentId - The appointment ID to reschedule
 * @param {string} appointmentDate - New date in YYYY-MM-DD format
 * @param {string} startTime - New start time in HH:mm:ss format
 * @param {string} endTime - New end time in HH:mm:ss format
 * @returns {Promise<Object>} Updated appointment object
 */
export const rescheduleAppointment = async (appointmentId, appointmentDate, startTime, endTime) => {
  const res = await apiClient.put(`/appointments/${appointmentId}`, {
    appointmentDate,
    startTime,
    endTime
  });
  return res.data;
};

/**
 * Fetch available appointment slots for a doctor on a specific date
 * @param {number|string} doctorId - ID of the doctor
 * @param {string} date - Date to check availability (YYYY-MM-DD format)
 * @returns {Promise<Array>} Array of available time slots
 */
export const fetchDoctorAvailableSlots = async (doctorId, date) => {
  const res = await apiClient.get(`/appointments/availability/${doctorId}?date=${date}`);
  return res.data;
};

/**
 * Set doctor's weekly availability schedule
 * @param {number|string} doctorId - ID of the doctor
 * @param {Array} availabilityArray - Array of availability objects for the week
 * @returns {Promise<Object>} Updated availability data
 */
export const setDoctorAvailability = async (doctorId, availabilityArray) => {
  const res = await apiClient.post(`/availability/${doctorId}`, availabilityArray);
  return res.data;
};

/**
 * Fetch doctor's weekly availability schedule
 * @param {number|string} doctorId - ID of the doctor
 * @returns {Promise<Array>} Array of availability objects for the week
 */
export const fetchDoctorAvailability = async (doctorId) => {
  const res = await apiClient.get(`/availability/${doctorId}`);
  return res.data;
};

/**
 * Delete a specific availability slot for a doctor
 * @param {number|string} doctorId - ID of the doctor
 * @param {number|string} slotId - ID of the availability slot to delete
 * @returns {Promise<Object>} Deletion response
 */
export const deleteAvailabilitySlot = async (doctorId, slotId) => {
  const res = await apiClient.delete(`/availability/${doctorId}/${slotId}`); 
  return res.data;
};

/**
 * Update an existing availability slot for a doctor
 * @param {number|string} doctorId - ID of the doctor
 * @param {number|string} slotId - ID of the availability slot to update
 * @param {Object} slotData - Day of week, start/end time, availability details
 * @returns {Promise<Object>} Update response
 */
export const updateAvailabilitySlot = async (doctorId, slotId, slotData) => {
  const res = await apiClient.put(`/availability/${doctorId}/${slotId}`, slotData);
  return res.data;
};

/**
 * Search for doctors by name or specialization
 * @param {string} q - Search query (doctor name or specialization)
 * @returns {Promise<Array>} Array of matching doctor objects
 */
export const fetchDoctorsSearch = async (q = "") => {
  let url = "/doctor/search";
  if (q) url += `?q=${encodeURIComponent(q)}`;
  const res = await apiClient.get(url);
  return res.data;
};

/**
 * Fetch doctors by specialization and optional gender filter
 * @param {string} specialization - The specialization to filter by
 * @param {string} gender - Optional gender filter (MALE, FEMALE)
 * @returns {Promise<Array>} List of doctors matching the criteria
 */
export const fetchDoctorsBySpecialization = async (specialization = "", gender = "") => {
  const queryParams = new URLSearchParams();
  
  if (specialization) {
    queryParams.append("specialization", specialization);
  }
  
  if (gender) {
    queryParams.append("gender", gender.toUpperCase());
  }
  
  const url = `/doctor/filter${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await apiClient.get(url);
  return res.data;
};
