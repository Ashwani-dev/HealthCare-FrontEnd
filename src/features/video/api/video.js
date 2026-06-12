import apiClient from "@/services/apiClient";

/**
 * Create a new video session for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<Object>} VideoSession room details
 */
export const createVideoSession = async (appointmentId) => {
  const res = await apiClient.post(`/video-call/session/${appointmentId}`, {});
  return res.data;
};

/**
 * Get video session info for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<Object>} Existing session details
 */
export const getVideoSession = async (appointmentId) => {
  const res = await apiClient.get(`/video-call/session/${appointmentId}`);
  return res.data;
};

/**
 * Get Twilio access token for a user to join a video call
 * @param {number|string} appointmentId - ID of the appointment
 * @param {string} userType - User type: 'DOCTOR' or 'PATIENT'
 * @param {number|string} userId - ID of the user joining the call
 * @returns {Promise<string>} Twilio access token
 */
export const getVideoToken = async (appointmentId, userType, userId) => {
  const res = await apiClient.get(`/video-call/token/${appointmentId}?userType=${userType}&userId=${userId}`);
  return res.data;
};

/**
 * End a video session for an appointment
 * @param {number|string} appointmentId - ID of the appointment
 * @returns {Promise<void>}
 */
export const endVideoSession = async (appointmentId) => {
  await apiClient.post(`/video-call/end/${appointmentId}`, {});
};
