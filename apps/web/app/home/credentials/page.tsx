import { AllCredentialsList } from "../../../components/AllCredentialsList";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { CreateCredentialModal } from "../../../components/CreateCredentialModal";
import { UpdateCredentialModal } from "../../../components/UpdateCredentialModal";
import { cookies } from "next/headers";

export interface AllCredentialsData {
  id: number;
  userId: string;
  data: Record<string, any>;
  title: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function CredentialsOverview({ searchParams }: { searchParams: Promise<{ modal: string, credId: string }> }) {
  let allCredentialsData: AllCredentialsData[] = [];
  const modal = (await searchParams).modal;
  const credId = (await searchParams).credId;

  let openSearchBar = false;
  if (modal == "create") {
    openSearchBar = true;
  }
  const cookieStore = await cookies();

  try {
    const getCredentials = await fetch("http://localhost:8000/api/v1/credential", {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString(),
      }
    })

    const credentialsData = await getCredentials.json();
    if (!getCredentials.ok) {
      console.log("Bad result while fetching the credentials: ", credentialsData)
      return;
    }
    console.log("Credentials fetching successful");
    allCredentialsData = credentialsData;
    console.log("Fetched credentials: ", allCredentialsData);

  } catch (err: any) {
    console.log("Something went wrong on our end while fetching the credentials: ", err.message)
  }

  const openedCredFormData = allCredentialsData.find((cred) => cred.id == Number(credId));

  return (
    <>
      <DashboardLayout activeTab="credentials">
        <AllCredentialsList allCredentialsData={allCredentialsData} />
      </DashboardLayout>
      {openSearchBar && <CreateCredentialModal allCredentials={allCredentialsData} />}
      {credId && openedCredFormData && <UpdateCredentialModal credFormData={openedCredFormData} />}
    </>
  )
}