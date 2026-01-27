// Left sidebar
// "Create Workflows" (Dropdown: Create Creadentials)

// top navbar with following tabs: Workflows            Credentials
import Link from "next/link";
import { AllWorkflowsList } from "../../../components/AllWorkflowsList";

export default async function WorkflowsOverview() {
  // fetch all the workflows & show: SSR component: 
  let allWorkflowsData;
  // SSR data fetching
  try {
    const getWorkflows = await fetch("http://localhost:8000/api/v1/workflow", {
      method: "GET"
    })

    if (getWorkflows.ok) {
      console.log("Workflows fetching successful");
      allWorkflowsData = await getWorkflows.json();
      console.log("Fetched workflows: ", allWorkflowsData);
    }
  } catch (err: any) {
    console.log("Something went wrong on our end while fetching the workflows: ", err.message)
  }

  return (
    <>
      {/* TODO: make this dropdown re-usable and a separate component */}
      {/* TODO: add the dropdown */}
      <div>
        {/* make this another cilent side component */}
        <Link href="/workflow/new?projectId=Personal">Create Workflow</Link>
        <div>
          {/* a navbar with TABS: workflows & credentials */}
          {/* 2 */}
          <div>Workflows</div>
          <Link href="/home/workflows">Credentials</Link>
        </div>
        <div>
          {/* Show all the workflows that you fetch right here  */}
          {/* A client component. Gets all the existing workflows from this component*/}
          {/* 1 */}
          <AllWorkflowsList workflowsData={allWorkflowsData} overview={true} />
        </div>
      </div>
    </>
  )
} 