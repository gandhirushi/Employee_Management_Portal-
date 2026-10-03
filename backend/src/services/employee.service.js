import { AppError } from "../utils/AppError.js";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import bcrypt from "bcryptjs";
import validator from "validator";
import prisma from "../prisma/client.js";
import { UserRole } from "../config/roles.js";
import { createNotification } from "./notification.service.js";
import { emitToUser } from "../socket/socket.server.js";
import { cacheService } from "./cache.service.js";
import { cacheKeys, cachePatterns, CACHE_TTL } from "../utils/cacheKeys.js";

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const DEFAULT_EMPLOYEE_PASSWORD = "Admin@123";

/**
 * Invalidates employee lists, dashboard statistics, single employee profile,
 * and associated user profile cache in a single non-blocking execution.
 */
async function invalidateEmployeeCache(employeeId = null, userId = null) {
  try {
    const promises = [
      cacheService.delByPattern(cachePatterns.employeeLists()),
      cacheService.delByPattern(cachePatterns.allDashboardStats()),
    ];
    if (employeeId) {
      promises.push(cacheService.del(cacheKeys.employeeDetail(employeeId)));
    }
    if (userId) {
      promises.push(cacheService.del(cacheKeys.userProfile(userId)));
    }
    await Promise.allSettled(promises);
  } catch (err) {
    console.error("[Cache] Failed to invalidate employee cache:", err.message);
  }
}



async function removeFileFromDisk(filenameOrPath) {
  if (!filenameOrPath) return;
  try {
    let fullPath;
    if (filenameOrPath.startsWith("/uploads/")) {
      fullPath = path.join(process.cwd(), filenameOrPath);
    } else {
      fullPath = path.join(process.cwd(), "uploads", filenameOrPath);
    }
    await fs.unlink(fullPath);
  } catch (err) {
    // Ignore error if file does not exist on disk
  }
}

function formatDate(date) {
  if (!date) return null;

  return date.toISOString().slice(0, 10);
}

function formatEmployee(employee) {
  return {
    id: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    gender: employee.gender,
    dob: formatDate(employee.dob),
    department: employee.department,
    position: employee.position,
    salary: employee.salary,
    joiningDate: formatDate(employee.joiningDate),
    status: employee.status,
    address: employee.address,
    role: employee.role,            
    profilePhoto: employee.profilePhoto || null,
    userId: employee.userId || null,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}
function formatIndianPhone(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[\s\-\(\)]/g, "");

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "";
  return `+91${digits}`;
}

function isValidIndianPhone(phone) {
  if (!phone) return false;
  const formatted = formatIndianPhone(phone);
  return /^\+91[6-9]\d{9}$/.test(formatted);
}

function validateEmployeeData(data) {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "gender",
    "dob",
    "department",
    "position",
    "salary",
    "joiningDate",
    "status",
    "address",
  ];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {

      throw new AppError(`${field} is required.`, 400);

    }
  }

  if (!isValidIndianPhone(data.phone)) {
    throw new AppError("Please enter a valid 10-digit Indian phone number.", 400);
  }
}

function buildEmployeeData(data) {
  return {
    fullName: String(data.fullName).trim(),
    email: String(data.email).trim().toLowerCase(),
    phone: formatIndianPhone(data.phone),
    gender: String(data.gender).trim(),
    dob: new Date(`${data.dob}T00:00:00.000Z`),
    department: String(data.department).trim(),
    position: String(data.position).trim(),
    salary: Number(data.salary),
    joiningDate: new Date(
      `${data.joiningDate}T00:00:00.000Z`
    ),
    status: String(data.status).trim(),
    address: String(data.address).trim(),
  };
}

export async function getEmployees(userId, role, params = {}) {
  const cacheKey = cacheKeys.employeeList(
    role,
    role === UserRole.EMPLOYEE ? { userId, ...params } : params
  );

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const { sortBy, sortOrder, search, department, status, position, joinedAfter, page, limit } = params;

      const where = {};
      if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN && role !== UserRole.MANAGER) {
        where.userId = userId;
      }

      if (search) {
        const q = search.trim();
        where.OR = [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { id: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
          { position: { contains: q, mode: "insensitive" } },
        ];
      }

      if (department) {
        where.department = department;
      }
      if (status) {
        where.status = status;
      }
      if (position) {
        where.position = position;
      }
      if (joinedAfter) {
        where.joiningDate = { gte: new Date(joinedAfter) };
      }

      const validSortOrders = ["asc", "desc"];
      const order = validSortOrders.includes(sortOrder) ? sortOrder : "desc";

      let orderBy = { createdAt: "desc" };
      if (sortBy === "name") {
        orderBy = { fullName: order };
      }

      const pageNum = parseInt(page, 10) || 1;
      const perPage = parseInt(limit, 10) || 0; // 0 means no pagination

      const queryArgs = {
        where,
        orderBy,
      };

      if (perPage > 0) {
        queryArgs.skip = (pageNum - 1) * perPage;
        queryArgs.take = perPage;
      }

      const [employees, totalCount] = await Promise.all([
        prisma.employee.findMany(queryArgs),
        prisma.employee.count({ where }),
      ]);

      return {
        employees: employees.map(formatEmployee),
        totalCount,
      };
    },
    CACHE_TTL.EMPLOYEE_LIST
  );
}

