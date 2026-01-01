/*
  Warnings:

  - The values [PATCH,DELETE,HEAD] on the enum `AllWebhookMethods` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `header` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `secret` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the `Available_Actions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Available_Credential_Apps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Available_Triggers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authentication_method` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `production_url` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AllWebhookMethods_new" AS ENUM ('GET', 'POST', 'PUT');
ALTER TABLE "public"."Webhook" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "Webhook"
DROP COLUMN "method",
ADD COLUMN IF NOT EXISTS "http_method" "AllWebhookMethods_new" NOT NULL DEFAULT 'POST';
-- ALTER TABLE "Webhook" ALTER COLUMN "http_method" TYPE "AllWebhookMethods_new" USING ("http_method"::text::"AllWebhookMethods_new");
ALTER TYPE "AllWebhookMethods" RENAME TO "AllWebhookMethods_old";
ALTER TYPE "AllWebhookMethods_new" RENAME TO "AllWebhookMethods";
DROP TYPE "public"."AllWebhookMethods_old";
COMMIT;

-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "header",
DROP COLUMN "secret",
ADD COLUMN     "allowed_origins" JSONB,
ADD COLUMN     "authentication_credentials_id" INTEGER,
ADD COLUMN     "authentication_method" TEXT NOT NULL,
ADD COLUMN     "no_response_body" BOOLEAN,
ADD COLUMN     "production_url" TEXT NOT NULL,
ADD COLUMN     "response_code" INTEGER,
ADD COLUMN     "response_data" JSONB,
ADD COLUMN     "response_headers" JSONB;
-- ADD COLUMN     "http_method" "AllWebhookMethods" NOT NULL DEFAULT 'POST',


-- DropTable
DROP TABLE "public"."Available_Actions";

-- DropTable
DROP TABLE "public"."Available_Credential_Apps";

-- DropTable
DROP TABLE "public"."Available_Triggers";