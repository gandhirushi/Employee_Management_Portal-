import crypto from "node:crypto";

/**
 * Standard Time-To-Live (TTL) durations in seconds.
 */
export const CACHE_TTL = Object.freeze({
  DASHBOARD_STATS: 600,   // 10 minutes
  EMPLOYEE_DETAIL: 1800,  // 30 minutes
  EMPLOYEE_LIST: 300,     // 5 minutes
  USER_PROFILE: 900,      // 15 minutes
  USER_SETTINGS: 3600,    // 1 hour
  LEAVES_ADMIN: 300,      // 5 minutes
  LEAVES_USER: 300,       // 5 minutes
});

/**
 * Generates a stable deterministic hash from query objects.
 */
function hashObject(obj = {}) {
  const sortedKeys = Object.keys(obj).sort();
  const canonicalString = sortedKeys
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== "")
    .map((k) => `${k}=${String(obj[k]).trim()}`)
    .join("&");

  if (!canonicalString) return "default";

  return crypto.createHash("md5").update(canonicalString).digest("hex").slice(0, 12);
}

/**
 * Centralized Cache Key Builder Functions
 */
export const cacheKeys = Object.freeze({
  // Dashboard
  dashboardStats: (role, userId) => {
    if (role === "employee" && userId) {
      return `york:dashboard:stats:user:${userId}`;
    }
    return `york:dashboard:stats:role:${role || "all"}`;
  },

  // Employees
  employeeDetail: (employeeId) => `york:employees:detail:${employeeId}`,
  employeeList: (role, params = {}) => `york:employees:list:${role || "all"}:${hashObject(params)}`,

  // Users & Settings
  userProfile: (userId) => `york:users:profile:${userId}`,
  userSettings: (userId) => `york:settings:${userId}`,

  // Leaves
  leavesAdmin: (params = {}) => `york:leaves:admin:${hashObject(params)}`,
  leavesUser: (userId) => `york:leaves:user:${userId}`,
});

/**
 * Cache Invalidation Patterns (for SCAN-based eviction)
 */
export const cachePatterns = Object.freeze({
  allEmployees: () => "york:employees:*",
  employeeLists: () => "york:employees:list:*",
  allDashboardStats: () => "york:dashboard:stats:*",
  allLeaves: () => "york:leaves:*",
  adminLeaves: () => "york:leaves:admin:*",
  userLeaves: (userId) => `york:leaves:user:${userId}`,
  userProfile: (userId) => `york:users:profile:${userId}`,
  userSettings: (userId) => `york:settings:${userId}`,
});

export default {
  CACHE_TTL,
  cacheKeys,
  cachePatterns,
};
