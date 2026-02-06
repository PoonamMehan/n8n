'use client'

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BsLightningChargeFill } from "react-icons/bs";
import { NetworkRightSolid, NetworkRight } from "iconoir-react";
import { HiOutlineMenuAlt2, HiOutlineX, HiOutlineLogout, HiOutlineViewGrid, HiPlus, HiChevronDown, HiKey } from "react-icons/hi";
import { CreateDropdownCompact } from "./CreateDropdownComponent";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, currentPath }: SidebarProps) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const signoutHandler = async () => {
    try {
      const h = await fetch('/api/v1/auth/signout', { method: 'GET' });
      const data = await h.json();
      if (h.ok && h.status === 200) {
        toast.success('Signed out successfully!');
        router.refresh();
        router.push('/');
      } else {
        toast.error('Failed to sign out. Please try again.');
        console.log("Failed to signout, try again: ", data);
      }
    } catch (err: any) {
      toast.error('Failed to sign out. Please try again.');
      console.log("Failed to signout, try again: ", err.message);
    }
  };

  const newWorkflowCreator = async () => {
    try {
      const newWorkflowResponse = await fetch('/api/v1/workflow', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: `Workflow_${crypto.randomUUID()}` })
      });
      if (!newWorkflowResponse.ok) {
        toast.error('Failed to create workflow. Please try again.');
        return;
      }
      toast.success('Workflow created!');
      const data = await newWorkflowResponse.json();
      router.push(`/workflow/${data.data.id}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const newCredentialCreator = () => {
    router.push("/home/credentials?modal=create");
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] transition-shadow">
              <NetworkRightSolid className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">FlowBolt</span>
          </Link>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Create Dropdown */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <div className="flex items-stretch">
              <button
                onClick={(e) => { e.preventDefault(); newWorkflowCreator(); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-sm font-medium rounded-l-lg transition-all duration-200"
              >
                <HiPlus className="w-4 h-4" />
                Create
              </button>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="px-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white rounded-r-lg border-l border-white/10 transition-all"
              >
                <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <HiChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
            </div>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0c] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                >
                  <button
                    onClick={() => { newWorkflowCreator(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <NetworkRight className="w-4 h-4 text-rose-400" />
                    New Workflow
                  </button>
                  <button
                    onClick={() => { newCredentialCreator(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <HiKey className="w-4 h-4 text-amber-400" />
                    New Credential
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <Link
            href="/home/workflows"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPath === '/home/workflows' || currentPath === '/home/credentials'
              ? 'bg-white/[0.08] text-white font-medium border border-white/5'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
          >
            <HiOutlineViewGrid className="w-5 h-5 text-rose-400" />
            Overview
          </Link>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={signoutHandler}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all text-sm"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  workflowsData?: any[];
  activeTab: 'workflows' | 'credentials';
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_70%)]" />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-rose-900/15 via-pink-900/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-950/15 to-transparent blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} currentPath={pathname} />

      {/* Main content */}
      <main
        className="relative z-10 transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? '256px' : '0' }}
      >
        {/* Top bar with toggle */}
        <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <HiOutlineMenuAlt2 className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-white">Overview</h1>
                <p className="text-sm text-gray-500">All the workflows, credentials you have access to</p>
              </div>
            </div>
            <CreateDropdownCompact component="workflow" />
          </div>
        </header>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-1">
            <Link
              href="/home/workflows"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'workflows'
                ? 'bg-white/[0.08] text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              Workflows
            </Link>
            <Link
              href="/home/credentials"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'credentials'
                ? 'bg-white/[0.08] text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              Credentials
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
