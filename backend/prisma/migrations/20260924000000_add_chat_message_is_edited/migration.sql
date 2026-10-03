-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN "isEdited" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "chat_messages" ADD COLUMN "editedAt" TIMESTAMP(3);
