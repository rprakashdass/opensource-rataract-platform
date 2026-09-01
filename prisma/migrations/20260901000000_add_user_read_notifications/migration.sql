-- This column already exists on the live database (added out-of-band before
-- this migration was written). This file documents it for migration history
-- and fresh-database setups; it is marked as already-applied via
-- `prisma migrate resolve --applied` rather than executed against the main DB.
ALTER TABLE "User" ADD COLUMN "readNotifications" TEXT[] DEFAULT ARRAY[]::TEXT[];
