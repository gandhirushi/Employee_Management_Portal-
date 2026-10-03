-- CreateIndex for fast role lookups and role-targeted notifications
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- CreateIndex for employee department filtering
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "employees"("department");

-- CreateIndex for employee status filtering
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "employees"("status");

-- CreateIndex for employee default creation date sorting
CREATE INDEX IF NOT EXISTS "employees_createdAt_idx" ON "employees"("createdAt");

-- CreateIndex for composite leave status and date sorting
CREATE INDEX IF NOT EXISTS "leaves_status_createdAt_idx" ON "leaves"("status", "createdAt");
