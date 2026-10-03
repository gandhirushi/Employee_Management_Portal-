import {
  createLeaveApplication,
  getMyLeaveApplications,
  getAllLeaveApplications,
  updateLeaveStatus,
} from "../services/leave.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const applyLeaveController = asyncHandler(async (req, res) => {
  const leave = await createLeaveApplication(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Leave application submitted successfully.",
    leave,
  });
});

export const getMyLeavesController = asyncHandler(async (req, res) => {
  const leaves = await getMyLeaveApplications(req.user.id);

  res.json({
    success: true,
    leaves,
    totalCount: leaves.length,
  });
});

export const getAllLeavesController = asyncHandler(async (req, res) => {
  const result = await getAllLeaveApplications(req.user.id, req.user.role, req.query);

  res.json({
    success: true,
    leaves: result.leaves,
    totalCount: result.totalCount,
  });
});

export const updateLeaveStatusController = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const leave = await updateLeaveStatus(
    req.params.id,
    status,
    rejectionReason,
    req.user.role
  );

  res.json({
    success: true,
    message: `Leave application ${leave.status.toLowerCase()} successfully.`,
    leave,
  });
});