export async function getDashboardStats(userId, role) {
  const cacheKey = cacheKeys.dashboardStats(role, userId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const where = {};
      if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN && role !== UserRole.MANAGER) {
        where.userId = userId;
      }

      const allEmployees = await prisma.employee.findMany({
        where,
        select: { status: true, department: true, joiningDate: true, salary: true }
      });

      const total = allEmployees.length;
      const active = allEmployees.filter(e => e.status === "Active").length;
      const inactive = allEmployees.filter(e => e.status === "Inactive").length;
      
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 90);
      const recent = allEmployees.filter(e => e.joiningDate >= recentCutoff).length;

      const byDepartment = {};
      const byStatus = {};
      const salaryBands = [
        { label: "<60k", min: 0, max: 60000, count: 0 },
        { label: "60–90k", min: 60000, max: 90000, count: 0 },
        { label: "90–120k", min: 90000, max: 120000, count: 0 },
        { label: "120k+", min: 120000, max: Infinity, count: 0 },
      ];
      
      const joiningTrendMap = {};

      allEmployees.forEach(e => {
        if (e.department) byDepartment[e.department] = (byDepartment[e.department] || 0) + 1;
        if (e.status) byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        
        for (let band of salaryBands) {
          if (e.salary >= band.min && e.salary < band.max) {
            band.count++;
            break;
          }
        }
      });

      const sortedByDate = [...allEmployees].sort((a, b) => a.joiningDate - b.joiningDate);
      sortedByDate.forEach(e => {
        if (!e.joiningDate) return;
        const monthKey = `${e.joiningDate.toLocaleString("en-US", { month: "short" })} ${e.joiningDate.getFullYear()}`;
        joiningTrendMap[monthKey] = (joiningTrendMap[monthKey] || 0) + 1;
      });

      let running = 0;
      const joiningTrend = Object.entries(joiningTrendMap).map(([month, count]) => {
        running += count;
        return { month, hires: count, total: running };
      }).slice(-8);

      return {
        stats: { total, active, inactive, recent },
        byDepartment: Object.entries(byDepartment).map(([department, count]) => ({ department, count })),
        byStatus: Object.entries(byStatus).map(([status, value]) => ({ status, value })),
        joiningTrend,
        salaryBands: salaryBands.map(b => ({ band: b.label, count: b.count }))
      };
    },
    CACHE_TTL.DASHBOARD_STATS
  );
}


export async function getEmployeeById(userId, employeeId, role) {
  const isPrivileged = role === UserRole.SUPER_ADMIN || role === UserRole.HR_ADMIN || role === UserRole.MANAGER;
  const cacheKey = isPrivileged
    ? cacheKeys.employeeDetail(employeeId)
    : `york:employees:detail:${employeeId}:user:${userId}`;

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const where = { id: employeeId };
      if (!isPrivileged) {
        where.userId = userId;
      }

      const employee = await prisma.employee.findFirst({
        where,
      });

      if (!employee) {
        throw new AppError("Employee not found.", 404);
      }

      return formatEmployee(employee);
    },
    CACHE_TTL.EMPLOYEE_DETAIL
  );
}




