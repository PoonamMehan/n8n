// Left sidebar
// "Create Workflows" (Dropdown: Create Creadentials)

// top navbar with following tabs: Workflows            Credentials
import Link from "next/link";
import { AllWorkflowsList } from "../../../components/AllWorkflowsList";
import { CreateDropdownComponent } from "../../../components/CreateDropdownComponent";
import { cookies } from "next/headers";

export default async function WorkflowsOverview() {
  // fetch all the workflows & show: SSR component: 
  let allWorkflowsData;
  const cookieStore = await cookies();

  // SSR data fetching
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
  }

  return (
    <>
      {/* TODO: make this dropdown re-usable and a separate component */}
      {/* TODO: add the dropdown */}
      <div>
        <CreateDropdownComponent component="workflow" />

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