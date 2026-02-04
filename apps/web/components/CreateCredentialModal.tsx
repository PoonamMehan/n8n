//just be a search bar? 
// list of available credentials
// as credential clicked
// open the modal to enter the details
// save the modal, close it
// close the search bar by: router.push('/home/credentials')
'use client';
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Available_Credential_Apps } from "../app/workflow/[...id]/Available_Credentials";
import { TriggerIconMap } from "../app/workflow/[...id]/NodeIcons";
import { useRouter } from "next/navigation";

export const CreateCredentialModal = ({ allCredentials }: { allCredentials: any }) => {
  const [listOpened, setListOpened] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);
  const [credentialsFormValues, setCredentialsFormValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleCredentialInputChange = (label: string, value: string) => {
    setCredentialsFormValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleCredentialButtonClick = (label: string, credentialName: string) => {
    if (label == "Sign in with Google") {
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        `http://localhost:8000/api/v1/auth/google/login?name=${credentialName}`,
        "GoogleAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  };

  const handleSaveCredential = async () => {
    if (!selectedCredential) return;

    const payload = {
      title: Available_Credential_Apps[selectedCredential]?.title,
      platform: selectedCredential,
      data: credentialsFormValues
    };

    try {
      const response = await fetch("http://localhost:8000/api/v1/credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.log("Error while saving the credential");
        // TODO: toaster error
        return;
      }

      // TODO: toaster success
      handleClose();
    } catch (error) {
      console.error("Save failed:", error);
      // TODO: toaster error
    }
  };

  const handleClose = () => {
    setSelectedCredential(null);
    setCredentialsFormValues({});
    router.replace("/home/credentials");
  };

  const handleSelectCredential = (key: string) => {
    const credentialConfig = Available_Credential_Apps[key];
    const baseName = credentialConfig?.defaultName || key;

    //find the highest existing number using regex 
    let highestNumber = 0;
    const regex = /^(?<name>.+?)\s+(?<number>\d+)$/;

    allCredentials?.forEach((credential: any) => {
      const credentialName = credential.data?.name as string;
      if (!credentialName) return;

      const match = credentialName.match(regex);
      if (!match?.groups) return;

      if (match.groups.name === baseName && match.groups.number) {
        highestNumber = Math.max(highestNumber, Number(match.groups.number));
      }
    });

    const nextNumber = highestNumber + 1;

    const defaults: Record<string, string> = {
      name: `${baseName} ${nextNumber}`
    };
    credentialConfig?.parameters.forEach(param => {
      if (param.default) {
        defaults[param.label] = param.default;
      }
    });
    setCredentialsFormValues(defaults);
    setSelectedCredential(key);
    setListOpened(false);
  };

  const filteredCredentials = Object.entries(Available_Credential_Apps).filter(([key, val]) =>
    val.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {!selectedCredential ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add new Credential</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Select an app or service to connect to</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for app..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setListOpened(true); }}
                onFocus={() => setListOpened(true)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setListOpened(val => !val)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {listOpened ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </button>
            </div>
            {listOpened && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded">
                {filteredCredentials.map(([key, val]) => (
                  <div
                    key={key}
                    onClick={() => handleSelectCredential(key)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    {val.title}
                  </div>
                ))}
                {filteredCredentials.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-500">New Credential</span>
                <span className="font-bold text-gray-800">{Available_Credential_Apps[selectedCredential]?.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCredential(null)}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveCredential}
                  className="rounded bg-blue-600 px-4 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 bg-gray-100 text-gray-500"
                  value={credentialsFormValues["name"] || ""}
                  disabled={true}
                />
              </div>
              {Available_Credential_Apps[selectedCredential]?.parameters.map((param, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">{param.label}</label>
                  {param.element === "input" && (
                    <input
                      type="text"
                      className={`border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 ${param.readOnly ? 'bg-gray-100 text-gray-500' : ''}`}
                      value={credentialsFormValues[param.label] || ""}
                      readOnly={param.readOnly}
                      onChange={(e) => handleCredentialInputChange(param.label, e.target.value)}
                      placeholder={param.default}
                    />
                  )}
                  {param.element === "button" && (
                    <button
                      className="flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={(e) => { e.preventDefault(); handleCredentialButtonClick(param.label, credentialsFormValues["name"]!); }}
                    >
                      {param.icon && TriggerIconMap[param.icon] && (
                        <span>{TriggerIconMap[param.icon]}</span>
                      )}
                      <span>{param.label}</span>
                    </button>
                  )}
                  {param.element === "select" && (
                    <select
                      className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                      value={credentialsFormValues[param.label] || param.default || ""}
                      onChange={(e) => handleCredentialInputChange(param.label, e.target.value)}
                      disabled={param.readOnly}
                    >
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
