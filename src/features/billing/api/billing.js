import apiClient from "@/services/apiClient";

/**
 * Initiate payment with appointment hold ID
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Payment session details
 */
export const initiatePaymentWithHold = async (paymentData) => {
  const res = await apiClient.post("/payments/initiate", paymentData);
  return res.data;
};

/**
 * Get payment status for an order
 * @param {string} orderId - Order ID to check status for
 * @returns {Promise<string>} Payment status
 */
export const getPaymentStatus = async (orderId) => {
  const res = await apiClient.get(`/payments/status/${orderId}`);
  return res.data;
};

/**
 * Fetch paginated payments for a patient with optional filters
 * @param {number|string} patientId - ID of the patient
 * @param {Object} options - Optional filters and pagination
 * @returns {Promise<Object>} Paginated payments with HAL metadata
 */
export const fetchPatientPayments = async (
  patientId,
  { status, paymentMode, minAmount, maxAmount, page = 0, size = 10, sort = "id,desc" } = {}
) => {
  let url = `/payments/payment-details/${patientId}`;
  const params = [];
  if (status && status !== "ALL") params.push(`status=${encodeURIComponent(status)}`);
  if (paymentMode && paymentMode !== "ALL") params.push(`paymentMode=${encodeURIComponent(paymentMode)}`);
  if (minAmount !== undefined && minAmount !== null && minAmount !== "") params.push(`minAmount=${encodeURIComponent(minAmount)}`);
  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== "") params.push(`maxAmount=${encodeURIComponent(maxAmount)}`);
  params.push(`page=${page}`);
  params.push(`size=${size}`);
  params.push(`sort=${encodeURIComponent(sort)}`);
  if (params.length) url += `?${params.join("&")}`;
  const res = await apiClient.get(url);
  return res.data;
};
