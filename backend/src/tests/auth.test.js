import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { authenticate, allowRoles } from "../middleware/auth.middleware.js";
import { UserRole, normalizeRole } from "../config/roles.js";

// Utility assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

async function runTests() {
  console.log("==========================================");
  console.log("RUNNING AUTHENTICATION & RBAC TEST SUITE");
  console.log("==========================================");

  const jwtSecret = process.env.JWT_SECRET || "test-jwt-secret";
  process.env.JWT_SECRET = jwtSecret;

  // 1. TEST ROLE NORMALIZATION
  console.log("\n[1] Testing Role Normalization...");
  assert(normalizeRole("SUPER_ADMIN") === "super_admin", "SUPER_ADMIN should normalize to 'super_admin'");
  assert(normalizeRole("super_admin") === "super_admin", "super_admin should normalize to 'super_admin'");
  assert(normalizeRole("HR_ADMIN") === "hr_admin", "HR_ADMIN should normalize to 'hr_admin'");
  assert(normalizeRole("MANAGER") === "manager", "MANAGER should normalize to 'manager'");
  assert(normalizeRole("EMPLOYEE") === "employee", "EMPLOYEE should normalize to 'employee'");
  console.log("✓ Role normalization passed!");

  // 2. TEST AUTHENTICATE MIDDLEWARE WITH VALID JWT
  console.log("\n[2] Testing authenticate() middleware with valid JWT...");
  const validToken = jwt.sign({ userId: "user-123", role: "super_admin" }, jwtSecret, { expiresIn: "1h" });
  let req = { headers: { authorization: `Bearer ${validToken}` } };
  let res = {};
  let nextCalled = false;
  let nextError = null;

  authenticate(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert(nextCalled === true, "next() should be called on valid token");
  assert(nextError === undefined || nextError === null, "next() should not receive error on valid token");
  assert(req.user && req.user.id === "user-123", "req.user.id should be attached correctly");
  assert(req.user && req.user.role === "super_admin", "req.user.role should be attached correctly");
  console.log("✓ Valid JWT authentication passed!");

  // 3. TEST AUTHENTICATE MIDDLEWARE WITH MISSING / MALFORMED JWT
  console.log("\n[3] Testing authenticate() middleware with missing/invalid headers...");
  req = { headers: {} };
  nextCalled = false;
  nextError = null;

  authenticate(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert(nextCalled === true, "next() should be called with error for missing token");
  assert(nextError && nextError.statusCode === 401, "Error status code should be 401");
  assert(nextError && nextError.message === "Authentication required", "Error message should match 'Authentication required'");
  console.log("✓ Missing token handling passed!");

  // 4. TEST ALLOWROLES MIDDLEWARE - GRANTED ACCESS
  console.log("\n[4] Testing allowRoles() - Permitted Access...");
  req = { user: { id: "user-123", role: "super_admin" } };
  res = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (payload) {
      this.body = payload;
      return this;
    },
  };
  nextCalled = false;

  const superAdminOnly = allowRoles("SUPER_ADMIN");
  superAdminOnly(req, res, () => {
    nextCalled = true;
  });

  assert(nextCalled === true, "SUPER_ADMIN should be allowed by allowRoles('SUPER_ADMIN')");
  console.log("✓ Permitted role access passed!");

  // 5. TEST ALLOWROLES MIDDLEWARE - FORBIDDEN ACCESS (403 STATUS CODE & MESSAGE)
  console.log("\n[5] Testing allowRoles() - Forbidden Access (403)...");
  req = { user: { id: "user-456", role: "employee" } };
  res = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (payload) {
      this.body = payload;
      return this;
    },
  };
  nextCalled = false;

  const adminOrHr = allowRoles("SUPER_ADMIN", "HR_ADMIN");
  adminOrHr(req, res, () => {
    nextCalled = true;
  });

  assert(nextCalled === false, "EMPLOYEE should NOT be allowed by allowRoles('SUPER_ADMIN', 'HR_ADMIN')");
  assert(res.statusCode === 403, "Response status code should be 403 Forbidden");
  assert(res.body && res.body.success === false, "Response body success should be false");
  assert(
    res.body && res.body.message === "You do not have permission to perform this action",
    "Response body message should match exact requirement"
  );
  console.log("✓ Forbidden 403 handling passed!");

  // 6. TEST MULTIPLE ROLES SUPPORT
  console.log("\n[6] Testing allowRoles() with multiple roles...");
  req = { user: { id: "user-789", role: "hr_admin" } };
  nextCalled = false;

  adminOrHr(req, res, () => {
    nextCalled = true;
  });

  assert(nextCalled === true, "HR_ADMIN should be allowed by allowRoles('SUPER_ADMIN', 'HR_ADMIN')");
  console.log("✓ Multiple allowed roles passed!");

  console.log("\n==========================================");
  console.log("ALL AUTH & RBAC VERIFICATION TESTS PASSED!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
