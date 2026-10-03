import { Prisma } from "@prisma/client";
import multer from "multer";

// Centralized error handler — this single middleware handles ALL errors

export function errorHandler(err, req, res, next) {
  // ── 1. Log the error for debugging ──────────────────────────
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // ── 2. Default values ──────────────────────────────────────
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";
  let errors = null; // For validation-style errors with multiple fields

  // ── 3. Handle specific error types ─────────────────────────

  // ─── 3a. Prisma Known Request Errors (bad queries, constraints) ───
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // Unique constraint violation (e.g., duplicate email)
        statusCode = 409;
        const field = err.meta?.target?.[0] || "field";
        message = `A record with this ${field} already exists.`;
        break;

      case "P2025":
        // Record not found (e.g., updating a deleted employee)
        statusCode = 404;
        message = "The requested record was not found.";
        break;

      case "P2003":
        // Foreign key constraint failed
        statusCode = 400;
        message = "This operation references a record that does not exist.";
        break;

      default:
        statusCode = 400;
        message = "A database error occurred.";
    }
  }

  // ─── 3b. Prisma Validation Errors (wrong data types, etc.) ───
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided. Please check your input.";
  }

  // ─── 3c. Multer Errors (file upload issues) ───
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File is too large. Maximum size is 5 MB.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field. Please use the correct field name.";
        break;
      default:
        message = `File upload error: ${err.message}`;
    }
  }

  // ─── 3d. JWT Errors (from jsonwebtoken package) ───
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired. Please log in again.";
  }

  // ─── 3e. JSON Syntax Error (malformed request body) ───
  else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body.";
  }

  // ─── 3f. Your AppError or manual errors with statusCode ───
  // (These already have the correct statusCode and message — no changes needed)

  // ─── 3g. Unexpected/Unknown Errors (programming bugs) ───
  else if (!err.isOperational && statusCode === 500) {
    // In production, don't leak internal error details
    message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : message;
  }

  // ── 4. Send the response ───────────────────────────────────
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }), // Include field-level errors if present
  });
}