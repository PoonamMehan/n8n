-- CreateTable
CREATE TABLE "Executions" (
    "id" TEXT NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Executions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Executions" ADD CONSTRAINT "Executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
