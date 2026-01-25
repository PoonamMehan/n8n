/*
  Warnings:

  - You are about to drop the column `allowed_origins` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `authentication` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `authentication_credentials_id` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `authentication_method` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `http_method` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `no_response_body` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `production_url` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `respond` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `response_code` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `response_data` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `response_headers` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Webhook` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Webhook_path_key";

-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "allowed_origins",
DROP COLUMN "authentication",
DROP COLUMN "authentication_credentials_id",
DROP COLUMN "authentication_method",
DROP COLUMN "http_method",
DROP COLUMN "no_response_body",
DROP COLUMN "path",
DROP COLUMN "production_url",
DROP COLUMN "respond",
DROP COLUMN "response_code",
DROP COLUMN "response_data",
DROP COLUMN "response_headers",
DROP COLUMN "title";
