/*
  Warnings:

  - Changed the type of `statusName` on the `Status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "statusEnum" AS ENUM ('Open', 'Closed');

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "statusName",
ADD COLUMN     "statusName" "statusEnum" NOT NULL;
