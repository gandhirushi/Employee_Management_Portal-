-- DropForeignKey constraints
ALTER TABLE "chat_messages" DROP CONSTRAINT IF EXISTS "chat_messages_conversationId_fkey";
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_participantOneId_fkey";
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_participantTwoId_fkey";
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_employeeId_fkey";

-- Drop existing indexes on chat_messages
DROP INDEX IF EXISTS "chat_messages_conversationId_createdAt_idx";
DROP INDEX IF EXISTS "chat_messages_conversationId_read_idx";

-- AlterTable: remove redundant conversationId from chat_messages
ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "conversationId";

-- DropTable: remove redundant conversations table
DROP TABLE IF EXISTS "conversations";

-- Create optimized indexes for direct 1-to-1 chat on chat_messages
CREATE INDEX IF NOT EXISTS "chat_messages_senderId_receiverId_idx" ON "chat_messages"("senderId", "receiverId");
CREATE INDEX IF NOT EXISTS "chat_messages_receiverId_read_idx" ON "chat_messages"("receiverId", "read");
CREATE INDEX IF NOT EXISTS "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");
