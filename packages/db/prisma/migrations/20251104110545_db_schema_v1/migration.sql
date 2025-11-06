-- CreateEnum
CREATE TYPE "AllWebhookMethods" AS ENUM ('GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD');

-- CreateTable
CREATE TABLE "Workflow" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "method" "AllWebhookMethods" NOT NULL DEFAULT 'POST',
    "path" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "corresponding_workflow_id" INTEGER NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credentials" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Available_Triggers" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,

    CONSTRAINT "Available_Triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Available_Actions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,

    CONSTRAINT "Available_Actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Available_Credential_Apps" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,

    CONSTRAINT "Available_Credential_Apps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_title_key" ON "Workflow"("title");
