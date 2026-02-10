// redirect to /workflow/new?projectId=personal
import { redirect } from "next/navigation";

export default function WorkflowPage() {
  redirect("/home/workflows");
}