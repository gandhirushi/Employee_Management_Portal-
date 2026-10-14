import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/prisma/client.js";
import { clearTestDatabase } from "../setup/db-init.js";

describe("Integration: Authentication APIs (Signup & Login)", () => {
  beforeAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
    await prisma.$disconnect();
  });

  describe("POST /api/auth/signup", () => {
    test("should successfully register a new user and create employee record with default role", async () => {
      const payload = {
        fullName: "Alex Rivera",
        email: "alex.rivera@york.ie",
        password: "SecurePassword@123",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Account created successfully.");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("alex.rivera@york.ie");
      expect(response.body.user.fullName).toBe("Alex Rivera");
      expect(response.body.user.role).toBe("employee");
      // Password hash must never leak in API response
      expect(response.body.user.passwordHash).toBeUndefined();

      // Verify the user exists in test database
      const dbUser = await prisma.user.findUnique({
        where: { email: "alex.rivera@york.ie" },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser.fullName).toBe("Alex Rivera");
    });

    test("should reject signup when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "missing.fields@york.ie",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.fullName).toBe("Full name is required.");
      expect(response.body.errors.password).toBe("Password is required.");
    });

    test("should reject signup when password is weak", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Weak User",
          email: "weak@york.ie",
          password: "weak",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.password).toBe("Password must be at least 8 characters long.");
    });

    test("should reject signup with HTTP 409 if email already exists", async () => {
      const payload = {
        fullName: "First User",
        email: "duplicate@york.ie",
        password: "Password@123",
      };

      // First registration
      const firstRes = await request(app).post("/api/auth/signup").send(payload);
      expect(firstRes.status).toBe(201);

      // Duplicate registration attempt with same email
      const secondRes = await request(app).post("/api/auth/signup").send(payload);
      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.error).toMatch(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Pre-seed an active user for login tests
      await request(app).post("/api/auth/signup").send({
        fullName: "Login Tester",
        email: "tester@york.ie",
        password: "StrongPassword@123",
      });
    });

    test("should successfully login with valid credentials and return JWT token", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "tester@york.ie",
          password: "StrongPassword@123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful.");
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(20);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("tester@york.ie");
      expect(response.body.user.role).toBe("employee");
    });

    test("should reject login with HTTP 401 when password is incorrect", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "tester@york.ie",
          password: "WrongPassword@999",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Incorrect password. Please try again.");
    });

    test("should reject login with HTTP 401 when email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@york.ie",
          password: "StrongPassword@123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("No account found with this email.");
    });

    test("should reject login with HTTP 400 when email or password is missing in body", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "tester@york.ie",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Email and password are required.");
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken;

    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({
        fullName: "Profile User",
        email: "profile@york.ie",
        password: "Password@123",
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "profile@york.ie",
        password: "Password@123",
      });

      authToken = loginRes.body.token;
    });

    test("should return current user profile when valid Bearer token is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe("profile@york.ie");
      expect(response.body.user.fullName).toBe("Profile User");
    });

    test("should reject request with HTTP 401 when token is missing", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Authentication required");
    });

    test("should reject request with HTTP 401 when token is invalid or tampered", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-tampered-token-xyz");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
