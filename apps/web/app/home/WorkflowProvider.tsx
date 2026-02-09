'use client'
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setWorkflowsAndCredentials, removeWorkflowsAndCredentials } from "../ReduxStore/features/workflows/workflowsSlice";
import { setLoggedOut } from "../ReduxStore/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const WorkflowProvider = ({ workflowsData, credentialsData, error, children }: { workflowsData: any, credentialsData: any, error: { status: number, error: string } | null, children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!error) {
      dispatch(setWorkflowsAndCredentials({ workflows: workflowsData, credentials: credentialsData }));
    } else {
      // check status: 600, 500(make user refresh), 400(login again)
      if (error.status == 400) {
        dispatch(setLoggedOut());
        dispatch(removeWorkflowsAndCredentials());
        router.push('/');
        router.refresh();
        toast.error(error.error)
      } else {
        toast.error(error.error);
      }
    }
  }, [workflowsData, credentialsData, error, dispatch])

  return (
    <>
      {children}
    </>
  )
}