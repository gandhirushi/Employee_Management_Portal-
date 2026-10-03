import {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  changePassword,
  updateUserPhoto,
  deleteUserPhoto,
  googleAuthService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const googleAuth = asyncHandler(async (req, res) => {
  // Strip client-provided role parameter to prevent role escalation
  const { credential, role: _ignoredRole, ...employeeData } = req.body;

  if (!credential) {
    throw new AppError("Google credential is required.", 400);
  }

  const result = await googleAuthService({ credential, ...employeeData });

  res.json({
    success: true,
    message: result.isNewUser
      ? "Account created successfully with Google."
      : "Login successful with Google.",
    token: result.token,
    user: result.user,
    isNewUser: result.isNewUser,
  });
});

export const signup = asyncHandler(async (req, res) => {
  // Strip client-provided role parameter to prevent role escalation
  const { fullName, email, password, role: _ignoredRole, ...employeeData } = req.body;

  if (!fullName || !email || !password) {
    throw new AppError("Full name, email, and password are required.", 400);
  }

  const result = await registerUser({
    fullName,
    email,
    password,
    ...employeeData,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: result.user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const result = await loginUser(email, password);

  res.json({
    success: true,
    message: "Login successful.",
    token: result.token,
    user: result.user,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.json({
    success: true,
    user,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});

export const password = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new AppError("New password is required.", 400);
  }

  await changePassword(req.user.id, newPassword);

  res.json({
    success: true,
    message: "Password changed successfully.",
  });
});

export const uploadAdminPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please select an image file to upload.", 400);
  }
  const filename = req.file.filename;
  const user = await updateUserPhoto(req.user.id, filename);

  res.json({
    success: true,
    message: "Admin profile photo updated successfully.",
    user,
  });
});

export const removeAdminPhoto = asyncHandler(async (req, res) => {
  const user = await deleteUserPhoto(req.user.id);

  res.json({
    success: true,
    message: "Admin profile photo removed.",
    user,
  });
});