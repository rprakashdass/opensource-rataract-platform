-- AlterTable: promote report-natural fields to first-class event columns
ALTER TABLE "Event" ADD COLUMN "beneficiaries" TEXT,
ADD COLUMN "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[];
