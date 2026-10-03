export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatIndianPhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';
  return `+91${digits}`;
}

export function isValidPhone(phone) {
  if (!phone) return false;
  const formatted = formatIndianPhone(phone);
  return /^\+91[6-9]\d{9}$/.test(formatted);
}

export function validateSignup({ fullName, email, password, confirmPassword }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!email) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function validateEmployee(values) {
  const errors = {};
  if (!values.fullName || values.fullName.trim().length < 2) errors.fullName = 'Full name is required.';
  if (!values.email) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.phone) errors.phone = 'Phone number is required.';
  else if (!isValidPhone(values.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!values.gender) errors.gender = 'Select a gender.';
  if (!values.dob) errors.dob = 'Date of birth is required.';
  if (!values.department) errors.department = 'Select a department.';
  if (!values.position || values.position.trim().length < 2) errors.position = 'Position is required.';
  if (!values.salary || Number(values.salary) <= 0) errors.salary = 'Enter a valid salary.';
  if (!values.joiningDate) errors.joiningDate = 'Joining date is required.';
  if (!values.status) errors.status = 'Select a status.';
  if (!values.address || values.address.trim().length < 3) errors.address = 'Address is required.';
  return errors;
}
