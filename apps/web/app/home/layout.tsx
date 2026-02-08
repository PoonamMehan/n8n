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


  const [workflows, credentials] = await Promise.all([
    fetch('http://localhost:8000/api/v1/workflow', {
      method: 'GET',
      headers: {
        Cookie: cookieStore.toString()
      }
    }),
    fetch('http://localhost:8000/api/v1/credential', {
      method: 'GET',
      headers: {
        Cookie: cookieStore.toString()
      }
    })
  ]);

  const workflowsData = await workflows.json();
  const credentialsData = await credentials.json();

  return (
    <>
      <WorkflowProvider workflowsData={workflowsData} credentialsData={credentialsData}>
        {children}
      </WorkflowProvider>
    </>
  )
}
