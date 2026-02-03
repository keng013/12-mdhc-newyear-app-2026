/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkedInAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_employeeId_key" ON "Participant"("employeeId");
