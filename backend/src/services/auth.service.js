import { AppError } from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import { UserRole } from "../config/roles.js";
import jwt from "jsonwebtoken";
import path from "node:path";
import fs from "node:fs/promises";
import prisma from "../prisma/client.js";
import { verifyGoogleToken } from "../config/google.js";
import { sendWelcomeEmail } from "./email.service.js";
import { cacheService } from "./cache.service.js";
import { cacheKeys, CACHE_TTL } from "../utils/cacheKeys.js";


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
    // Ignore if file does not exist
  }
}

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const DEFAULT_EMPLOYEE_CONFIG = {
  phone: process.env.DEFAULT_EMPLOYEE_PHONE || "+919999999999",
  gender: process.env.DEFAULT_EMPLOYEE_GENDER || "Not Specified",
  dob: process.env.DEFAULT_EMPLOYEE_DOB ? new Date(process.env.DEFAULT_EMPLOYEE_DOB) : new Date("2000-01-01T00:00:00.000Z"),
  department: process.env.DEFAULT_EMPLOYEE_DEPARTMENT || "General",
  position: process.env.DEFAULT_EMPLOYEE_POSITION || "Employee",
  salary: process.env.DEFAULT_EMPLOYEE_SALARY !== undefined ? Number(process.env.DEFAULT_EMPLOYEE_SALARY) : 0,
  status: process.env.DEFAULT_EMPLOYEE_STATUS || "Active",
  address: process.env.DEFAULT_EMPLOYEE_ADDRESS || "Not specified",
};

function createToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarSeed: user.avatarSeed,
    profilePhoto: user.profilePhoto || null,
    isOnboarded: user.isOnboarded,
    googleId: user.googleId || null,
    authProvider: user.authProvider || "local",
    emailVerified: user.emailVerified || false,
    createdAt: user.createdAt,
  };
}

export async function registerUser({
  fullName,
  email,
  password,
  role,
  ...employeeDetails
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
  }

  // Validate role if provided
  const validRoles = Object.values(UserRole);
  if (role && !validRoles.includes(role)) {
    throw new AppError(`Invalid role. Must be one of: ${validRoles.join(", ")}.`, 400);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const assignedRole = role || process.env.DEFAULT_USER_ROLE || UserRole.EMPLOYEE;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        avatarSeed: fullName.trim(),
        role: assignedRole,
        isOnboarded: false,
        settings: {
          create: {},
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarSeed: true,
        isOnboarded: true,
        createdAt: true,
      },
    });

    const existingEmployee = await tx.employee.findFirst({
      where: { email: normalizedEmail },
    });

    let employee;
    if (existingEmployee) {
      employee = await tx.employee.update({
        where: { id: existingEmployee.id },
        data: {
          userId: user.id,
          role: assignedRole,
          ...(employeeDetails.phone ? { phone: employeeDetails.phone } : {}),
          ...(employeeDetails.department ? { department: employeeDetails.department } : {}),
          ...(employeeDetails.position ? { position: employeeDetails.position } : {}),
        },
      });
    } else {
      employee = await tx.employee.create({
        data: {
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: employeeDetails.phone || DEFAULT_EMPLOYEE_CONFIG.phone,
          gender: employeeDetails.gender || DEFAULT_EMPLOYEE_CONFIG.gender,
          dob: employeeDetails.dob ? new Date(employeeDetails.dob) : DEFAULT_EMPLOYEE_CONFIG.dob,
          department: employeeDetails.department || DEFAULT_EMPLOYEE_CONFIG.department,
          position: employeeDetails.position || DEFAULT_EMPLOYEE_CONFIG.position,
          salary: employeeDetails.salary !== undefined ? Number(employeeDetails.salary) : DEFAULT_EMPLOYEE_CONFIG.salary,
          joiningDate: employeeDetails.joiningDate ? new Date(employeeDetails.joiningDate) : new Date(),
          status: employeeDetails.status || DEFAULT_EMPLOYEE_CONFIG.status,
          address: employeeDetails.address || DEFAULT_EMPLOYEE_CONFIG.address,
          role: assignedRole,
          profilePhoto: employeeDetails.profilePhoto || null,
        },
      });
    }

    return { user, employee };
  });

  // Send Welcome Email upon successful local registration
  // Wrapped in .catch() so email failure never blocks user signup
  sendWelcomeEmail({
    to: result.user.email,
    fullName: result.user.fullName,
    authProvider: "local",
  }).catch((err) => {
    console.error(`[EmailService] Background welcome email error for ${result.user.email}:`, err.message);
  });

  return {
    user: result.user,
    employee: result.employee,
  };
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
      throw new AppError("No account found with this email.", 401);
  }

  if (!user.passwordHash) {
      throw new AppError("This account was registered using Google. Please sign in with Google.", 400);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
      throw new AppError("Incorrect password. Please try again.", 401);
  }

  const token = createToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function getUserById(userId) {
  const cacheKey = cacheKeys.userProfile(userId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarSeed: true,
          profilePhoto: true,
          isOnboarded: true,
          googleId: true,
          authProvider: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError("User not found.", 404);
      }

      return user;
    },
    CACHE_TTL.USER_PROFILE
  );
}