export async function createEmployee(adminUserId, data) {
  validateEmployeeData(data);

  const employeeData = buildEmployeeData(data);

  if (
    Number.isNaN(employeeData.salary) ||
    employeeData.salary < 0
  ) {
    throw new AppError("Salary must be a valid non-negative number.", 400);
  }

  // 1. Validate employee email format
  if (!validator.isEmail(employeeData.email)) {
    throw new AppError("Please enter a valid email address.", 400);
  }

  // 2. Prevent duplicate user accounts with the same email
  const existingUser = await prisma.user.findUnique({
    where: { email: employeeData.email },
  });
  if (existingUser) {
    throw new AppError("A user account with this email already exists.", 409);
  }

  // 3. Prevent duplicate employee records with the same email
  const existingEmployee = await prisma.employee.findFirst({
    where: { email: employeeData.email },
  });
  if (existingEmployee) {
    throw new AppError("An employee with this email already exists.", 409);
  }

  // 4. Securely hash the initial default password
  const passwordHash = await bcrypt.hash(
    DEFAULT_EMPLOYEE_PASSWORD,
    BCRYPT_SALT_ROUNDS
  );

  // 5. Determine assigned role
  const assignedRole =
    data.role && Object.values(UserRole).includes(data.role)
      ? data.role
      : UserRole.EMPLOYEE;

  // 6. Atomically create User and Employee records within a database transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 6a. Create User record
      const user = await tx.user.create({
        data: {
          fullName: employeeData.fullName,
          email: employeeData.email,
          passwordHash,
          avatarSeed: employeeData.fullName,
          profilePhoto: data.profilePhoto || null,
          role: assignedRole,
          isOnboarded: true, // Directly created by admin; exempt from onboarding
          authProvider: "local",
          emailVerified: false,
          settings: {
            create: {},
          },
        },
      });

      // 6b. Create Employee record linked strictly to the newly created User
      const employee = await tx.employee.create({
        data: {
          id: data.id || randomUUID(),
          ...employeeData,
          role: assignedRole,
          profilePhoto: data.profilePhoto || null,
          userId: user.id,
        },
      });

      return { user, employee };
    });

    await invalidateEmployeeCache(result.employee.id, result.user.id);

    return {
      employee: formatEmployee(result.employee),
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
        isOnboarded: result.user.isOnboarded,
      },
    };
  } catch (error) {
    // If creation fails, clean up uploaded file from disk if present
    if (data.profilePhoto) {
      await removeFileFromDisk(data.profilePhoto);
    }
    throw error;
  }
}

export async function createEmployeeRecordForUser(userId, data) {
  validateEmployeeData(data);
  const employeeData = buildEmployeeData(data);

  if (Number.isNaN(employeeData.salary) || employeeData.salary < 0) {
    throw new AppError("Salary must be a valid non-negative number.", 400);
  }

  const employee = await prisma.employee.create({
    data: {
      id: data.id || randomUUID(),
      ...employeeData,
      role: data.role || UserRole.EMPLOYEE,
      profilePhoto: data.profilePhoto || null,
      userId,
    },
  });

  await invalidateEmployeeCache(employee.id, userId);

  return formatEmployee(employee);
}


export async function updateEmployee(
  userId,
  employeeId,
  data,
  role
) {
  const where = { id: employeeId };
  if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN) {
    where.userId = userId;
  }

  const existingEmployee =
    await prisma.employee.findFirst({
      where,
    });

  if (!existingEmployee) {
    throw new AppError("Employee not found.", 404);
  }

  const updateData = {};

  const fields = [
    "fullName",
    "email",
    "gender",
    "department",
    "position",
    "status",
    "address",
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updateData[field] =
        typeof data[field] === "string"
          ? data[field].trim()
          : data[field];
    }
  }

  if (data.profilePhoto !== undefined) {
    if (existingEmployee.profilePhoto && existingEmployee.profilePhoto !== data.profilePhoto) {
      await removeFileFromDisk(existingEmployee.profilePhoto);
    }
    updateData.profilePhoto = data.profilePhoto;
  }

  if (data.phone !== undefined) {
    if (!isValidIndianPhone(data.phone)) {
      throw new AppError("Please enter a valid 10-digit Indian phone number.", 400);
    }
    updateData.phone = formatIndianPhone(data.phone);
  }

  if (data.dob !== undefined) {
    updateData.dob = new Date(
      `${data.dob}T00:00:00.000Z`
    );
  }

  if (data.joiningDate !== undefined) {
    updateData.joiningDate = new Date(
      `${data.joiningDate}T00:00:00.000Z`
    );
  }

  if (data.salary !== undefined) {
    const salary = Number(data.salary);

    if (Number.isNaN(salary) || salary < 0) {
      throw new AppError("Salary must be a valid non-negative number.", 400);
    }

    updateData.salary = salary;
  }

  const employee = await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: updateData,
  });

  await invalidateEmployeeCache(employeeId, existingEmployee.userId);

  return formatEmployee(employee);
}

