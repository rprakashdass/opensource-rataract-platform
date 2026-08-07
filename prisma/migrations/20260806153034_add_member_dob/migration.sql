-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "objectives" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
