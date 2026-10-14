import dotenv from "dotenv";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:rushi@localhost:5432/york_test_db";
process.env.JWT_SECRET = "test-super-secret-jwt-key-for-testing-only-12345";
process.env.REDIS_ENABLED = "false";
process.env.BCRYPT_SALT_ROUNDS = "4";

dotenv.config({ path: ".env.test", override: true });