export async function deleteEmployee(
  userId,
  employeeId,
  role
) {
  const where = { id: employeeId };
  if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN) {
    where.userId = userId;
  }

  const existingEmployee = await prisma.employee.findFirst({
    where,
  });

  if (!existingEmployee) {
    throw new AppError("Employee not found.", 404);
  }

  // Find associated user by normalized email
  const normalizedEmail = existingEmployee.email
    ? existingEmployee.email.trim().toLowerCase()
    : null;

  let associatedUser = null;
  if (normalizedEmail) {
    associatedUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  // Prevent self-deletion if the caller is the associated user
  if (associatedUser && associatedUser.id === userId) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  // Atomically delete employee and associated user in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Delete Employee record first
    await tx.employee.delete({
      where: {
        id: employeeId,
      },
    });

    // 2. If an associated user account exists, delete only this corresponding user account
    if (associatedUser) {
      await tx.user.delete({
        where: {
          id: associatedUser.id,
        },
      });
    }
  });

  // Clean up disk files after transaction commits successfully
  if (existingEmployee.profilePhoto) {
    await removeFileFromDisk(existingEmployee.profilePhoto);
  }
  if (
    associatedUser?.profilePhoto &&
    associatedUser.profilePhoto !== existingEmployee.profilePhoto
  ) {
    await removeFileFromDisk(associatedUser.profilePhoto);
  }

  // Notify socket room if user is connected
  if (associatedUser) {
    try {
      emitToUser(associatedUser.id, "account_deleted", {
        message: "Your account has been deleted by an administrator.",
      });
    } catch (err) {
      // Ignore socket emit errors
    }
  }

  await invalidateEmployeeCache(employeeId, associatedUser ? associatedUser.id : null);

  return {
    id: employeeId,
    deletedUserId: associatedUser ? associatedUser.id : null,
    userDeleted: Boolean(associatedUser),
  };
}

export async function updateEmployeePhoto(userId, employeeId, relativePath, role) {
  const where = { id: employeeId };
  if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN) {
    where.userId = userId;
  }

  const employee = await prisma.employee.findFirst({
    where,
  });

  if (!employee) {
    throw new AppError("Employee not found.", 404);
  }

  // Remove old photo if exists
  if (employee.profilePhoto) {
    await removeFileFromDisk(employee.profilePhoto);
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: { profilePhoto: relativePath },
  });

  await invalidateEmployeeCache(employeeId, employee.userId);

  return formatEmployee(updated);
}

export async function deleteEmployeePhoto(userId, employeeId, role) {
  const where = { id: employeeId };
  if (role !== UserRole.SUPER_ADMIN && role !== UserRole.HR_ADMIN) {
    where.userId = userId;
  }

  const employee = await prisma.employee.findFirst({
    where,
  });

  if (!employee) {
    throw new AppError("Employee not found.", 404);
  }

  if (employee.profilePhoto) {
    await removeFileFromDisk(employee.profilePhoto);
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: { profilePhoto: null },
  });

  await invalidateEmployeeCache(employeeId, employee.userId);

  return formatEmployee(updated);
}

export async function updateEmployeeRole(userId, employeeId, roleToAssign, userRole) {
  // 1. Strict Super Admin Check
  if (userRole !== UserRole.SUPER_ADMIN) {
    throw new AppError("Only Super Admin can change user roles.", 403);
  }

  // 2. Allowed Target Roles: EMPLOYEE, MANAGER, HR_ADMIN
  const allowedTargetRoles = [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_ADMIN];
  const normalizedRole = String(roleToAssign).toLowerCase();
  if (!allowedTargetRoles.includes(normalizedRole)) {
    throw new AppError(`Invalid role specified. Allowed roles are: ${allowedTargetRoles.join(", ")}.`, 400);
  }

  // 3. Find Employee
  const existingEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!existingEmployee) {
    throw new AppError("Employee not found.", 404);
  }

  // 4. Find the actual associated user by email
  const normalizedEmail = existingEmployee.email
    ? existingEmployee.email.trim().toLowerCase()
    : null;

  const associatedUser = normalizedEmail
    ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
    : null;

  // Atomically update Employee and linked User (if user exists)
  const [updatedEmployee] = await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        role: normalizedRole,
        ...(associatedUser && existingEmployee.userId !== associatedUser.id
          ? { userId: associatedUser.id }
          : {}),
      },
    }),
    ...(associatedUser
      ? [
          prisma.user.update({
            where: { id: associatedUser.id },
            data: { role: normalizedRole },
          }),
        ]
      : []),
  ]);

  // 5. Notify the employee about their updated role
  try {
    const targetUserId = associatedUser?.id;

    if (targetUserId) {
      const formattedRoleName = normalizedRole
        .replace("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      await createNotification(targetUserId, {
        title: "Role Assignment Updated",
        description: `Your system role has been updated to ${formattedRoleName}.`,
        type: "employee",
      });
    }
  } catch (err) {
    console.error("Failed to dispatch role update notification:", err);
  }

  await invalidateEmployeeCache(employeeId, associatedUser?.id);

  return formatEmployee(updatedEmployee);
}
