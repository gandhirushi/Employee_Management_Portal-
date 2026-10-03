export const DEPARTMENTS = [
  'Design',
  'Engineering',
  'Finance',
  'HR',
  'Human Resources',
  'Legal',
  'Marketing',
  'Operations',
  'Product',
  'Sales',
  'Support',
];

export const POSITIONS = [
  'Analyst',
  'Designer',
  'Director',
  'HR Manager',
  'Manager',
  'Marketing Specialist',
  'Product Manager',
  'Sales Representative',
  'Senior Software Engineer',
  'Software Engineer',
  'VP',
];

export const STATUSES = ['Active', 'Inactive', 'On Leave'];

export const LEAVE_TYPES = [
  'Work From Home',
  'Sick Leave',
  'Casual Leave',
  'Annual Leave',
  'Other Leave',
];

export const USER_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

export function formatRole(role) {
  if (!role) return 'Employee';
  const found = USER_ROLES.find((r) => r.value === role);
  if (found) return found.label;
  return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
