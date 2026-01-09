// Left sidebar
// "Create Workflows" (Dropdown: Create Creadentials)

// top navbar with following tabs: Workflows            Credentials
import Link from "next/link";
import { AllWorkflowsList } from "../../../components/AllWorkflowsList";

export async function WorkflowsOverview(){
  // fetch all the workflows & show: SSR component: 
  let allWorkflowsData;

  try{
    const getWorkflows = await fetch("/api/v1/workflow", {
    method: "GET"
  })
  //send the number of workflows to the "createNewWorkflow" component.
  if(getWorkflows.ok){
    console.log("Workflows fetching successful");
    allWorkflowsData = await getWorkflows.json();
    console.log("Fetched workflows: ", allWorkflowsData);
  }
  }catch(err: any){
    //taoster: unable to fetch workflws right now 
    // disable the two create buttons
    //ask the user to refresh this component
    console.log("Something went wrong on our end while fetching the workflows: ", err.message)
  }

  return(
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
          <AllWorkflowsList workflowsData={allWorkflowsData} overview={true}/>
        </div>
      </div>
    </>
  )
} 