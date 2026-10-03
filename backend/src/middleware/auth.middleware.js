import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { normalizeRole } from "../config/roles.js";

/**
 * Reusable Authentication Middleware
 * Reads JWT from Authorization Bearer header, verifies it, and attaches req.user
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authentication required", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Invalid authentication token", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId,
      role: normalizeRole(decoded.role) || null,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Reusable Role-Based Access Control (RBAC) Middleware
 * @param {...string} roles - Permitted roles (e.g. "SUPER_ADMIN", "HR_ADMIN", "super_admin")
 */
export function allowRoles(...roles) {
  const normalizedAllowedRoles = roles.map((r) => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

// Aliases for backwards compatibility across existing imports
export const requireAuth = authenticate;
export const authorize = allowRoles;