// fetch the workflows and credentials (not full things, just the ids, name to show in list)
// save the credentials & workflows in the redux store
// access them from the store directly

// when new workflow created, update the workflows in the store -> optimistic addition -> if db insertion failed, rollback the store update

// the workflow when opened -> fetch the full worklfow data from the db 
// when credential opens -> fetch from the db? 
import { cookies } from "next/headers";
import { WorkflowProvider } from './WorkflowProvider';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies();

  let workflowsData = [];
  let credentialsData = [];
  let error = null;

  try {
    const [workflows, credentials] = await Promise.all([
      fetch('http://localhost:8000/api/v1/workflow', {
        method: 'GET',
        headers: {
          Cookie: cookieStore.toString()
        },
        cache: 'no-store'
      }),
      fetch('http://localhost:8000/api/v1/credential', {
        method: 'GET',
        headers: {
          Cookie: cookieStore.toString()
        },
        cache: 'no-store'
      })
    ]);

    if (!workflows.ok || !credentials.ok) {
      //for 400 maybe un authorized -> log out -> redirect to '/'
      if (workflows.status >= 400 && workflows.status < 500) {
        error = { status: 400, error: "Unauthorized. Please login again to continue." };
      } else {
        error = { status: 500, error: "Internal Server Error. Please try again later." };
      }
      //for 500 maybe internal server error -> ask the user to try refreshing the page
    } else {
      const workflowsJson = await workflows.json();
      const credentialsJson = await credentials.json();

      const workflowsVerboseData = workflowsJson.data || [];
      const credentialsVerboseData = credentialsJson || [];

      workflowsData = workflowsVerboseData.map((workflow: any) => ({ id: workflow.id, title: workflow.title, updatedAt: workflow.updatedAt, executing: workflow.executing }));
      credentialsData = credentialsVerboseData;

      console.log("Fetched Workflows: ", workflowsData)
      console.log("Fetched Credentials: ", credentialsData)
    }

  } catch (err: any) {
    console.log()
    //send error to WorkflowProvider
    error = { status: 600, error: "Error fetching workflows and credentials. Please refresh the page to try again!" }
  }


  return (
    <>
      <WorkflowProvider workflowsData={workflowsData} credentialsData={credentialsData} error={error}>
        {children}
      </WorkflowProvider>
    </>
  )
}
