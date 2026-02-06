import { AllWorkflowsList } from "../../../components/AllWorkflowsList";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { cookies } from "next/headers";

export default async function WorkflowsOverview() {
  let allWorkflowsData;
  const cookieStore = await cookies();

  try {
    const getWorkflows = await fetch("http://localhost:8000/api/v1/workflow", {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString()
      }
    })

    if (getWorkflows.ok) {
      console.log("Workflows fetching successful");
      allWorkflowsData = (await getWorkflows.json()).data;
      console.log("Fetched workflows: ", allWorkflowsData);
    }
    else {
      console.log("Workflows fetching failed");
      allWorkflowsData = [];
    }
  } catch (err: any) {
    console.log("Something went wrong on our end while fetching the workflows: ", err.message)
    allWorkflowsData = [];
  }

  return (
    <DashboardLayout activeTab="workflows">
      <AllWorkflowsList workflowsData={allWorkflowsData} overview={true} />
    </DashboardLayout>
  )
}