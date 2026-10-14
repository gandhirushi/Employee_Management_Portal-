import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { validateSignup } from "../../src/middleware/validateSignup.middleware.js";

describe("Unit: validateSignup Middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test("should fail if fullName is missing or empty", () => {
    req.body = {
      email: "valid@york.ie",
      password: "Password@123",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          fullName: "Full name is required.",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if email is missing or empty", () => {
    req.body = {
      fullName: "Jane Doe",
      password: "Password@123",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          email: "Email is required.",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if email format is invalid", () => {
    req.body = {
      fullName: "Jane Doe",
      email: "not-an-email",
      password: "Password@123",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          email: "Please enter a valid email address.",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if password is shorter than 8 characters", () => {
    req.body = {
      fullName: "Jane Doe",
      email: "jane@york.ie",
      password: "Pass@1",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          password: "Password must be at least 8 characters long.",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if password has no uppercase letter", () => {
    req.body = {
      fullName: "Jane Doe",
      email: "jane@york.ie",
      password: "password@123",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          password: "Password must contain at least one uppercase letter (A-Z).",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if password has no special character", () => {
    req.body = {
      fullName: "Jane Doe",
      email: "jane@york.ie",
      password: "Password123",
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.objectContaining({
          password: "Password must contain at least one special character (e.g. !@#$%^&*).",
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should pass and call next() with valid fullName, email, and password", () => {
    req.body = {
      fullName: "Jane Doe",
      email: "jane@york.ie",
      password: "Password@123",
    };

    validateSignup(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
