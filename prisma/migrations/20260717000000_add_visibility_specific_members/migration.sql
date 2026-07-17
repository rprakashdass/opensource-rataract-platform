-- Fix schema drift: schema.prisma declares Visibility.SPECIFIC_MEMBERS but
-- the enum was created without it, causing every announcement create/update
-- with that visibility to fail with P2007 "invalid input value for enum".
ALTER TYPE "Visibility" ADD VALUE 'SPECIFIC_MEMBERS';
