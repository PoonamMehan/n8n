// top Bar: "personal/workflow name" & "Save button"
// React flow canvas
// "absolute" ly placed nodes & credentials (which are links to open the "modal" )
// add workflow modal & data structure figure out
// modal itself

// logic to let only one trigger be added (as of V0);
// logic to remove left joint from a trigger node
// data structure of a node will come from where? In json format in memory? in db? 

// figure out the drag and drop placement of nodes
import { useState, useCallback } from "react";
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, useNodesState } from "@xyflow/react";
import {N8nStyleActionNode} from "./customActionNode";
import {N8nStyleTriggerNode} from "./customTriggerNode";

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

export const WorkflowEditorServerComponent = ({workflow}: {workflow: Workflow}) => {
  const saveWorkflow = () => {
  }
    // /api/v1/workflow/:id      (put, :id) 
    const [isOpen, setIsOpen] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);


    const onNodesChange: OnNodesChange = useCallback((changes)=>setNodes((nodesSnapshot)=> applyNodeChanges(changes, nodesSnapshot)), []);
    const onEdgesChange: OnEdgesChange = useCallback((changes)=>setEdges((edgesSnapshot)=> applyEdgeChanges(changes, edgesSnapshot)), []);
    const onConnect: OnConnect = useCallback((params)=>setEdges((edgesSnapshot)=>addEdge(params, edgesSnapshot)), []);
    const nodeTypes = {
      actionNode: N8nStyleActionNode,
      triggerNode: N8nStyleTriggerNode
    }

  return(
    <>
      <div>
        {/* workflow name       &       save button */}
        <div>
          <span>Personal</span>
          <span>/</span>
          <span>{workflow.title}</span>
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
        nodeTypes={nodeTypes}
        />


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
      </div>
    </>
  )
}


// nodes modal: Triggers List    &     Actions List
// Ensure only one trigger is used

// TODO: Optimize this component by converting the main Component to a server Component & creatng different components for Client components.
// 