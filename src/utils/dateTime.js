// Centralized date-time utilities

/**
 * Format a date/time to Indian Standard Time (IST) as YYYY-MM-DD HH:MM:SS AM/PM IST
 * @param {string|number|Date} value - ISO string, timestamp, or Date
 * @param {Object} options
 * @param {boolean} options.includeTimezone - Append 'IST' suffix (default: true)
 * @returns {string}
 */
export const formatISTDateTime = (value, { includeTimezone = true } = {}) => {
  if (!value) return "";
  try {
    const date = value instanceof Date ? value : new Date(value);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).formatToParts(date);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const dayPeriod = (map.dayPeriod || "").toUpperCase(); // AM/PM
    const base = `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ${dayPeriod}`.trim();
    return includeTimezone ? `${base} IST` : base;
  } catch (e) {
    return String(value);
  }
};

/**
 * Convert a 24-hour time string (HH:mm or HH:mm:ss) to 12-hour AM/PM format
 * @param {string} time24
 * @returns {string}
 */
export const formatTimeToAMPM = (time24) => {
  if (!time24) return "";
  const [hoursStr, minutesStr = "00"] = time24.split(":");
  const hourNum = parseInt(hoursStr, 10);
  if (Number.isNaN(hourNum)) return time24;
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minutesStr} ${ampm}`;
};

// Helper function to format date as YYYY-MM-DD in local timezone
export const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
