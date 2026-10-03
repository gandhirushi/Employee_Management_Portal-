import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Standardized rate-limit error handler.
 */
function createRateLimitHandler(customMessage) {
  return (req, res, _next, options) => {
    const retryAfterSeconds = Math.ceil(options.windowMs / 1000);
    const message = customMessage || options.message || "Too many requests. Please try again later.";

    res.status(options.statusCode || 429).json({
      success: false,
      error: message,
      retryAfter: retryAfterSeconds,
    });
  };
}

/**
 * Key generator for authenticated routes:
 * Prefers req.user.id, falls back to IP.
 */
function userOrIpKeyGenerator(req) {
  return req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(req);
}

/**
 * Rate Limiter Factory
 * Consolidates standard headers and error handling while accepting custom overrides.
 *
 * @param {Object} config - Limiter configuration
 * @param {number} config.windowMs - Time window in milliseconds
 * @param {number} config.limit - Maximum number of requests within the window
 * @param {string} [config.message] - Custom error response message
 * @param {boolean} [config.useUserKey=false] - Whether to key by User ID (falls back to IP)
 * @param {Object} [config.extraOptions={}] - Any additional express-rate-limit options
 */
function createLimiter({
  windowMs,
  limit,
  message,
  useUserKey = false,
  ...extraOptions
}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: createRateLimitHandler(message),
    ...(useUserKey && {
      keyGenerator: userOrIpKeyGenerator,
      validate: { keyGeneratorIpFallback: false },
    }),
    ...extraOptions,
  });
}

// ---------------------------------------------------------------------------
// Rate Limiter Instances
// ---------------------------------------------------------------------------

// 1. Global Safety Net Limiter (1000 req / 15 min per IP)
export const globalRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: "Too many requests from this IP. Please try again after 15 minutes.",
});

// 2. Login Limiter (5 failed attempts / 15 min per IP)
export const loginRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many failed login attempts. Please try again after 15 minutes.",
  skipSuccessfulRequests: true,
});

// 3. Signup & OAuth Limiter (5 registrations / 1 hr per IP)
export const signupRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many account creation attempts from this IP. Please try again after an hour.",
});

// 4. Password Reset / Change Limiter (5 attempts / 15 min per user)
export const passwordResetRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many password update attempts. Please try again after 15 minutes.",
  useUserKey: true,
});

// 5. Authenticated API Limiter (300 req / 15 min per user)
export const authenticatedApiRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "Too many requests. Please slow down and try again shortly.",
  useUserKey: true,
});