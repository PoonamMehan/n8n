/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "path" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_path_key" ON "Webhook"("path");
