'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiChevronDown, HiKey } from 'react-icons/hi';
import { BsLightningChargeFill } from 'react-icons/bs';

export function CreateDropdownComponent({ component }: { component: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const newWorkflowCreator = async () => {
    try {
      const newWorkflowResponse = await fetch('/api/v1/workflow', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `Workflow_${crypto.randomUUID()}`
        })
      });
      if (!newWorkflowResponse.ok) {
        toast.error('Failed to create workflow. Please try again.');
        return;
      }
      toast.success('Workflow created!');
      const data = await newWorkflowResponse.json();
      const workflowId = data.data.id;
      router.push(`/workflow/${workflowId}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  }

  const newCredentialCreator = async () => {
    router.push("/home/credentials?modal=create");
  }

  const primaryAction = component === "workflow" ? newWorkflowCreator : newCredentialCreator;
  const primaryLabel = component === "workflow" ? "Create Workflow" : "Create Credential";
  const secondaryAction = component === "workflow" ? newCredentialCreator : newWorkflowCreator;
  const secondaryLabel = component === "workflow" ? "Create Credential" : "Create Workflow";
  const SecondaryIcon = component === "workflow" ? HiKey : BsLightningChargeFill;

  return (
    <div className="relative">
      {/* Main button group */}
      <div className="flex items-stretch">
        <button
          onClick={(e) => { e.preventDefault(); primaryAction(); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-sm font-medium rounded-l-lg transition-all duration-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
        >
          <HiPlus className="w-4 h-4" />
          {primaryLabel}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); setIsOpen(val => !val); }}
          className="px-2.5 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white rounded-r-lg border-l border-white/10 transition-all duration-200"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <HiChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0c] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            <button
              onClick={(e) => { e.preventDefault(); secondaryAction(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <SecondaryIcon className="w-4 h-4 text-gray-400" />
              {secondaryLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Compact version for main content area
export function CreateDropdownCompact({ component }: { component: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const newWorkflowCreator = async () => {
    try {
      const newWorkflowResponse = await fetch('/api/v1/workflow', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `Workflow_${crypto.randomUUID()}`
        })
      });
      if (!newWorkflowResponse.ok) {
        toast.error('Failed to create workflow. Please try again.');
        return;
      }
      toast.success('Workflow created!');
      const data = await newWorkflowResponse.json();
      const workflowId = data.data.id;
      router.push(`/workflow/${workflowId}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  }

  const newCredentialCreator = async () => {
    router.push("/home/credentials?modal=create");
  }

  const isWorkflowPage = component === "workflow";
  const primaryAction = isWorkflowPage ? newWorkflowCreator : newCredentialCreator;
  const primaryLabel = isWorkflowPage ? "Create Workflow" : "Create Credential";
  const secondaryAction = isWorkflowPage ? newCredentialCreator : newWorkflowCreator;
  const secondaryLabel = isWorkflowPage ? "Create Credential" : "Create Workflow";
  const SecondaryIcon = isWorkflowPage ? HiKey : BsLightningChargeFill;
  const secondaryIconColor = isWorkflowPage ? "text-amber-400" : "text-rose-400";

  return (
    <div className="relative">
      <div className="flex items-stretch">
        <button
          onClick={(e) => { e.preventDefault(); primaryAction(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-sm font-medium rounded-l-lg transition-all duration-200"
        >
          <HiPlus className="w-4 h-4" />
          {primaryLabel}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); setIsOpen(val => !val); }}
          className="px-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white rounded-r-lg border-l border-white/10 transition-all duration-200"
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <HiChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#0c0c0c] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            <button
              onClick={(e) => { e.preventDefault(); secondaryAction(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <SecondaryIcon className={`w-4 h-4 ${secondaryIconColor}`} />
              {secondaryLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}