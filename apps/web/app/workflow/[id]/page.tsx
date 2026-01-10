// top Bar: "personal/workflow name" & "Save button"
// React flow canvas
// "absolute" ly placed nodes & credentials (which are links to open the "modal" )
// add workflow modal & data structure figure out
// modal itself

// logic to let only one trigger be added (as of V0);
// logic to remove left joint from a trigger node
// data structure of a node will come from where? In json format in memory? in db? 

// figure out the drag and drop placement of nodes
'use client';
import { useState, useCallback, useEffect } from "react";
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, Background, BackgroundVariant, Panel, Controls } from "@xyflow/react";
import {N8nStyleActionNode} from "./customActionNode";
import {N8nStyleTriggerNode} from "./customTriggerNode";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import '@xyflow/react/dist/style.css';
import { Available_Actions } from "./Available_Actions";
import { Available_Triggers } from "./Available_Triggers";
import { TriggerIconMap } from "./NodeIcons";
import Link from "next/link";

interface Workflow{
    id: number,
    title: string,
    enabled: boolean,
    nodes: object,
    connections: object,
    createdAt: string,
    updatedAt: string,
    userId: string
}

// interface NodeData {
//   id: string,
//   position: object,
//   data: object
// }


// WorkflowEditorServerComponent =
// export default ({workflow}: {workflow: Workflow}) => {

// TODO: make this a server component
export default () => {
  const [workflow, setWorkflow ] = useState<Workflow>();
  const { id } = useParams();
  useEffect(()=>{
    try{
      console.log("Started fetching...");
      const workflowId = id;
      (async()=>{
        const fetchedWorkflow = await fetch(`http://localhost:8000/api/v1/workflow/${workflowId}`);
        const fetchedWorkflowData = await fetchedWorkflow.json();
        console.log("Fetch response: ", fetchedWorkflowData);
        if(!fetchedWorkflow.ok){
          // TODO: Could not fetch the workflow: Toaster, & redirect maybe on the /home/workflows;
          console.log(`Some error occurred while fetcing the workflow: ${fetchedWorkflowData}`);
        }
        console.log("Workflow: ", fetchedWorkflowData);
        setWorkflow(fetchedWorkflowData);
      })();
    }catch(err: any){
      console.log(`Some error occurred while fetching the workflow: ${err.message}`);
    }     
  },[])

  const saveWorkflow = () => {

  }
    // /api/v1/workflow/:id      (put, :id) 
    const [isOpen, setIsOpen] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
// TODO: as workflow is fetched, just fill the nodes, edges states & 
// TODO: allow for tracking of nodes positions change
// TODO:NODES SAVING 

    const onNodesChange: OnNodesChange = useCallback((changes)=>setNodes((nodesSnapshot)=> applyNodeChanges(changes, nodesSnapshot)), []);
    const onEdgesChange: OnEdgesChange = useCallback((changes)=>setEdges((edgesSnapshot)=> applyEdgeChanges(changes, edgesSnapshot)), []);
    const onConnect: OnConnect = useCallback((params)=>setEdges((edgesSnapshot)=>addEdge(params, edgesSnapshot)), []);
    const nodeTypes = {
      actionNode: N8nStyleActionNode,
      triggerNode: N8nStyleTriggerNode
    }

  return(
    <>
    {/* TODO: here do the onClick & remove the modal */}
      {/* Header Section */}
      <div className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        {/* workflow name       &       save button */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span className="text-gray-400">Personal</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">{workflow && workflow.title}</span>
        </div>
        <div>
          <button 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={e => {e.preventDefault(), saveWorkflow()}}
          >
            Save
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative h-[calc(100vh-64px)] w-full bg-slate-50">
        {/* TODO: Give this outer div a definite size. (Handled by h-[calc...] above) */}
        {/* react flow          &       nodes modal? */}
        {/* This is definitely a client component, TODO:  we should separately render it for performance boost. */}
        <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}>
          {/*  */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
          />
          <Controls/>
          <Panel style={{ left: 1440, top: 150, position: 'absolute' }} onClick={(e)=>e.stopPropagation()}>
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-900/5 transition hover:bg-gray-50 hover:text-blue-600" 
              onClick={(e: any)=>{e.preventDefault(); setIsOpen(true)}}
            >
              <PlusIcon/>
            </button>
          </Panel>
        </ReactFlow>

        {/* Modal / Sidebar Overlay */}
        <div className={`absolute right-4 top-4 z-50 ${!isOpen ? 'pointer-events-none' : ''}`}>
          {/* TODO: Here onClick should do e.stopPropogation */}
          {isOpen && <div className="h-auto w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
              <div>TRIGGERS</div>
              {/* <div>LIST OF TRIGGERS: Clickable, title & description & icn </div> */}
              <Link href="">{Object.entries(Available_Triggers).map(([key, val])=>(
                <div key={key}>
                  <div>{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div><span>{val.title}</span><span>{val.description}</span></div>
                </div>
              ))}</Link>
            </div>
            <div className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
              <div>Actions</div>
              {/* <div>LIST OF ACTIONS: Clickable, title & description & Icon   -- --  onClick: open a modal, add the node on the screen & custom name(check the nodes with the same name -> add +1 number at the next node -> the modal finally(LOGIC)</div> */}
              <div>{Object.entries(Available_Actions).map(([key, val])=>(
                <Link href="" key={key}>
                  <div>{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div><span>{val.title}</span><span>{val.description}</span></div>
                </Link>
              ))}</div>
            </div>
              {/* import Avail_Triggers & [0].title & [0].description & icon  */}
            </div>}
        </div>
      </div>
      {/* When clicked upon action -> check state if anyActionAlreadyExists -> If exists -> Toaster(You cannot add more than one trigger as of now. We will soon introduce this functionality.) */}
    </>
  )
}
 {/* TODO: Actions */}
            {/* TODO: Trigger */}
            {/* When clicked, add the node to "nodes" state, with the icon and label & id? */}
            {/* After adding the node -> the chooseBar will be opened -> as the user clicks -> add the node to the canvas -> open the form to fill in the node's data */}
            {/* Inside the nodes allow "create credentials" -> add a save button  &  then save the things in the DB */}
            {/* Node added(position)    $    node form data    $    credentials that are created on the way(SAVE THIS THEN & THERE, SAVEBUTTON*/}
            {/*  */}
            {/* import Available_triggers & Available_Nodes from /packages/nodes-base */}


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

// 2:30
// TODO: nodes from db, render on the canvas
// TODO: nodes chosing from sidebar:
// fetch from packages/nodes-base -> add the list to the sidebar -> allow to be clicked upon & add to "nodes" state & open the modal
