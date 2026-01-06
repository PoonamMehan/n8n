// Left sidebar
// "Create Workflows" (Dropdown: Create Creadentials)

// top navbar with following tabs: Workflows            Credentials
import Link from "next/link";

export async function WorkflowsOverview(){

  return(
    <>  
      {/* TODO: make this dropdown re-usable and a separate component */}
      {/* TODO: add the dropdown */}
      <div>
        <Link href="/workflow/new?projectId=Personal">Create Workflow</Link>
      </div>
    </>
  )
} 