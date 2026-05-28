-- CreateEnum
CREATE TYPE "AssessmentInitiator" AS ENUM ('WORKER', 'ASSESSOR');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "initiatedBy" "AssessmentInitiator" NOT NULL DEFAULT 'ASSESSOR',
ADD COLUMN     "submittedAt" TIMESTAMP(3);
