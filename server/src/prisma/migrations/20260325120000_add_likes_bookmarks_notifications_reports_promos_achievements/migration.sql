-- Migration: Add likes, bookmarks, notifications, reports, promo codes, order timeline, achievements

-- NotificationType enum
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('NEW_FOLLOWER', 'POST_LIKED', 'POST_COMMENTED', 'ORDER_STATUS_CHANGED', 'ACHIEVEMENT_EARNED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AchievementType enum
DO $$ BEGIN
  CREATE TYPE "AchievementType" AS ENUM ('FIRST_POST', 'TEN_POSTS', 'FIRST_FOLLOWER_TEN', 'FIRST_ORDER', 'POPULAR_POST', 'PROFILE_COMPLETE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PostLike table
CREATE TABLE IF NOT EXISTS "post_likes" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "postId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "post_likes_userId_postId_key" UNIQUE ("userId", "postId")
);

CREATE INDEX IF NOT EXISTS "post_likes_userId_idx" ON "post_likes"("userId");
CREATE INDEX IF NOT EXISTS "post_likes_postId_idx" ON "post_likes"("postId");

ALTER TABLE "post_likes" DROP CONSTRAINT IF EXISTS "post_likes_userId_fkey";
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_likes" DROP CONSTRAINT IF EXISTS "post_likes_postId_fkey";
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bookmark table
CREATE TABLE IF NOT EXISTS "bookmarks" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "postId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bookmarks_userId_postId_key" UNIQUE ("userId", "postId")
);

CREATE INDEX IF NOT EXISTS "bookmarks_userId_idx" ON "bookmarks"("userId");
CREATE INDEX IF NOT EXISTS "bookmarks_postId_idx" ON "bookmarks"("postId");

ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_userId_fkey";
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_postId_fkey";
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "type"      "NotificationType" NOT NULL,
  "message"   TEXT NOT NULL,
  "link"      TEXT,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_userId_fkey";
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Report table
CREATE TABLE IF NOT EXISTS "reports" (
  "id"         TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId"   TEXT NOT NULL,
  "reason"     TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reports_reporterId_idx" ON "reports"("reporterId");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports"("status");

ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_reporterId_fkey";
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PromoCode table
CREATE TABLE IF NOT EXISTS "promo_codes" (
  "id"        TEXT NOT NULL,
  "code"      TEXT NOT NULL,
  "discount"  DOUBLE PRECISION NOT NULL,
  "maxUses"   INTEGER NOT NULL DEFAULT 100,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "promo_codes_code_key" UNIQUE ("code")
);

-- OrderEvent table
CREATE TABLE IF NOT EXISTS "order_events" (
  "id"        TEXT NOT NULL,
  "orderId"   TEXT NOT NULL,
  "status"    "OrderStatus" NOT NULL,
  "note"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "order_events_orderId_idx" ON "order_events"("orderId");

ALTER TABLE "order_events" DROP CONSTRAINT IF EXISTS "order_events_orderId_fkey";
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Achievement table
CREATE TABLE IF NOT EXISTS "achievements" (
  "id"       TEXT NOT NULL,
  "userId"   TEXT NOT NULL,
  "type"     "AchievementType" NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "achievements_userId_type_key" UNIQUE ("userId", "type")
);

CREATE INDEX IF NOT EXISTS "achievements_userId_idx" ON "achievements"("userId");

ALTER TABLE "achievements" DROP CONSTRAINT IF EXISTS "achievements_userId_fkey";
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
