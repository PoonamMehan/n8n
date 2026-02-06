
'use client';
import { useState, useCallback, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../ReduxStore/store';
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, ReactFlowProvider, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, Background, BackgroundVariant, Panel, Controls, useReactFlow } from "@xyflow/react";
import type { Connection } from "@xyflow/react";
import { N8nStyleActionNode } from "./customActionNode";
import { N8nStyleTriggerNode } from "./customTriggerNode";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
import { CiStop1 } from "react-icons/ci"
import { useRouter } from "next/navigation";

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
        alert(JSON.stringify(data, null, 2));
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

  return (
    <>
      {/* Header Section */}
      <div className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm" onClick={(e) => { setIsOpen(false) }}>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span className="text-gray-400">Personal</span>
          <span className="text-gray-300">/</span>
          {isEditingTitle ? (
            <input
              type="text"
              className="text-gray-900 border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
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
        <div>
          {/* TODO: Write a function which will save the workflow(nodes, edges, nodes' form info, credentials(separately)) in DB*/}
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${isSaved || isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            onClick={e => { e.preventDefault(); saveWorkflow() }}
            disabled={isSaved || isSaving}
          >
            {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={(e) => { e.preventDefault(); changeWorkflowExecutionStatus(true) }}>Start Workflow</button>
          {isWorkflowRunning && <button onClick={(e) => { e.preventDefault(); changeWorkflowExecutionStatus(false) }} className="rounded-sm border-2 border-blue-600 px-1 py-1"><CiStop1 className="h-6 w-6 text-blue-600" /></button>}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative h-[calc(100vh-64px)] w-full bg-slate-50">
        {/* react flow          &       nodes modal? */}
        {/* This is definitely a client component, TODO:  we should separately render it for performance boost. */}
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
          // Logic: When a node is clicked, set the activeNode state to open the modal
          onNodeClick={(event, node) => setActiveNodeForm(node as CustomActionNode)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
          />
          <Controls />
          <Panel position="top-right" onClick={(e) => e.stopPropagation()}>
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-900/5 transition hover:bg-gray-50 hover:text-blue-600"
              onClick={(e: any) => { e.preventDefault(); setIsOpen(true) }}
            >
              <PlusIcon />
            </button>
          </Panel>
        </ReactFlow>
        {/* Sidebar overlay*/}
        <div onClick={(e) => { e.stopPropagation() }} className={`absolute right-4 top-4 z-50 ${!isOpen ? 'pointer-events-none' : ''}`}>
          {isOpen && <div className="h-auto w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">TRIGGERS</div>
                <button className="text-gray-400 hover:bg-slate-100 hover:text-gray-600 rounded p-1 transition-colors" onClick={(e: any) => { e.preventDefault(); setIsOpen(false) }}>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {/* <div>LIST OF TRIGGERS: Clickable, title & description & icn </div> */}
              <div className="block space-y-1 mb-4">{Object.entries(Available_Triggers).map(([key, val]) => (
                <Link href="" onClick={(e) => addNodeToCanvas('triggerNode', val.title, val.icon, val.defaultName)} key={key} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div className="flex flex-col"><span className="text-sm font-semibold text-gray-700">{val.title}</span><span className="text-xs text-gray-400 line-clamp-1">{val.description}</span></div>
                </Link>
              ))}</div>
            </div>
            <div className="mb-4 border-b border-gray-100 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Actions</div>
              {/* <div>LIST OF ACTIONS: Clickable, title & description & Icon   -- --  onClick: open a modal, add the node on the screen & custom name(check the nodes with the same name -> add +1 number at the next node -> the modal finally(LOGIC)</div> */}
              <div className="space-y-1">{Object.entries(Available_Actions).map(([key, val]) => (
                <Link href="" onClick={(e) => addNodeToCanvas(val.title === "AI Agent" ? 'aiAgentNode' : 'actionNode', val.title, val.icon, val.defaultName)} key={key} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div className="flex flex-col"><span className="text-sm font-semibold text-gray-700">{val.title}</span><span className="text-xs text-gray-400 line-clamp-1">{val.description}</span></div>
                </Link>
              ))}</div>
            </div>
            <div className="mb-2 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Tools</div>
              <div className="space-y-1">{Object.entries(Available_Tools).map(([key, val]) => (
                <Link href="" onClick={(e) => addNodeToCanvas('toolNode', val.title, val.icon, val.defaultName)} key={key} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div className="flex flex-col"><span className="text-sm font-semibold text-gray-700">{val.title}</span><span className="text-xs text-gray-400 line-clamp-1">{val.description}</span></div>
                </Link>
              ))}</div>
            </div>
            {/* import Avail_Triggers & [0].title & [0].description & icon  */}
          </div>}
        </div>

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
    </>
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