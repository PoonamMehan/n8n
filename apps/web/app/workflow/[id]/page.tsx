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
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, useNodesState, Panel } from "@xyflow/react";
import {N8nStyleActionNode} from "./customActionNode";
import {N8nStyleTriggerNode} from "./customTriggerNode";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import '@xyflow/react/dist/style.css';

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
      <div>
        {/* workflow name       &       save button */}
        <div>
          <span>Personal</span>
          <span>/</span>
          <span>{workflow && workflow.title}</span>
        </div>
        <div>
          <button onClick={e => {e.preventDefault(), saveWorkflow()}}>Save</button>
        </div>
      </div>
      <div>
        {/* TODO: Give this outer div a definite size. */}
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
          <Panel position="center-right" onClick={(e)=>e.stopPropagation()}>
            <button className="w-10 h-10 outline-neutral-400 outline-1 border-none focus:border-none" onClick={(e: any)=>{e.preventDefault(); setIsOpen(true)}}><PlusIcon/></button>
          </Panel>
        </ReactFlow>
      </div>

      <div className="">
        {/* TODO: Here onClick should do e.stopPropogation */}
        {isOpen && <div>
          {/* TODO: Actions */}
          {/* TODO: Trigger */}
          {/* When clicked, add the node to "nodes" state, with the icon and label & id? */}
          {/* After adding the node -> the chooseBar will be opened -> as the user clicks -> add the node to the canvas -> open the form to fill in the node's data */}
          {/* Inside the nodes allow "create credentials" -> add a save button  &  then save the things in the DB */}
          {/* Node added(position)    $    node form data    $    credentials that are created on the way(SAVE THIS THEN & THERE, SAVEBUTTON*/}
          {/*  */}
          {/* import Available_triggers & Available_Nodes from /packages/nodes-base */}

          
          </div>}
      </div>
      {/* When clicked upon action -> check state if anyActionAlreadyExists -> If exists -> Toaster(You cannot add more than one trigger as of now. We will soon introduce this functionality.) */}
    </>
  )
}


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