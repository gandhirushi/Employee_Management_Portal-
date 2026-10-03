import validator from "validator";

export function validateSignup(req, res, next) {
  const { fullName, email, password } = req.body;
  const errors = {};

  
  // 1. FULL NAME VALIDATION
  
  if (!fullName || validator.isEmpty(fullName.trim())) {
    errors.fullName = "Full name is required.";
  }

  
  // 2. EMAIL VALIDATION (using validator package)
  
  if (!email || validator.isEmpty(email.trim())) {
    errors.email = "Email is required.";
  } else if (!validator.isEmail(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  
  // 3. PASSWORD VALIDATION (using validator + Regex)
  
  if (!password || validator.isEmpty(password)) {
    errors.password = "Password is required.";
  } else {
    // Check minimum 8 characters using validator.isLength
    if (!validator.isLength(password, { min: 8 })) {
      errors.password = "Password must be at least 8 characters long.";
    }
    // Check for at least 1 uppercase letter (A-Z)
    else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter (A-Z).";
    }
    // Check for at least 1 special character (!@#$%^&*)
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = "Password must contain at least one special character (e.g. !@#$%^&*).";
    }
  }

  
  // 4. ERROR HANDLING & NEXT()
  
  // If any validation failed, return HTTP 400 Bad Request
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors,
    });
  }

  // Validation passed! Hand off control to the next handler (signup controller)
  next();
}