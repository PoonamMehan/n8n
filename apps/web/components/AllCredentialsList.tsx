'use client';
import { TriggerIconMap } from "@/app/workflow/[...id]/NodeIcons";
import type { AllCredentialsData } from "@/app/home/credentials/page";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HiOutlineDotsVertical, HiOutlineTrash, HiOutlinePencil, HiKey } from "react-icons/hi";
import { useState } from "react";

const formatDate = (dateString: Date) => {
  return new Date(dateString).toISOString().split("T")[0];
};

const CredentialRow = ({ cred, index, onDelete }: { cred: AllCredentialsData, index: number, onDelete: (id: number) => void }) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const IconComponent = TriggerIconMap[cred.platform];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          router.push(`/home/credentials?credId=${cred.id}`);
        }}
        className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200 cursor-pointer"
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-600/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
          {IconComponent ? (
            <div className="w-4 h-4 text-amber-400">{IconComponent}</div>
          ) : (
            <HiKey className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>

        {/* Title - takes remaining space */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium truncate group-hover:text-amber-100 transition-colors">
            {cred.data?.name || cred.title || 'Untitled Credential'}
          </h3>
        </div>

        {/* Platform */}
        <div className="flex-shrink-0 w-28 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-gray-400 text-xs capitalize">
            {cred.platform}
          </span>
        </div>

        {/* Created date */}
        <div className="flex-shrink-0 w-24 text-center">
          <span className="text-gray-500 text-xs">
            {formatDate(cred.createdAt)}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/home/credentials?credId=${cred.id}`);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(cred.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-600/10 border border-amber-500/20 flex items-center justify-center mb-5">
      <HiKey className="w-6 h-6 text-amber-400/60" />
    </div>
    <h3 className="text-base font-medium text-white mb-1.5">No credentials yet</h3>
    <p className="text-gray-500 text-sm text-center max-w-xs mb-4">
      Add credentials to connect your apps and services.
    </p>
    <div className="flex items-center gap-2 text-amber-400 text-xs">
      <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
      Click "Create" to add your first credential
    </div>
  </motion.div>
);

export const AllCredentialsList = ({ allCredentialsData }: { allCredentialsData: AllCredentialsData[] }) => {
  const router = useRouter();

  const deleteCredential = async (credId: number) => {
    try {
      if (!credId) {
        console.log("No credential id provided");
        toast.error("Could not delete credential.");
        return;
      }

      const deleteCredentialRes = await fetch(`/api/v1/credential/${credId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const deleteCredentialData = await deleteCredentialRes.json();

      if (!deleteCredentialRes.ok) {
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

  if (!allCredentialsData || allCredentialsData.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
        <div className="w-8" /> {/* Icon spacer */}
        <div className="flex-1">Name</div>
        <div className="w-28 text-center">Platform</div>
        <div className="w-24 text-center">Created</div>
        <div className="w-16" /> {/* Actions spacer */}
      </div>

      {/* Credential rows */}
      {allCredentialsData.map((cred, index) => (
        <CredentialRow key={cred.id} cred={cred} index={index} onDelete={deleteCredential} />
      ))}
    </div>
  );
};