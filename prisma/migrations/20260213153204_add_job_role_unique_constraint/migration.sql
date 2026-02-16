/*
  Warnings:

  - A unique constraint covering the columns `[roleName,location]` on the table `JobRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobRole_roleName_location_key" ON "JobRole"("roleName", "location");
