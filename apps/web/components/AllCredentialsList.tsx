'use client';
import { Available_Credential_Apps } from "@/app/workflow/[...id]/Available_Credentials";
import type { AllCredentialsData } from "@/app/home/credentials/page";
import { TriggerIconMap } from "@/app/workflow/[...id]/NodeIcons";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const AllCredentialsList = ({ allCredentialsData }: { allCredentialsData: AllCredentialsData[] }) => {

  const router = useRouter();
  const deleteCredential = async (credId: number) => {
    try {
      if (!credId) {
        console.log("No credential id provided");
        toast.error("Could not delete credential.");
        return;
      }

      const deleteCredential = await fetch(`/api/v1/credential/${credId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const deleteCredentialData = await deleteCredential.json();

      if (!deleteCredential.ok) {
        console.log("Bad result while deleting the credential: ", deleteCredentialData)
        toast.error("Could not delete credential.");
        return;
      }
      if (deleteCredentialData.success) {
        toast.success("Credential deleted successfully.");
        router.refresh();
      } else {
        toast.error("Could not delete credential.");
        console.log("Could not delete credential: ", deleteCredentialData)
      }
    } catch (err: any) {
      console.log("Something went wrong on our end while deleting the credential: ", err.message)
      toast.error("Could not delete credential.");
    }
  }

  return (
    <>
      {allCredentialsData.map((cred) => {
        return (
          <div key={cred.id} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/home/credentials?credId=${cred.id}`);
          }}>

            <div>
              <div>{TriggerIconMap[cred.platform]}</div>
              <div>
                <div>{cred.data.name}</div>
                <div>
                  <span>{cred.platform} | </span>
                  <span>Created {new Date(cred.createdAt).toISOString().split("T")[0]}</span>
                </div>
              </div>
            </div>

            <button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Deleting credential: ", cred.id, " ", cred.data.name);
              deleteCredential(cred.id);
            }}><TrashIcon className="h-5 w-5" /></button>
          </div>
        )
      })}
    </>
  )
}