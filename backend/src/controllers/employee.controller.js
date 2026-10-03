import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  createEmployeeRecordForUser,
  updateEmployee,
  deleteEmployee,
  updateEmployeePhoto,
  deleteEmployeePhoto,
  updateEmployeeRole,
  getDashboardStats,
} from "../services/employee.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import prisma from "../prisma/client.js";
import { UserRole } from "../config/roles.js";

export const listEmployees = asyncHandler(async (req, res) => {
  const result = await getEmployees(req.user.id, req.user.role, req.query);

  res.json({
    success: true,
    employees: result.employees,
    totalCount: result.totalCount,
  });
});

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const result = await getDashboardStats(req.user.id, req.user.role);

  res.json({
    success: true,
    ...result,
  });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(
    req.user.id,
    req.params.id,
    req.user.role
  );

  res.json({
    success: true,
    employee,
  });
});

export const postEmployee = asyncHandler(async (req, res) => {
  const photoPath = req.file ? req.file.filename : null;
  const result = await createEmployee(
    req.user.id,
    { ...req.body, profilePhoto: photoPath }
  );

  res.status(201).json({
    success: true,
    message: "Employee and user account created successfully.",
    employee: result.employee,
    user: result.user,
  });
});

export const putEmployee = asyncHandler(async (req, res) => {
  const photoPath = req.file ? req.file.filename : undefined;
  const updatePayload = { ...req.body };
  if (photoPath !== undefined) {
    updatePayload.profilePhoto = photoPath;
  }

  const employee = await updateEmployee(
    req.user.id,
    req.params.id,
    updatePayload,
    req.user.role
  );

  res.json({
    success: true,
    message: "Employee completely updated successfully.",
    employee,
  });
});

export const patchEmployee = asyncHandler(async (req, res) => {
  const photoPath = req.file ? req.file.filename : undefined;
  const updatePayload = { ...req.body };
  if (photoPath !== undefined) {
    updatePayload.profilePhoto = photoPath;
  }

  const employee = await updateEmployee(
    req.user.id,
    req.params.id,
    updatePayload,
    req.user.role
  );

  res.json({
    success: true,
    message: "Employee updated successfully.",
    employee,
  });
});

export const removeEmployee = asyncHandler(async (req, res) => {
  const result = await deleteEmployee(
    req.user.id,
    req.params.id,
    req.user.role
  );

  res.json({
    success: true,
    message: result.userDeleted
      ? "Employee and associated user account deleted successfully."
      : "Employee deleted successfully.",
    ...result,
  });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please select an image file to upload.", 400);
  }
  const filename = req.file.filename;
  const employee = await updateEmployeePhoto(req.user.id, req.params.id, filename, req.user.role);

  res.json({
    success: true,
    message: "Employee profile photo updated successfully.",
    employee,
  });
});

export const removePhoto = asyncHandler(async (req, res) => {
  const employee = await deleteEmployeePhoto(req.user.id, req.params.id, req.user.role);

  res.json({
    success: true,
    message: "Employee profile photo removed.",
    employee,
  });
});

export const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!role) {
    throw new AppError("Role is required.", 400);
  }

  const employee = await updateEmployeeRole(
    req.user.id,
    req.params.id,
    role,
    req.user.role
  );

  res.json({
    success: true,
    message: "Employee role updated successfully.",
    employee,
  });
});

export const onboardEmployee = asyncHandler(async (req, res) => {
  if (req.user.role !== UserRole.EMPLOYEE) {
    throw new AppError("Only new employees can onboard this way.", 403);
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user.isOnboarded) {
    throw new AppError("You have already onboarded.", 400);
  }

  const photoPath = req.file ? req.file.filename : null;

  // Check if an initial employee record was already created on signup
  const existingEmployee = await prisma.employee.findFirst({
    where: { userId: req.user.id },
  });

  let employee;
  if (existingEmployee) {
    employee = await updateEmployee(
      req.user.id,
      existingEmployee.id,
      { ...req.body, profilePhoto: photoPath || undefined },
      req.user.role
    );
  } else {
    employee = await createEmployeeRecordForUser(
      req.user.id,
      { ...req.body, profilePhoto: photoPath, role: UserRole.EMPLOYEE }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { isOnboarded: true },
  });

  res.status(200).json({
    success: true,
    message: "Onboarding completed successfully.",
    employee,
    user: {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      isOnboarded: updatedUser.isOnboarded,
    },
  });
});