import pg from "pg";

const TEST_DB_URL =
  process.env.DATABASE_URL || "postgresql://postgres:rushi@localhost:5432/york_test_db";

const DDL_STATEMENTS = `
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    "fullName" text NOT NULL,
    email text NOT NULL UNIQUE,
    "passwordHash" text,
    "avatarSeed" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "profilePhoto" text,
    "isOnboarded" boolean DEFAULT false NOT NULL,
    role text DEFAULT 'employee'::text NOT NULL,
    "authProvider" text DEFAULT 'local'::text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "googleId" text UNIQUE
);

CREATE TABLE IF NOT EXISTS public.employees (
    id text PRIMARY KEY,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    gender text NOT NULL,
    dob date NOT NULL,
    department text NOT NULL,
    "position" text NOT NULL,
    salary integer NOT NULL,
    "joiningDate" date NOT NULL,
    status text NOT NULL,
    address text NOT NULL,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "profilePhoto" text,
    role text DEFAULT 'employee'::text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.leaves (
    id text PRIMARY KEY,
    "leaveType" text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "rejectionReason" text,
    "actionDate" timestamp(3) without time zone,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "employeeId" text REFERENCES public.employees(id) ON DELETE SET NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id text PRIMARY KEY,
    "notifyEmployee" boolean DEFAULT true NOT NULL,
    "notifySystem" boolean DEFAULT true NOT NULL,
    "notifyLogin" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id text PRIMARY KEY,
    "senderId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "receiverId" text REFERENCES public.users(id) ON DELETE SET NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp(3) without time zone
);
`;

export async function initTestDatabase() {
  const client = new pg.Client({ connectionString: TEST_DB_URL });
  await client.connect();
  await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await client.query(DDL_STATEMENTS);
  await client.end();
}

export async function clearTestDatabase() {
  const client = new pg.Client({ connectionString: TEST_DB_URL });
  await client.connect();
  await client.query("TRUNCATE TABLE users, employees, leaves, notifications, user_settings, chat_messages CASCADE;");
  await client.end();
}
