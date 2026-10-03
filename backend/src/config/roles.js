export const UserRole = Object.freeze({
  SUPER_ADMIN: "super_admin",
  HR_ADMIN: "hr_admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});

export const SUPER_ADMIN = UserRole.SUPER_ADMIN;
export const HR_ADMIN = UserRole.HR_ADMIN;
export const MANAGER = UserRole.MANAGER;
export const EMPLOYEE = UserRole.EMPLOYEE;

export function normalizeRole(role) {
  if (!role || typeof role !== "string") return "";
  const lower = role.trim().toLowerCase();
  const validRoles = Object.values(UserRole);
  return validRoles.includes(lower) ? lower : role;
}

