-- AlterTable: добавляем lastActivity к пользователям
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- CreateTable: блокировки
CREATE TABLE IF NOT EXISTS "blocks" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: сообщения
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "blocks_blockerId_blockedId_key" ON "blocks"("blockerId", "blockedId");
CREATE INDEX IF NOT EXISTS "blocks_blockerId_idx" ON "blocks"("blockerId");
CREATE INDEX IF NOT EXISTS "blocks_blockedId_idx" ON "blocks"("blockedId");
CREATE INDEX IF NOT EXISTS "messages_senderId_receiverId_idx" ON "messages"("senderId", "receiverId");
CREATE INDEX IF NOT EXISTS "messages_receiverId_isRead_idx" ON "messages"("receiverId", "isRead");

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockerId_fkey"
    FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockedId_fkey"
    FOREIGN KEY ("blockedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
