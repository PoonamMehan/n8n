'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setWorkflowsAndCredentials, removeWorkflowsAndCredentials } from "../ReduxStore/features/workflows/workflowsSlice";
import { setLoggedOut } from "../ReduxStore/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RootState } from "../ReduxStore/store";

export const WorkflowProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const workflows = useSelector((state: RootState) => state.workflow.workflows);
  const credentials = useSelector((state: RootState) => state.workflow.credentials);

  useEffect(() => {
    // If Redux already has data, skip fetching (user navigated back to /home)
    if (workflows.length > 0 || credentials.length > 0) return;

    const fetchData = async () => {
      try {
        const [workflowsRes, credentialsRes] = await Promise.all([
          fetch('/api/v1/workflow', {
            method: 'GET',
            credentials: 'include'
          }),
          fetch('/api/v1/credential', {
            method: 'GET',
            credentials: 'include'
          })
        ]);

        if (!workflowsRes.ok || !credentialsRes.ok) {
          if (workflowsRes.status >= 400 && workflowsRes.status < 500) {
            dispatch(setLoggedOut());
            dispatch(removeWorkflowsAndCredentials());
            router.push('/');
            router.refresh();
            toast.error("Unauthorized. Please login again to continue.");
          } else {
            toast.error("Internal Server Error. Please try again later.");
          }
          return;
        }

        const workflowsJson = await workflowsRes.json();
        const credentialsJson = await credentialsRes.json();

        const workflowsData = (workflowsJson.data || []).map((workflow: any) => ({
          id: workflow.id,
          title: workflow.title,
          updatedAt: workflow.updatedAt,
          executing: workflow.executing
        }));

        const credentialsData = (credentialsJson || []).map((credential: any) => ({
          id: credential.id,
          title: credential.title,
          platform: credential.platform,
          createdAt: credential.updatedAt,
          data: { name: credential.data.name }
        }));

        dispatch(setWorkflowsAndCredentials({ workflows: workflowsData, credentials: credentialsData }));

      } catch (err: any) {
        console.log("Error fetching workflows and credentials:", err.message);
        toast.error("Error fetching data. Please refresh the page to try again!");
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {children}
    </>
  )
}