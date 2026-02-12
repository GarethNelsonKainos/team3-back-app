/*
  Warnings:

  - You are about to drop the column `sharePointUrl` on the `JobRole` table. All the data in the column will be lost.
  - Added the required column `sharepointUrl` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `statusName` on the `Status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "sharePointUrl",
ADD COLUMN     "sharepointUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "statusName",
ADD COLUMN     "statusName" TEXT NOT NULL;

-- DropEnum
DROP TYPE "statusEnum";

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
