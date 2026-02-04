// Left sidebar
// "Create Workflows" (Dropdown: Create Creadentials)

// top navbar with following tabs: Workflows            Credentials
import Link from "next/link";
import { AllWorkflowsList } from "../../../components/AllWorkflowsList";
import { CreateDropdownComponent } from "../../../components/CreateDropdownComponent";

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
        <CreateDropdownComponent component="workflow"/>

        <div>
          <div>Workflows</div>
          <Link href="/home/credentials">Credentials</Link>
        </div>

        <div>
          <AllWorkflowsList workflowsData={allWorkflowsData} overview={true} />
        </div>
      </div>
    </>
  )
} 