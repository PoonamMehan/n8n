/*
  Warnings:

  - Added the required column `authentication` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `respond` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "authentication" TEXT NOT NULL,
ADD COLUMN     "respond" TEXT NOT NULL;
