/*
  Warnings:

  - You are about to drop the column `sharepointUrl` on the `JobRole` table. All the data in the column will be lost.
  - Added the required column `sharePointUrl` to the `JobRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "sharepointUrl",
ADD COLUMN     "sharePointUrl" TEXT NOT NULL;
