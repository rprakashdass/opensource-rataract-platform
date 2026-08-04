-- AlterTable: club-issued receipt fields (all nullable, additive)
ALTER TABLE "Transaction" ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "receiptDocUrl" TEXT,
ADD COLUMN     "receiptDocFileId" TEXT,
ADD COLUMN     "receiptIssuedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiptNumber_key" ON "Transaction"("receiptNumber");
