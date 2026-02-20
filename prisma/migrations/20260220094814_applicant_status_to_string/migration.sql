/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `cvKey` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,jobRoleId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cvUrl` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "createdAt",
DROP COLUMN "cvKey",
DROP COLUMN "status",
ADD COLUMN     "applicationStatus" TEXT NOT NULL DEFAULT 'InProgress',
ADD COLUMN     "cvUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobRoleId_key" ON "Application"("userId", "jobRoleId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("jobRoleId") ON DELETE RESTRICT ON UPDATE CASCADE;
