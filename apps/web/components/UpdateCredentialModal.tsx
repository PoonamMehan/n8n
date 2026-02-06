'use client'
import type { AllCredentialsData } from "@/app/home/credentials/page";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Available_Credential_Apps } from "@/app/workflow/[...id]/Available_Credentials";
import { TriggerIconMap } from "@/app/workflow/[...id]/NodeIcons";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { HiOutlineX, HiOutlineTrash, HiKey } from "react-icons/hi";

export const UpdateCredentialModal = ({ credFormData }: { credFormData: AllCredentialsData }) => {
  const router = useRouter();
  const platform = credFormData.platform;
  const credentialConfig = Available_Credential_Apps[platform];

  // Initialize form with existing credential data
  const [formData, setFormData] = useState<Record<string, string>>(credFormData.data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/credential/${credId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        console.log("Error while deleting the credential");
        toast.error('Failed to delete credential. Please try again.');
        setIsDeleting(false);
        return;
      }

      toast.success('Credential deleted successfully!');
      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error('Something went wrong. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    router.replace("/home/credentials");
  };

  const IconComponent = TriggerIconMap[platform];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center">
                {IconComponent ? (
                  <div className="w-5 h-5 text-amber-400">{IconComponent}</div>
                ) : (
                  <HiKey className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase text-gray-500 tracking-wide">Edit Credential</span>
                <span className="font-semibold text-white">{credentialConfig?.title || platform}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteCredential(credFormData.id)}
                disabled={isDeleting}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                title="Delete credential"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Credential Name</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
                value={formData["name"] || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter credential name"
              />
            </div>

            {/* Dynamic Fields from Config */}
            {credentialConfig?.parameters.map((param, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400">{param.label}</label>
                {param.element === "input" && (
                  <input
                    type="text"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all ${param.readOnly ? 'bg-white/[0.02] text-gray-500 cursor-not-allowed' : ''
                      }`}
                    value={formData[param.label] || ""}
                    readOnly={param.readOnly}
                    onChange={(e) => handleInputChange(param.label, e.target.value)}
                    placeholder={param.default}
                  />
                )}
                {param.element === "button" && (
                  <button
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    onClick={(e) => { e.preventDefault(); handleCredentialButtonClick(param.label, formData["name"]!); }}
                  >
                    {param.icon && TriggerIconMap[param.icon] && (
                      <span className="w-5 h-5">{TriggerIconMap[param.icon]}</span>
                    )}
                    <span>{param.label}</span>
                  </button>
                )}
                {param.element === "select" && (
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
                    value={formData[param.label] || param.default || ""}
                    onChange={(e) => handleInputChange(param.label, e.target.value)}
                    disabled={param.readOnly}
                  >
                    {param.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0c0c0c]">
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all ${isSaving
                  ? 'bg-amber-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};