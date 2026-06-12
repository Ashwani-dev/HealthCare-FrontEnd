import apiClient from "@/services/apiClient";

/**
 * Submit the contact form message to the backend support mailbox.
 * @param {Object} contactData - Object containing name, email, subject, and message.
 * @returns {Promise<Object>} Response detailing message sending status.
 */
export const submitContactForm = async (contactData) => {
  const res = await apiClient.post("/support/message", contactData);
  return res.data;
};
