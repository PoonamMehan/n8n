/*
  Warnings:

  - A unique constraint covering the columns `[corresponding_workflow_id]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Webhook" ALTER COLUMN "authentication_method" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_corresponding_workflow_id_key" ON "Webhook"("corresponding_workflow_id");

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_corresponding_workflow_id_fkey" FOREIGN KEY ("corresponding_workflow_id") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
