import Link from "next/link";
import { AllWorkflowsList } from "../../../components/AllWorkflowsList";
import { CreatDropdownComponent } from "../../../components/CreateDropdownComponent";

export default async function CredentialsOverview() {
  // fetch all the workflows & show: SSR component: 
  let allCredentialsData;
  // SSR data fetching
  try {
    const getCredentials = await fetch("http://localhost:8000/api/v1/credentials", {
      method: "GET"
    })

    if (getCredentials.ok) {
      console.log("Credentials fetching successful");
      allCredentialsData = await getCredentials.json();
      console.log("Fetched credentials: ", allCredentialsData);
    }
  } catch (err: any) {
    console.log("Something went wrong on our end while fetching the workflows: ", err.message)
  }

  return (
    <>
      {/* TODO: make this dropdown re-usable and a separate component */}
      {/* TODO: add the dropdown */}
      <div>
        <CreatDropdownComponent />

        <div>
          <div>Workflows</div>
          <Link href="/home/credentials">Credentials</Link>
        </div>

        <div>
          <AllWorkflowsList workflowsData={allCredentialsData} overview={true} />
        </div>
      </div>
    </>
  )
} 