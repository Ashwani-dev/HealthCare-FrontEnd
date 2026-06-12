import apiClient from "@/services/apiClient";

/**
 * Fetch current patient's profile information
 * @returns {Promise<Object>} Patient profile data
 */
export const fetchPatientProfile = async () => {
  const res = await apiClient.get("/patient/profile");
  return res.data;
};

/**
 * Fetch current doctor's profile information
 * @returns {Promise<Object>} Doctor profile data
 */
export const fetchDoctorProfile = async () => {
  const res = await apiClient.get("/doctor/profile");
  return res.data;
};

/**
 * Fetch a doctor's profile by ID
 * @param {number|string} doctorId - ID of the doctor
 * @returns {Promise<Object>} Doctor profile data
 */
export const fetchDoctorProfileById = async (doctorId) => {
  const res = await apiClient.get(`/doctor/${doctorId}`);
  return res.data;
};

/**
 * Update current patient's profile information
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated patient profile
 */
export const updatePatientProfile = async (data) => {
  const res = await apiClient.put("/patient/profile", data);
  return res.data;
};

/**
 * Update current doctor's profile information
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated doctor profile
 */
export const updateDoctorProfile = async (data) => {
  const res = await apiClient.put("/doctor/profile", data);
  return res.data;
};

/**
 * Patch profile image state (request S3 presigned URL, save key, or remove key)
 * @param {string} role - 'doctor' or 'patient'
 * @param {string|null} profileImageUrl - null (request URL), "remove" (delete key), or verified key string
 * @returns {Promise<Object>} Response with presigned upload details or updated profile object
 */
export const patchProfileImage = async (role, profileImageUrl) => {
  const res = await apiClient.patch(`/${role}/profile`, { profileImageUrl });
  return res.data;
};

/**
 * Perform a direct binary PUT upload of a file to an S3 bucket via presigned URL
 * @param {string} presignedUrl - S3 presigned URL
 * @param {File} file - Native File object
 * @returns {Promise<void>}
 */
export const uploadFileToS3 = async (presignedUrl, file) => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type
    }
  });
  if (!response.ok) {
    throw new Error(`S3 direct upload failed with status: ${response.status} - ${response.statusText}`);
  }
};
