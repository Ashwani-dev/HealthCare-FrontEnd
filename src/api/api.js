// Re-export all API endpoints from their modular feature-based structures
// This guarantees full backward compatibility for existing imports in unchanged files

export * from "../features/auth/api/auth";
export * from "../features/appointments/api/appointments";
export * from "../features/billing/api/billing";
export * from "../features/dashboard/api/profile";
export * from "../features/video/api/video";
export * from "../pages/api/contact";