export async function updateProfile(userId, data) {
  const updateData = {};

  if (data.fullName !== undefined) {
    updateData.fullName = data.fullName.trim();
    updateData.avatarSeed = data.fullName.trim();
  }

  if (data.email !== undefined) {
    updateData.email = data.email.trim().toLowerCase();
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarSeed: true,
      isOnboarded: true,
      createdAt: true,
    },
  });

  await cacheService.del(cacheKeys.userProfile(userId));

  return user;
}

export async function changePassword(userId, newPassword) {
  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
    throw new AppError("New password must be at least 6 characters long.", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });
}

export async function updateUserPhoto(userId, relativePath) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
      throw new AppError("User not found.", 404);
  }

  if (user.profilePhoto) {
    await removeFileFromDisk(user.profilePhoto);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: relativePath },
  });

  await cacheService.del(cacheKeys.userProfile(userId));

  return sanitizeUser(updated);
}

export async function deleteUserPhoto(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
      throw new AppError("User not found.", 404);
  }

  if (user.profilePhoto) {
    await removeFileFromDisk(user.profilePhoto);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: null },
  });

  await cacheService.del(cacheKeys.userProfile(userId));

  return sanitizeUser(updated);
}


export async function googleAuthService({ credential, role, ...employeeDetails }) {
  if (!credential) {
    throw new AppError("Google credential is required.", 400);
  }

  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch (err) {
    console.error("[GoogleAuth] Token verification failed:", err.message);
    throw new AppError("Invalid or expired Google authentication token.", 401);
  }

  if (!payload || !payload.email) {
    throw new AppError("Unable to retrieve email from Google account.", 400);
  }

  if (!payload.email_verified) {
    throw new AppError("Your Google email is not verified. Please verify your Google email first.", 400);
  }

  const googleId = payload.sub;
  const normalizedEmail = payload.email.trim().toLowerCase();
  const fullName = employeeDetails.fullName || (payload.name && payload.name.trim()) || normalizedEmail.split("@")[0];
  const picture = payload.picture || null;

  // 1. Search for existing user with this googleId
  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  let isNewUser = false;

  if (user) {
    // Existing Google-authenticated user logging in again
    // If user's profilePhoto is missing and Google provided a picture, update it
    if (!user.profilePhoto && picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profilePhoto: picture },
      });
    }
  } else {
    // 2. Check if an account with this email exists (e.g. registered via local email/password)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      // Link Google ID to existing account without duplicating or overwriting role/password
      user = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          googleId,
          emailVerified: true,
          profilePhoto: existingUserByEmail.profilePhoto || picture,
        },
      });
      isNewUser = false;
    } else {
      // 3. New user registration
      isNewUser = true;
      const assignedRole = role || process.env.DEFAULT_USER_ROLE || UserRole.EMPLOYEE;

      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            fullName,
            email: normalizedEmail,
            googleId,
            authProvider: "google",
            emailVerified: true,
            passwordHash: null,
            avatarSeed: fullName,
            profilePhoto: picture,
            role: assignedRole,
            isOnboarded: false,
            settings: {
              create: {},
            },
          },
        });

        const existingEmployee = await tx.employee.findFirst({
          where: { email: normalizedEmail },
        });

        let employee;
        if (existingEmployee) {
          employee = await tx.employee.update({
            where: { id: existingEmployee.id },
            data: {
              userId: newUser.id,
              role: assignedRole,
              profilePhoto: picture || existingEmployee.profilePhoto || null,
            },
          });
        } else {
          employee = await tx.employee.create({
            data: {
              userId: newUser.id,
              fullName: newUser.fullName,
              email: newUser.email,
              phone: employeeDetails.phone || DEFAULT_EMPLOYEE_CONFIG.phone,
              gender: employeeDetails.gender || DEFAULT_EMPLOYEE_CONFIG.gender,
              dob: employeeDetails.dob ? new Date(employeeDetails.dob) : DEFAULT_EMPLOYEE_CONFIG.dob,
              department: employeeDetails.department || DEFAULT_EMPLOYEE_CONFIG.department,
              position: employeeDetails.position || DEFAULT_EMPLOYEE_CONFIG.position,
              salary: employeeDetails.salary !== undefined ? Number(employeeDetails.salary) : DEFAULT_EMPLOYEE_CONFIG.salary,
              joiningDate: employeeDetails.joiningDate ? new Date(employeeDetails.joiningDate) : new Date(),
              status: employeeDetails.status || DEFAULT_EMPLOYEE_CONFIG.status,
              address: employeeDetails.address || DEFAULT_EMPLOYEE_CONFIG.address,
              role: assignedRole,
              profilePhoto: picture || employeeDetails.profilePhoto || null,
            },
          });
        }

        return { user: newUser, employee };
      });

      user = result.user;

      // Send Welcome Email ONLY when registered for the first time
      // Wrapped in .catch() so email failures never fail the login or duplicate user creation
      sendWelcomeEmail({
        to: user.email,
        fullName: user.fullName,
        authProvider: "google",
      }).catch((err) => {
        console.error(`[EmailService] Background welcome email error for ${user.email}:`, err.message);
      });
    }
  }

  const token = createToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
    isNewUser,
  };
}


