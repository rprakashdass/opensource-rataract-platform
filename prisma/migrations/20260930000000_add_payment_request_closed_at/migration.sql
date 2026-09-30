-- AlterTable
ALTER TABLE "PaymentRequest" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedBy" TEXT;
