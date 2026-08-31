/*
  Warnings:

  - You are about to drop the column `recipientEmail` on the `ExternalMailRequest` table. All the data in the column will be lost.
  - You are about to drop the column `recipientName` on the `ExternalMailRequest` table. All the data in the column will be lost.
  - Added the required column `recipients` to the `ExternalMailRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExternalMailDeliveryMode" AS ENUM ('BCC', 'CC', 'SEPARATE');

-- AlterTable
ALTER TABLE "ExternalMailRequest" DROP COLUMN "recipientEmail",
DROP COLUMN "recipientName",
ADD COLUMN     "deliveryMode" "ExternalMailDeliveryMode" NOT NULL DEFAULT 'BCC',
ADD COLUMN     "recipients" JSONB NOT NULL;
