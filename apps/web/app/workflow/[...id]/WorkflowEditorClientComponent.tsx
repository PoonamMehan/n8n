
'use client';
import { useState, useCallback, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../ReduxStore/store';
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, ReactFlowProvider, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, Background, BackgroundVariant, Panel, Controls, MiniMap, useReactFlow } from "@xyflow/react";
import type { Connection } from "@xyflow/react";
import { N8nStyleActionNode } from "./customActionNode";
import { N8nStyleTriggerNode } from "./customTriggerNode";
import { PlusIcon, XMarkIcon, Bars3Icon, KeyIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import '@xyflow/react/dist/style.css';
import { Available_Actions } from "./Available_Actions";
import { Available_Triggers } from "./Available_Triggers";
import { TriggerIconMap } from "./NodeIcons";
import Link from "next/link";
import { CustomActionNode } from "./customActionNode";
import { CustomTriggerNode } from "./customTriggerNode";
import { NodeForm } from "./NodeForm";
import { N8nStyleAIAgentNode, N8nStyleToolNode } from "./customAIAgentNodes";
import { Available_Tools } from "./Available_Tools";
import { CiStop1 } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { SunLight, HalfMoon, NetworkRight, LogOut } from "iconoir-react";
import { toast } from "sonner";

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
// WorkflowEditorServerComponent =
// export default ({workflow}: {workflow: Workflow}) => {

// TODO: make this a server component
export const WorkflowClientComponent = () => {
  const { socket, isConnected } = useSelector((state: RootState) => state.socket);
  const [workflow, setWorkflow] = useState<Workflow>();
  const { id } = useParams<{ id: string[] }>();
  const workflowId = id[0];
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  // as + clicked -> create entry in prisma.workflows table -> 
  // add a delete workflows button on top or somewhere
  //sidebar: 
  useEffect(() => {
    if (socket && isConnected && workflowId) {
      console.log("SUBSCRIBING TO WORKFLOW: ", workflowId);
      socket.send(JSON.stringify({ type: 'SUBSCRIBE', workflowId }));

      socket.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        console.log("WS Message received: ", data);
        setLogs((prev) => [...prev, `> ${JSON.stringify(data, null, 2)}`]);
      }
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN && workflowId) {
        console.log("UNSUBSCRIBING FROM WORKFLOW: ", workflowId);
        socket.send(JSON.stringify({ type: 'UNSUBSCRIBE', workflowId }));
      }
    };
  }, [socket, isConnected, workflowId]);


  useEffect(() => {
    try {
      console.log("Started fetching...");
      (async () => {
        const fetchedWorkflow = await fetch(`/api/v1/workflow/${workflowId}`, {
          credentials: "include"
        });

        const fetchedWorkflowData = await fetchedWorkflow.json();
        console.log("Fetch response: ", fetchedWorkflowData);

        if (!fetchedWorkflow.ok) {
          // TODO: Could not fetch the workflow: Toaster, & redirect maybe on the /home/workflows;
          console.log(`Some error occurred while fetcing the workflow: ${fetchedWorkflowData}`);
          // Toaster: Error fetching the workflow: 
          // fetchedWorkflowData.data.error
          router.push("/home/workflows");
          return;
        }

        // set edges and nodes
        setEdges(fetchedWorkflowData.data.connections);
        setNodes(fetchedWorkflowData.data.nodes);
        console.log("Workflow: ", fetchedWorkflowData);
        console.log("Workflow Edges: ", fetchedWorkflowData.data.connections);
        console.log("Workflow Nodes: ", fetchedWorkflowData.data.nodes);
        setWorkflow(fetchedWorkflowData.data);
        setIsWorkflowRunning(fetchedWorkflowData.data.executing);

      })();
    } catch (err: any) {
      console.log(`Some error occurred while fetching the workflow: ${err.message}`);
      // toaster: error while fetching the workflow, retry:
      router.push("/home/workflows");
    }
  }, [])

  //warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaved]);

  const changeWorkflowExecutionStatus = async (changeStatusTo: boolean) => {
    try {
      const response = await fetch(`/api/v1/workflow/${workflowId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          executing: changeStatusTo
        }),
        credentials: "include"
      });

      const result = await response.json();

      if (!response.ok) {
        console.log("Error changing workflow status:", result.error);
        // TODO: toaster error
        return;
      }

      setIsWorkflowRunning(changeStatusTo);
      // TODO: toaster success
    } catch (err: any) {
      console.log("Failed to change workflow execution status:", err.message);
      // TODO: toaster error
    }
  }

  const saveWorkflowTitle = async () => {
    // Don't save if title hasn't changed or is empty
    if (!editableTitle.trim() || editableTitle === workflow?.title) {
      setIsEditingTitle(false);
      setEditableTitle(workflow?.title || "");
      return;
    }

    try {
      const response = await fetch(`/api/v1/workflow/${workflowId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editableTitle.trim()
        }),
        credentials: "include"
      });

      const result = await response.json();

      if (!response.ok) {
        console.log("Error updating workflow title:", result.error);
        // TODO: add toaster - if error is about duplicate name, show "A workflow with this name already exists"
        setEditableTitle(workflow?.title || "");
        setIsEditingTitle(false);
        return;
      }

      // Update local workflow state with new title
      setWorkflow(prev => prev ? { ...prev, title: editableTitle.trim() } : prev);
      setIsEditingTitle(false);
      // TODO: toaster success - "Workflow title updated"
    } catch (err: any) {
      console.log("Failed to update workflow title:", err.message);
      // TODO: toaster error
      setEditableTitle(workflow?.title || "");
      setIsEditingTitle(false);
    }
  }


  const saveWorkflow = async () => {
    if (isSaving || isSaved) return;

    setIsSaving(true);
    console.log("Edges: ", edges);
    try {
      const updatedWorkflow = await fetch(`/api/v1/workflow/${workflowId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connections: edges,
          nodes: nodes
        }),
        credentials: "include"
      })

      console.log("updatedworkfow: ", updatedWorkflow);
      if (!updatedWorkflow.ok) {
        setIsSaved(false);
        setIsSaving(false);
        return;
      }
      setIsSaved(true);
      setIsSaving(false);
    } catch (err: any) {
      console.log("Failed to save Workflow in the db.");
      setIsSaved(false);
      setIsSaving(false);
    }
  }
  // /api/v1/workflow/:id      (put, :id) 
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition, getNode } = useReactFlow();
  const [isTriggerNodePresent, setIsTriggerNodePresent] = useState(false);
  // TODO: HANDLE THIS  
  const [activeNodeForm, setActiveNodeForm] = useState<CustomActionNode | null>(null);
  // change this when nodes are fetched -> and change when a new trigger is added -> and change when trigger is deleted
  // TODO: as workflow is fetched, just fill the nodes, edges states & 
  // TODO: allow for tracking of nodes positions change
  // TODO:NODES SAVING 

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    setIsSaved(false);
  }, []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
    setIsSaved(false);
  }, []);
  const onConnect: OnConnect = useCallback((params) => {
    setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    setIsSaved(false);
  }, []);
  const nodeTypes = {
    actionNode: N8nStyleActionNode,
    triggerNode: N8nStyleTriggerNode,
    aiAgentNode: N8nStyleAIAgentNode,
    toolNode: N8nStyleToolNode
  }

  useEffect(() => {
    setIsSaved(false);
  }, [nodes, edges]);



  // TODO: useEffect(, []) => fetch the workflow and add the nodes to "nodes[]" & connections to "edges[]";
  // 

  const calculateCenterOnEditor = () => {
    //TODO: take a reference of the Editor component itself for more precise center
    const centerScreenX = window.innerWidth / 2;
    const centerScreenY = window.innerHeight / 2;
    const position = screenToFlowPosition({
      x: centerScreenX,
      y: centerScreenY
    });
    return position;
  }

  const findTheNameForTheNode = (titleMatch: string) => {
    let newSerialNum = 0;
    console.log("I am running, and here are the nodes: ", nodes);
    console.log("Title to match: ", titleMatch);
    const regex = /^(?<name>.+?)\s+(?<number>\d+)$/;
    nodes.forEach((val) => {
      console.log("val bro: ", val);
      // val.data.title 
      // then just count the number of them & add 1 to it and just name the node 
      const match = (val.data.nodeName as string).match(regex);
      if (!match?.groups) {
        return;
      }
      if (match.groups.name == titleMatch && match.groups.number) {
        newSerialNum = Math.max(newSerialNum, Number(match.groups.number));
      }
    })
    newSerialNum++;
    console.log("Here is the serial Number i have calculated: ", newSerialNum);
    return newSerialNum;
  }

  const addNodeToCanvas = (type: 'actionNode' | 'triggerNode' | 'aiAgentNode' | 'toolNode', title: string, icon: string, defaultName: string) => {
    console.log("type of the node: ", type, "& isTriggerNodePresent: ", isTriggerNodePresent);

    if (type == 'triggerNode' && isTriggerNodePresent) {
      // Toaster: This version supprts only 1 trigger node. New updates coming!
      alert('Only 1 trigger node is allowed');
      return;
    } else if (type == 'triggerNode') {
      setIsTriggerNodePresent(true);
    }

    const uId = crypto.randomUUID();
    const { x, y } = calculateCenterOnEditor();
    const randomOffset = Math.random() * 20;
    // TODO: we can allow the user to name the nodes themselves as well & change the logic to "regexp" based
    const newSerialNum = findTheNameForTheNode(defaultName);
    const newNode: CustomActionNode = {
      id: uId,
      type: type,
      position: { x: x + randomOffset, y: y + randomOffset },
      data: { nodeTitle: title, nodeIcon: icon, nodeName: `${defaultName} ${newSerialNum}`, executionData: {} }
    };
    setNodes((oldNodes) => [...oldNodes, newNode]);
    setIsOpen(false);
    // open the modal (change the url -> with the Info about the node show the modal -> fetch parameters of the node from in-memory variable -> show the form -> )
    // 
    // TODO: set activeNodeForm -> find where do i get the node from "nodes" -> forcefully update the state "nodes" -> 
    setActiveNodeForm(newNode);
  };

  useEffect(() => {
    console.log("isOpen changed: ", isOpen)
  }, [isOpen]);

  function formDataHandler(formData: Record<string, any>, id: string) {
    console.log("Form Data: ", formData);
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              executionData: formData
            }
          };
        }
        return node;
      })
    );
  }

  const isValidConnection = (connection: Connection | Edge) => {
    const sourceNode = getNode(connection.source);
    const targetNode = getNode(connection.target);
    if (!sourceNode || !targetNode) return false;
    if (sourceNode.type == 'aiAgentNode' && connection.sourceHandle == "tools") {
      return targetNode.type == 'toolNode';
    }
    if (targetNode.type == 'toolNode') {
      return sourceNode.type == 'aiAgentNode' && connection.sourceHandle == 'tools';
    }
    return true;
  }

  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Toggleable sidebar

  // Sign out handler
  const signoutHandler = async () => {
    try {
      const res = await fetch('/api/v1/auth/signout', { method: 'GET' });
      if (res.ok) {
        toast.success('Signed out successfully');
        router.push('/');
      }
    } catch (err) {
      toast.error('Sign out failed');
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#0c0c0c]">
      {/* Toggleable Left Sidebar - Push Layout */}
      <div
        className={`flex-shrink-0 h-full border-r transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-56' : 'w-0'
          } ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
          }`}
      >
        <div className="w-56 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className={`flex shrink-0 h-16 items-center justify-between px-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                <NetworkRight className="w-4 h-4" />
              </div>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FlowBolt</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:bg-white/5 hover:text-gray-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1">
            <Link
              href="/home/workflows"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDarkMode ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <NetworkRight className="w-5 h-5" />
              <span className="text-sm font-medium">Workflows</span>
            </Link>
            <Link
              href="/home/credentials"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDarkMode ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <KeyIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Credentials</span>
            </Link>
          </nav>

          {/* Sign Out */}
          <div className={`p-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <button
              onClick={signoutHandler}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header Section */}
        <div className={`flex h-16 shrink-0 w-full items-center justify-between border-b px-4 ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`} onClick={(e) => { setIsOpen(false) }}>
          <div className={`flex items-center gap-3 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {/* Sidebar Toggle */}
            {!isSidebarOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
                className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Personal</span>
            <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>/</span>
            {isEditingTitle ? (
              <input
                type="text"
                className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-white/5 border-rose-500/50 text-white focus:ring-rose-500/25' : 'border-blue-500 text-gray-900 focus:ring-blue-500'}`}
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                onBlur={() => saveWorkflowTitle()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveWorkflowTitle();
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setEditableTitle(workflow?.title || "");
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={`cursor-pointer px-2 py-1 rounded ${isDarkMode ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-100'}`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditableTitle(workflow?.title || "");
                  setIsEditingTitle(true);
                }}
                title="Double-click to edit"
              >
                {workflow && workflow.title}
              </span>
            )}

          </div>
          <div className="flex items-center gap-2">
            {/* Moved Buttons Group - EXTREME RIGHT */}
            <div className="flex items-center gap-6">
              {/* Group 1: Theme & Save */}
              <div className="flex items-center gap-2 border-r pr-6 border-gray-200 dark:border-white/10">
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${isDarkMode ? 'bg-white/5 border border-white/10 text-amber-400 hover:bg-white/10 hover:text-amber-300' : 'bg-gray-100 border border-gray-200 text-indigo-600 hover:bg-gray-200'}`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <SunLight className="w-5 h-5 text-white" /> : <HalfMoon className="w-5 h-5 text-black" />}
                </button>

                {/* Save Button */}
                <button
                  className={`h-8 px-4 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isSaved || isSaving ? (isDarkMode ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed') : (isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200')}`}
                  onClick={e => { e.preventDefault(); saveWorkflow() }}
                  disabled={isSaved || isSaving}
                >
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="flex items-center gap-1">

                <button
                  onClick={(e) => { e.preventDefault(); changeWorkflowExecutionStatus(true) }}
                  disabled={isWorkflowRunning}
                  className={`
    h-8 px-3.5
    flex items-center gap-2
    rounded-lg text-sm font-medium
    bg-neutral-900/80 backdrop-blur
    text-emerald-400
    border border-white/10
    ring-1 ring-white/5
    shadow-lg shadow-black/40
    transition-all duration-150
    ${isWorkflowRunning
                      ? 'opacity-50 cursor-not-allowed grayscale'
                      : 'hover:scale-[1.03] hover:bg-neutral-800 hover:ring-emerald-500/30'}
  `}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Start
                </button>

                {isWorkflowRunning && (
                  <button
                    onClick={(e) => { e.preventDefault(); changeWorkflowExecutionStatus(false) }}
                    className="
      h-8 w-8
      flex items-center justify-center
      rounded-lg
      bg-neutral-900/80 backdrop-blur
      text-neutral-400
      border border-white/10
      ring-1 ring-white/5
      shadow-lg shadow-black/40
      transition-all duration-150
      hover:scale-[1.05]
      hover:text-red-400
      hover:ring-red-500/30
      hover:bg-neutral-800
    "
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="4" y="4" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">

          <div className={`relative flex-1 h-full transition-all duration-300 ${isDarkMode ? 'bg-[#0c0c0c]' : 'bg-slate-50'}`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              isValidConnection={isValidConnection}
              nodeTypes={nodeTypes}
              onClick={(e) => { setIsOpen(false) }}
              onNodeClick={(event, node) => setActiveNodeForm(node as CustomActionNode)}
              className={isDarkMode ? 'dark-flow' : ''}
              style={{ background: isDarkMode ? '#0c0c0c' : undefined }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={12}
                size={1}
                color={isDarkMode ? '#333' : '#ccc'}
              />
              <Controls
                className={isDarkMode ? 'dark-controls' : ''}
                style={{
                  background: isDarkMode ? '#1a1a1a' : undefined,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined
                }}
              />
              <MiniMap
                position="bottom-left"
                style={{
                  background: isDarkMode ? '#0c0c0c' : '#f8f8f8',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e5e5',
                  borderRadius: '8px',
                  marginLeft: '60px'
                }}
                nodeColor={(node) => {
                  if (node.type === 'triggerNode') return isDarkMode ? '#f43f5e' : '#3b82f6';
                  if (node.type === 'aiAgentNode') return isDarkMode ? '#8b5cf6' : '#8b5cf6';
                  if (node.type === 'toolNode') return isDarkMode ? '#a855f7' : '#a855f7';
                  return isDarkMode ? '#f97316' : '#f97316';
                }}
                maskColor={isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
              />
            </ReactFlow>

            {/* Add Node Button - Floating Right */}
            <div className="absolute right-12 top-12 z-20 flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900/80 backdrop-blur text-neutral-200 border border-white/10 ring-1 ring-white/5 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-105 hover:bg-neutral-800/90 hover:text-white hover:ring-white/10`}
                onClick={(e: any) => { e.preventDefault(); setIsOpen(true) }}
              >
                <PlusIcon className="h-6 w-6" />
              </button>
              <p className={`text-[10px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add Node</p>
            </div>

            {/* Logs Panel - Bottom Right Floating */}
            <div className="absolute right-6 bottom-6 z-20" onClick={(e) => e.stopPropagation()}>
              <div className={`w-[500px] max-h-[500px] flex flex-col rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-all ${isDarkMode
                ? 'bg-[#0c0c0c]/80 border border-white/10'
                : 'bg-white/80 border border-gray-200'
                }`}>
                <div className={`px-3 py-2 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Logs</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLogs([])} className="text-[10px] hover:underline opacity-70">Clear</button>
                    <div className={`h-2 w-2 rounded-full ${isWorkflowRunning ? 'bg-green-500 animate-pulse' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                <div className={`p-3 overflow-y-auto font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {logs.length === 0 ? (
                    <div className={`italic ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {isWorkflowRunning ? 'Waiting for logs...' : 'Run workflow to see logs'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {logs.map((log, i) => (
                        <div key={i} className="break-all border-b border-white/5 pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                          {log}
                        </div>
                      ))}
                      <div id="logs-end" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nodes Modal Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setIsOpen(false)}
            >
              <div
                className={`w-[800px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#151515] border border-white/10' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a Node</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Triggers Section */}
                    <div className="flex flex-col gap-3">
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Triggers</div>
                      {Object.entries(Available_Triggers).map(([key, val]) => (
                        <div
                          key={key}
                          onClick={(e) => addNodeToCanvas('triggerNode', val.title, val.icon, val.defaultName)}
                          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isDarkMode
                            ? 'bg-[#1a1a1a] border-white/5 hover:border-rose-500/50 hover:bg-[#202020]'
                            : 'bg-white border-gray-100 hover:border-rose-200 hover:shadow-sm'
                            }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                            {TriggerIconMap[val.icon] || TriggerIconMap['default']}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{val.title}</div>
                            <div className={`text-[10px] line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{val.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col gap-3">
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Actions</div>
                      {Object.entries(Available_Actions).map(([key, val]) => {
                        const isAIAgent = val.title === "AI Agent";
                        return (
                          <div
                            key={key}
                            onClick={(e) => addNodeToCanvas(isAIAgent ? 'aiAgentNode' : 'actionNode', val.title, val.icon, val.defaultName)}
                            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isDarkMode
                              ? 'bg-[#1a1a1a] border-white/5 hover:border-amber-500/50 hover:bg-[#202020]'
                              : 'bg-white border-gray-100 hover:border-amber-200 hover:shadow-sm'
                              }`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isAIAgent
                              ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                              : (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')
                              }`}>
                              {TriggerIconMap[val.icon] || TriggerIconMap['default']}
                            </div>
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{val.title}</div>
                              <div className={`text-[10px] line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{val.description}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Tools Section */}
                    <div className="flex flex-col gap-3">
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Tools</div>
                      {Object.entries(Available_Tools).map(([key, val]) => (
                        <div
                          key={key}
                          onClick={(e) => addNodeToCanvas('toolNode', val.title, val.icon, val.defaultName)}
                          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isDarkMode
                            ? 'bg-[#1a1a1a] border-white/5 hover:border-purple-500/50 hover:bg-[#202020]'
                            : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-sm'
                            }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            {TriggerIconMap[val.icon] || TriggerIconMap['default']}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{val.title}</div>
                            <div className={`text-[10px] line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{val.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* End of Node Selection Modal */}

          {/* NODE FORM MODAL OVERLAY */}
          {activeNodeForm && (
            <div
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setActiveNodeForm(null)}
            >
              <div
                className="relative h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the form
              >
                {/* THE NODE FORM CONTENT GOES HERE */}
                <div className="p-6">
                  {/* You can now pass activeNode.id or activeNode.data to your form component */}
                  <h2 className="text-lg font-bold">{activeNodeForm.data.nodeName}</h2>
                  <button className="absolute top-4 right-4" onClick={() => setActiveNodeForm(null)}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div>
                  {/* Parse the parameters & just go thru them -> each parameter with a React element + all the options */}
                  {/* Render the component, send a callback -> that callback will take all the objects in a variable -> the variable will be used to add the data to the "nodes" state -> when the cross is pressed or outside the component is pressed and the form is exited from the screen -> we call the callback with the updated values at the last time in the form -> then add those values in the "nodes" state */}
                  {/* To e.propgate thingy: inside the activeNodeForm -> activeCredentialForm -> When cross clicked use a callback -> when outside clicked that div will live in here */}

                  {/* cmponent that will render the nodes form here -> then add the nodes form -> will take a callback that will update the activeCredentialForm here */}
                  {/* TODO: later add a global store for state management */}
                  {/* COMPONENT */}
                  {/* send type & title to render right node form */};
                  {/*  */}
                  <NodeForm formDataHandler={formDataHandler} title={activeNodeForm.data.nodeTitle} type={activeNodeForm.type!} alreadyFilledValues={activeNodeForm.data.executionData} nodeId={activeNodeForm.id} nodes={nodes} />
                </div>
              </div>
            </div>
          )}
        </div>
        {/* When clicked upon action -> check state if anyActionAlreadyExists -> If exists -> Toaster(You cannot add more than one trigger as of now. We will soon introduce this functionality.) */}

      </div>
    </div>
  )
}
{/* TODO: Actions */ }
{/* TODO: Trigger */ }
{/* When clicked, add the node to "nodes" state, with the icon and label & id? */ }
{/* After adding the node -> the chooseBar will be opened -> as the user clicks -> add the node to the canvas -> open the form to fill in the node's data */ }
{/* Inside the nodes allow "create credentials" -> add a save button  &  then save the things in the DB */ }
{/* Node added(position)    $    node form data    $    credentials that are created on the way(SAVE THIS THEN & THERE, SAVEBUTTON*/ }
{/*  */ }
{/* import Available_triggers & Available_Nodes from /packages/nodes-base */ }


// nodes modal: Triggers List    &     Actions List
// Ensure only one trigger is used

// TODO: Optimize this component by converting the main Component to a server Component & creatng different components for Client components.
// 

{/* 1: Custom node for a trigger
            2: Only one trigger ( isTriggerPresent = false & true & false)
            3: If trigger assign that custom node to it
            4: 
            5: Upon "Execute" if trigger is absent, toaster
            6: As a new node or connection is added -> maintain the state in memory
            7: As save button pressed -> save it in db
            8: Add node button right
            9: 
            10: zoom buttons
            11: Execute button

            
*/}

// TODO: nodes from db, render on the canvas
// TODO: nodes chosing from sidebar:
// fetch from packages/nodes-base -> add the list to the sidebar -> allow to be clicked upon & add to "nodes" state & open the modal
// TODO: logic to delete a node & its adjacent edges
// TODO: if trigger is deleted then set isTriggerNodePresent = false