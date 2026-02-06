'use client'
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineDotsVertical, HiOutlinePlay } from "react-icons/hi";
import { NetworkRight } from "iconoir-react";

interface Workflow {
  id: number,
  title: string,
  nodes: object,
  connections: object,
  createdAt: string,
  updatedAt: string,
  userId: string,
  executing: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

const WorkflowRow = ({ workflow, index }: { workflow: Workflow, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <Link
        href={`/workflow/${workflow.id}`}
        className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200"
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/15 to-pink-600/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all">
          <NetworkRight className="w-3.5 h-3.5 text-rose-400" />
        </div>

        {/* Title - takes remaining space */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium truncate group-hover:text-rose-100 transition-colors">
            {workflow.title}
          </h3>
        </div>

        {/* Status */}
        <div className="flex-shrink-0 w-20 text-center">
          {workflow.executing ? (
            <span className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Running
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/10 text-gray-500 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              Inactive
            </span>
          )}
        </div>

        {/* Updated date */}
        <div className="flex-shrink-0 w-24 text-center">
          <span className="text-gray-500 text-xs">
            {formatDate(workflow.updatedAt)}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
            title="Run"
          >
            <HiOutlinePlay className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="More"
          >
            <HiOutlineDotsVertical className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-600/10 border border-rose-500/20 flex items-center justify-center mb-5">
      <BsLightningChargeFill className="w-6 h-6 text-rose-400/60" />
    </div>
    <h3 className="text-base font-medium text-white mb-1.5">No workflows yet</h3>
    <p className="text-gray-500 text-sm text-center max-w-xs mb-4">
      Create your first workflow to start automating your tasks.
    </p>
    <div className="flex items-center gap-2 text-rose-400 text-xs">
      <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
      Click "Create" to get started
    </div>
  </motion.div>
);

export const AllWorkflowsList = ({ workflowsData, overview }: { workflowsData: Workflow[], overview: boolean }) => {
  if (!workflowsData || workflowsData.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
        <div className="w-8" /> {/* Icon spacer */}
        <div className="flex-1">Name</div>
        <div className="w-20 text-center">Status</div>
        <div className="w-24 text-center">Updated</div>
        <div className="w-16" /> {/* Actions spacer */}
      </div>

      {/* Workflow rows */}
      {workflowsData.map((workflow, index) => (
        <WorkflowRow key={workflow.id} workflow={workflow} index={index} />
      ))}
    </div>
  );
};
