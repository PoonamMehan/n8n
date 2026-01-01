/*
  Warnings:

  - Added the required column `description` to the `Available_Triggers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Available_Triggers" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Credentials" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
