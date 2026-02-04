import Link from "next/link";
import { AllCredentialsList } from "../../../components/AllCredentialsList";
import { CreateDropdownComponent } from "../../../components/CreateDropdownComponent";
import { CreateCredentialModal } from "../../../components/CreateCredentialModal"

export default async function CredentialsOverview({searchParams}: {searchParams: {modal: string}}) {
  // fetch all the workflows & show: SSR component: 
  let allCredentialsData;
  const modal = searchParams.modal;
  let openSearchBar = false;
  if(modal == "create"){
    openSearchBar = true;
  }
  
  // SSR data fetching
  try {
    const getCredentials = await fetch("http://localhost:8000/api/v1/credentials", {
      method: "GET"
    })

    if (!getCredentials.ok) {
      //toaster: 
      // credentials not fetched
    }
    console.log("Credentials fetching successful");
    allCredentialsData = await getCredentials.json();
    console.log("Fetched credentials: ", allCredentialsData);
    
  } catch (err: any) {
    console.log("Something went wrong on our end while fetching the workflows: ", err.message)
  }

  return (
    <>
      {/* TODO: make this dropdown re-usable and a separate component */}
      {/* TODO: add the dropdown */}
      <div>
        <CreateDropdownComponent component="credentials"/>

        <div>
          <div>
            <Link href="/home/workflows">Workflows</Link>
            <div>Credentials</div>
          </div>
        </div>

        <div>
          <AllCredentialsList credentialsData={allCredentialsData} overview={true} />
        </div>
      </div>
      {openSearchBar && <CreateCredentialModal allCredentials={allCredentialsData}/>}
    </>
  )
} 