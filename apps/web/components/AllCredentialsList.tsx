'use client';
import { Available_Credential_Apps } from "@/app/workflow/[...id]/Available_Credentials";
import type { AllCredentialsData } from "@/app/home/credentials/page";
import { TriggerIconMap } from "@/app/workflow/[...id]/NodeIcons";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export const AllCredentialsList = ({allCredentialsData}: {allCredentialsData: AllCredentialsData[]}) => {
  
  const router = useRouter();
  const deleteCredential = (credId: number) => {
    try{

    }catch(err: any){
      
    }
  }

  return (
    <>
      {allCredentialsData.map((cred)=>{
        return (
          <div key={cred.id} onClick={(e)=>{
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
                  <span>Created {cred.createdAt.toISOString().split("T")[0]}</span>
                </div>
              </div>
            </div>

            <button onClick={(e)=>{
              e.preventDefault();
              e.stopPropagation();
              deleteCredential(cred.id);
            }}><TrashIcon className="h-5 w-5" /></button>
          </div>
        )
      })}
    </>
  )
}