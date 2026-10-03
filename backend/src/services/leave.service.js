import prisma from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { UserRole } from "../config/roles.js";
import { createNotification, createNotificationForRoles } from "./notification.service.js";
import { cacheService } from "./cache.service.js";
import { cacheKeys, cachePatterns, CACHE_TTL } from "../utils/cacheKeys.js";



export const ALLOWED_LEAVE_TYPES = [
  "Work From Home",
  "Sick Leave",
  "Casual Leave",
  "Annual Leave",
  "Other Leave",
];

function formatDate(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function formatLeave(leave) {
  return {
    id: leave.id,
    leaveType: leave.leaveType,
    startDate: formatDate(leave.startDate),
    endDate: formatDate(leave.endDate),
    reason: leave.reason,
    status: leave.status,
    rejectionReason: leave.rejectionReason || null,
    actionDate: formatDate(leave.actionDate),
    appliedDate: leave.createdAt,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
    userId: leave.userId,
    employeeId: leave.employeeId || leave.employee?.id || leave.userId,
    employeeName: leave.employee?.fullName || leave.user?.fullName || "Employee",
    employeeEmail: leave.employee?.email || leave.user?.email || "",
    department: leave.employee?.department || "General",
    position: leave.employee?.position || "Employee",
    profilePhoto: leave.employee?.profilePhoto || null,
  };
}

function validateLeaveData(data) {
  if (!data.leaveType || typeof data.leaveType !== "string" || !data.leaveType.trim()) {
    throw new AppError("Leave type is required.", 400);
  }

  if (!data.startDate) {
    throw new AppError("Start date is required.", 400);
  }

  if (!data.endDate) {
    throw new AppError("End date is required.", 400);
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (isNaN(start.getTime())) {
    throw new AppError("Invalid start date format.", 400);
  }

  if (isNaN(end.getTime())) {
    throw new AppError("Invalid end date format.", 400);
  }

  // Normalise start and end dates to compare day precision
  const startDay = new Date(data.startDate.slice(0, 10));
  const endDay = new Date(data.endDate.slice(0, 10));

  if (endDay < startDay) {
    throw new AppError("End date cannot be before the start date.", 400);
  }

  if (!data.reason || typeof data.reason !== "string" || !data.reason.trim()) {
    throw new AppError("Reason for leave is required.", 400);
  }
}

export async function createLeaveApplication(userId, data) {
  validateLeaveData(data);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });

  if (!user) {
    throw new AppError("User account not found.", 404);
  }

  // Find linked Employee record
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [{ userId: user.id }, { email: user.email }],
    },
    select: { id: true },
  });

  const leave = await prisma.leave.create({
    data: {
      leaveType: data.leaveType.trim(),
      startDate: new Date(`${data.startDate.slice(0, 10)}T00:00:00.000Z`),
      endDate: new Date(`${data.endDate.slice(0, 10)}T00:00:00.000Z`),
      reason: data.reason.trim(),
      status: "PENDING",
      userId: user.id,
      employeeId: employee ? employee.id : null,
    },
    include: {
      user: true,
      employee: true,
    },
  });

  // Notify Super Admin and HR Admin users about the new leave request
  try {
    await createNotificationForRoles(
      [UserRole.SUPER_ADMIN, UserRole.HR_ADMIN],
      {
        title: "New Leave Application",
        description: `${user.fullName} applied for ${data.leaveType} (${data.startDate.slice(0, 10)} to ${data.endDate.slice(0, 10)}).`,
        type: "info",
      }
    );
  } catch (err) {
    console.error("Failed to dispatch admin leave notification:", err);
  }

  // Invalidate admin leave caches and employee's leave cache
  await Promise.allSettled([
    cacheService.delByPattern(cachePatterns.adminLeaves()),
    cacheService.del(cacheKeys.leavesUser(user.id)),
  ]);

  return formatLeave(leave);
}

export async function getMyLeaveApplications(userId) {
  const cacheKey = cacheKeys.leavesUser(userId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const leaves = await prisma.leave.findMany({
        where: { userId },
        include: {
          user: true,
          employee: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return leaves.map(formatLeave);
    },
    CACHE_TTL.LEAVES_USER
  );
}

export async function getAllLeaveApplications(userId, role, params = {}) {
  // Support flexible argument passing (e.g. if params passed as first arg)
  if (typeof userId === "object" && userId !== null) {
    params = userId;
    userId = null;
    role = null;
  }

  // Authorization guard
  if (role && role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN) {
    throw new AppError("You don't have permission to perform this action.", 403);
  }

  const cacheKey = cacheKeys.leavesAdmin(params);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const { status, search } = params;
      const where = {};

      if (status && status.trim() && status !== "ALL") {
        where.status = status.trim().toUpperCase();
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { reason: { contains: q, mode: "insensitive" } },
          { leaveType: { contains: q, mode: "insensitive" } },
          { user: { fullName: { contains: q, mode: "insensitive" } } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { employee: { fullName: { contains: q, mode: "insensitive" } } },
        ];
      }

      const leaves = await prisma.leave.findMany({
        where,
        include: {
          user: true,
          employee: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = leaves.map(formatLeave);

      return {
        leaves: formatted,
        totalCount: formatted.length,
      };
    },
    CACHE_TTL.LEAVES_ADMIN
  );
}

export async function updateLeaveStatus(leaveId, status, rejectionReason = null, userRole = null) {
  if (userRole && userRole !== UserRole.SUPER_ADMIN) {
    throw new AppError("Only Super Admins can approve or reject leave applications.", 403);
  }

  const normalizedStatus = String(status).trim().toUpperCase();

  if (!["APPROVED", "REJECTED"].includes(normalizedStatus)) {
    throw new AppError("Status must be either APPROVED or REJECTED.", 400);
  }

  const existingLeave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: {
      user: true,
      employee: true,
    },
  });

  if (!existingLeave) {
    throw new AppError("Leave application not found.", 404);
  }

  const updateData = {
    status: normalizedStatus,
    actionDate: new Date(),
    rejectionReason:
      normalizedStatus === "REJECTED"
        ? (rejectionReason ? rejectionReason.trim() : null)
        : null,
  };

  const updatedLeave = await prisma.leave.update({
    where: { id: leaveId },
    data: updateData,
    include: {
      user: true,
      employee: true,
    },
  });

  // Notify the employee user about the updated status
  try {
    const isApproved = normalizedStatus === "APPROVED";
    await createNotification(
      updatedLeave.userId,
      {
        title: isApproved ? "Leave Application Approved" : "Leave Application Rejected",
        description: `Your ${updatedLeave.leaveType} request from ${formatDate(updatedLeave.startDate)} to ${formatDate(updatedLeave.endDate)} was ${normalizedStatus.toLowerCase()}.${
          updatedLeave.rejectionReason ? ` Note: ${updatedLeave.rejectionReason}` : ""
        }`,
        type: isApproved ? "success" : "danger",
      }
    );
  } catch (err) {
    console.error("Failed to dispatch employee leave status notification:", err);
  }

  // Invalidate admin leave caches and employee's leave cache
  await Promise.allSettled([
    cacheService.delByPattern(cachePatterns.adminLeaves()),
    cacheService.del(cacheKeys.leavesUser(updatedLeave.userId)),
  ]);

  return formatLeave(updatedLeave);
}

