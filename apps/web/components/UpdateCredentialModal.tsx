'use client'
import type { AllCredentialsData } from "@/app/home/credentials/page";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Available_Credential_Apps } from "@/app/workflow/[...id]/Available_Credentials";
import { TriggerIconMap } from "@/app/workflow/[...id]/NodeIcons";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from 'sonner';

export const UpdateCredentialModal = ({ credFormData }: { credFormData: AllCredentialsData }) => {
  const router = useRouter();
  const platform = credFormData.platform;
  const credentialConfig = Available_Credential_Apps[platform];

  // Initialize form with existing credential data
  const [formData, setFormData] = useState<Record<string, string>>(credFormData.data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (label: string, value: string) => {
    setFormData(prev => ({
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/v1/credential/${credFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: credentialConfig?.title,
          platform: platform,
          data: formData
        })
      });

      if (!response.ok) {
        console.log("Error while updating the credential");
        toast.error('Failed to update credential. Please try again.');
        setIsSaving(false);
        return;
      }

      toast.success('Credential updated successfully!');
      handleClose();
    } catch (error) {
      console.error("Update failed:", error);
      setIsSaving(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const deleteCredential = async (credId: number) => {
    if (!confirm("Are you sure you want to delete this credential?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/credential/${credId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        console.log("Error while deleting the credential");
        toast.error('Failed to delete credential. Please try again.');
        return;
      }

      toast.success('Credential deleted successfully!');
      handleClose();
      router.refresh(); // Refresh to update the credentials list
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    router.replace("/home/credentials");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { e.stopPropagation(); handleClose(); }}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-gray-500">Edit Credential</span>
            <span className="font-bold text-gray-800">{credentialConfig?.title || platform}</span>
          </div>
          <div className="flex gap-2">
            <button>
              <TrashIcon onClick={() => { deleteCredential(credFormData.id) }} className="h-5 w-5" />
            </button>
            <button
              onClick={handleClose}
              className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`rounded px-4 py-1 text-sm font-semibold text-white ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
              value={formData["name"] || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Credential name"
            />
          </div>

          {/* Dynamic Fields from Config */}
          {credentialConfig?.parameters.map((param, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">{param.label}</label>
              {param.element === "input" && (
                <input
                  type="text"
                  className={`border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 ${param.readOnly ? 'bg-gray-100 text-gray-500' : ''
                    }`}
                  value={formData[param.label] || ""}
                  readOnly={param.readOnly}
                  onChange={(e) => handleInputChange(param.label, e.target.value)}
                  placeholder={param.default}
                />
              )}
              {param.element === "button" && (
                <button
                  className="flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={(e) => { e.preventDefault(); handleCredentialButtonClick(param.label, formData["name"]!); }}
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
                  value={formData[param.label] || param.default || ""}
                  onChange={(e) => handleInputChange(param.label, e.target.value)}
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
    </div>
  );
};