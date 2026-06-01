/**
 * Utility function to resolve absolute profile avatar image URLs from S3 storage keys or absolute paths.
 * Supports both snake_case (profile_image_url) and camelCase (profileImageUrl) properties dynamically.
 * @param {Object} profileObj - Fresh profile metadata payload
 * @returns {string|null} Fully-qualified image source path, or null if no profile image exists
 */
export const getAvatarUrl = (profileObj) => {
  const path = profileObj?.profileImageUrl || profileObj?.profile_image_url;
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = import.meta.env.VITE_AWS_S3_BUCKET_URL || "https://theraconnect-file-storage.s3.ap-south-1.amazonaws.com";
  return `${baseUrl.replace(/\/$/, "")}/${path}`;
};

/**
 * Utility function to generate initials from user and profile data.
 * @param {Object} user - Logged in user metadata
 * @param {Object} profile - Detailed profile metadata payload
 * @returns {string} Initials string
 */
export const getInitials = (user, profile) => {
  if (profile?.full_name) {
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (!user) return "U";
  if (user.full_name) {
    return user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (user.name) {
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (user.firstName && user.lastName) {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
  return "U";
};

/**
 * Utility function to resolve user's display name from profile and user credentials.
 * @param {Object} user - Logged in user metadata
 * @param {Object} profile - Detailed profile metadata payload
 * @returns {string} User's display name
 */
export const getUserDisplayName = (user, profile) => {
  if (profile?.full_name) return profile.full_name;
  if (user?.full_name) return user.full_name;
  if (user?.name) return user.name;
  if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
  return "User";
};
