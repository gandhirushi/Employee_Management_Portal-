export default {
  testEnvironment: "node",
  transform: {},
  setupFiles: ["<rootDir>/tests/setup/env.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  testTimeout: 15000,
};
