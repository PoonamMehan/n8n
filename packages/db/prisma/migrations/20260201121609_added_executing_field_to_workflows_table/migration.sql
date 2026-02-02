/*
  Warnings:

  - Added the required column `executing` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "executing" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "executing" BOOLEAN NOT NULL DEFAULT false;
