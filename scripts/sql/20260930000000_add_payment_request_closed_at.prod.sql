-- ============================================================================
--  Payment request: close / reopen
--  Migration: 20260930000000_add_payment_request_closed_at
--
--  Adds PaymentRequest.closedAt / closedBy. A closed request drops off members'
--  action lists, its pay page shows a closed notice instead of the form, and
--  notifications refuse to send. Nothing is deleted and the close is reversible
--  (closedAt back to NULL), so this is additive and safe on a live database.
--
--  Run directly on prod:
--      psql "$DATABASE_URL" -f scripts/sql/20260930000000_add_payment_request_closed_at.prod.sql
--  (or paste the whole file into the Supabase SQL editor)
--
--  Safe to run more than once — every statement is guarded.
--  Takes only a brief ACCESS EXCLUSIVE lock: both columns are nullable with no
--  default, so Postgres rewrites no rows regardless of table size.
-- ============================================================================

BEGIN;

-- 1. The columns -------------------------------------------------------------
ALTER TABLE "PaymentRequest"
  ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closedBy" TEXT;

-- 2. Tell Prisma this migration is already applied ---------------------------
-- `npm run build` runs `prisma migrate deploy`. Without this row the next
-- deploy replays the migration and fails on the existing columns. The checksum
-- is the SHA-256 of prisma/migrations/20260930000000_add_payment_request_closed_at/migration.sql
-- — if that file is ever edited, recompute it with:
--     shasum -a 256 prisma/migrations/20260930000000_add_payment_request_closed_at/migration.sql
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NULL THEN
    RAISE NOTICE '_prisma_migrations not found — skipping bookkeeping (this DB is not managed by prisma migrate).';
  ELSE
    INSERT INTO "_prisma_migrations" (
      id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
    )
    SELECT
      gen_random_uuid()::text,
      '3c93437f8419c8a72c78b2f2b70acf46a545278969299b3bc00af2b83ff90747',
      now(),
      '20260930000000_add_payment_request_closed_at',
      NULL::text,        -- logs
      NULL::timestamptz, -- rolled_back_at
      now(),
      1
    WHERE NOT EXISTS (
      SELECT 1 FROM "_prisma_migrations"
      WHERE migration_name = '20260930000000_add_payment_request_closed_at'
    );
  END IF;
END
$$;

COMMIT;

-- 3. Verify ------------------------------------------------------------------
-- Expect two rows: closedAt (timestamp without time zone, nullable) and
-- closedBy (text, nullable).
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'PaymentRequest'
  AND column_name IN ('closedAt', 'closedBy')
ORDER BY column_name;

-- Expect exactly one row, applied_steps_count = 1, rolled_back_at NULL.
SELECT migration_name, finished_at, applied_steps_count, rolled_back_at
FROM "_prisma_migrations"
WHERE migration_name = '20260930000000_add_payment_request_closed_at';


-- ============================================================================
--  Rollback (only if you need to undo — this DROPS which requests were closed)
-- ============================================================================
-- BEGIN;
-- ALTER TABLE "PaymentRequest" DROP COLUMN IF EXISTS "closedAt";
-- ALTER TABLE "PaymentRequest" DROP COLUMN IF EXISTS "closedBy";
-- DELETE FROM "_prisma_migrations"
--  WHERE migration_name = '20260930000000_add_payment_request_closed_at';
-- COMMIT;
