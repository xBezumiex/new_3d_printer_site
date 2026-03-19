-- Create image_data table for storing images in PostgreSQL (no external storage needed)
CREATE TABLE IF NOT EXISTS "image_data" (
    "id"        TEXT NOT NULL,
    "data"      TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'image/jpeg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "image_data_pkey" PRIMARY KEY ("id")
);

-- Also make images.publicId optional (was required for Cloudinary, now not needed)
ALTER TABLE "images" ALTER COLUMN "publicId" SET DEFAULT '';
