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
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, ReactFlowProvider, Node, OnNodesChange, OnEdgesChange, Edge, OnConnect, Background, BackgroundVariant, Panel, Controls, useReactFlow } from "@xyflow/react";
import {N8nStyleActionNode} from "./customActionNode";
import {N8nStyleTriggerNode} from "./customTriggerNode";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import '@xyflow/react/dist/style.css';
import { Available_Actions } from "./Available_Actions";
import { Available_Triggers } from "./Available_Triggers";
import { TriggerIconMap } from "./NodeIcons";
import Link from "next/link";
import { CustomActionNode } from "./customActionNode";
import {CustomTriggerNode} from "./customTriggerNode";
import { NodeForm } from "./NodeForm";


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
// WorkflowEditorServerComponent =
// export default ({workflow}: {workflow: Workflow}) => {

// TODO: make this a server component
export const WorkflowClientComponent = () => {
  const [workflow, setWorkflow ] = useState<Workflow>();
  const { id } = useParams<{id: string[]}>();
  const workflowId = id[0];
  const [ isSaved, setIsSaved ] = useState(true);
  useEffect(()=>{
    try{
      console.log("Started fetching...");
      (async()=>{
        const fetchedWorkflow = await fetch(`http://localhost:8000/api/v1/workflow/${workflowId}`);
        const fetchedWorkflowData = await fetchedWorkflow.json();
        console.log("Fetch response: ", fetchedWorkflowData);
        if(!fetchedWorkflow.ok){
          // TODO: Could not fetch the workflow: Toaster, & redirect maybe on the /home/workflows;
          console.log(`Some error occurred while fetcing the workflow: ${fetchedWorkflowData}`);
        }
        // set edges and nodes
        setEdges(fetchedWorkflowData.connections);
        setNodes(fetchedWorkflowData.nodes);
        console.log("Workflow: ", fetchedWorkflowData);
        console.log("Workflow Edges: ", fetchedWorkflowData.connections);
        console.log("Workflow Nodes: ", fetchedWorkflowData.nodes);
        setWorkflow(fetchedWorkflowData);
      })();
    }catch(err: any){
      console.log(`Some error occurred while fetching the workflow: ${err.message}`);
    }     
  },[])

  const saveWorkflow = async () => {
    //store all the "nodes" & "edges" into the db
    // 

    console.log("Edges: ", edges);
    try{
      const updatedWorkflow = await fetch(`http://localhost:8000/api/v1/workflow/${workflowId}`,{
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connections: edges,
        nodes: nodes
      })
      } )

      console.log("updatedworkfow: ", updatedWorkflow);
      if(!updatedWorkflow.ok){
        setIsSaved(false);
        return;
      }
      setIsSaved(true);
    }catch(err: any){
      console.log("Failed to save Workflow in the db.");
      setIsSaved(false);
    }
    //TODO: isSaved has to be checked before the user leaves this page. 
  }
    // /api/v1/workflow/:id      (put, :id) 
    const [isOpen, setIsOpen] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { screenToFlowPosition } = useReactFlow();
    const [isTriggerNodePresent, setIsTriggerNodePresent] = useState(false);
    // TODO: HANDLE THIS  
    const [activeNodeForm, setActiveNodeForm] = useState<CustomActionNode | null>(null);
    // change this when nodes are fetched -> and change when a new trigger is added -> and change when trigger is deleted
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
    
    useEffect(()=>{
      setIsSaved(false);
    }, [nodes, edges]);


  
    // TODO: useEffect(, []) => fetch the workflow and add the nodes to "nodes[]" & connections to "edges[]";
    // 

    const calculateCenterOnEditor = ()=>{
      //TODO: take a reference of the Editor component itself for more precise center
      const centerScreenX = window.innerWidth / 2;
      const centerScreenY = window.innerHeight / 2;
      const position = screenToFlowPosition({ 
        x: centerScreenX, 
        y: centerScreenY 
      });
      return position;
    }

    const findTheNameForTheNode = (titleMatch: string)=>{
      let newSerialNum = 0;
      console.log("I am running, and here ar ethe nodes: ", nodes);
      console.log("Title to match: ", titleMatch);
      const regex = /^(?<name>.+?)\s+(?<number>\d+)$/;
      nodes.forEach((val)=>{
        console.log("val bro: ", val);
        // val.data.title 
        // then just count the number of them & add 1 to it and just name the node 
        const match = (val.data.nodeName as string).match(regex);
        if(!match?.groups){
          return;
        }
        if(match.groups.name == titleMatch && match.groups.number){
          newSerialNum = Math.max(newSerialNum, Number(match.groups.number));
        }
      })
      newSerialNum++;
      console.log("Here is the serial Number i have calculated: ", newSerialNum);
      return newSerialNum;
    }

    const addNodeToCanvas = (type: 'actionNode' | 'triggerNode', title: string, icon: string, defaultName: string) => {
      console.log("type of the node: ", type, "& isTriggerNodePresent: ", isTriggerNodePresent); 

      if(type == 'triggerNode' && isTriggerNodePresent){
        // Toaster: This version supprts only 1 trigger node. New updates coming!
        alert('Only 1 trigger node is allowed');
        return;
      }else if(type == 'triggerNode'){
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
        data: { nodeTitle: title, nodeIcon: icon, nodeName: `${defaultName} ${newSerialNum}`, executionData: {}}
      };
      setNodes((oldNodes) => [...oldNodes, newNode]);
      setIsOpen(false);
      // open the modal (change the url -> with the Info about the node show the modal -> fetch parameters of the node from in-memory variable -> show the form -> )
      // 
      // TODO: set activeNodeForm -> find where do i get the node from "nodes" -> forcefully update the state "nodes" -> 
      setActiveNodeForm(newNode);
  };

    useEffect(()=>{
      console.log("isOpen changed: ", isOpen)
    }, [isOpen]);

    function formDataHandler(formData: Record<string, any>, id: string){
      console.log("Form Data: ", formData);
      nodes.forEach((node)=>{
        if(node.id == id){
          node.data.executionData = formData;
        }
      })
    }

  return(
    <>
      {/* Header Section */}
      <div className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm" onClick={(e)=>{setIsOpen(false)}}>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span className="text-gray-400">Personal</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">{workflow && workflow.title}</span>
        </div>
        <div>
          {/* TODO: Write a function which will save the workflow(nodes, edges, nodes' form info, credentials(separately)) in DB*/}
          <button 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={e => {e.preventDefault(); saveWorkflow()}}
          >
            Save
          </button>
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
        onConnect={ onConnect }
        fitView
        nodeTypes={nodeTypes}
        onClick={(e)=>{setIsOpen(false)}}
        // Logic: When a node is clicked, set the activeNode state to open the modal
        onNodeClick={(event, node) => setActiveNodeForm(node as CustomActionNode)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
          />
          <Controls/>
          <Panel position="top-right" onClick={(e)=>e.stopPropagation()}>
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-900/5 transition hover:bg-gray-50 hover:text-blue-600" 
              onClick={(e: any)=>{e.preventDefault(); setIsOpen(true)}}
            >
              <PlusIcon/>
            </button>
          </Panel>
        </ReactFlow>
        {/* Sidebar overlay*/}
        <div onClick={(e)=>{e.stopPropagation()}} className={`absolute right-4 top-4 z-50 ${!isOpen ? 'pointer-events-none' : ''}`}>
          {isOpen && <div className="h-auto w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">TRIGGERS</div>
                <button className="text-gray-400 hover:bg-slate-100 hover:text-gray-600 rounded p-1 transition-colors" onClick={(e: any)=>{e.preventDefault(); setIsOpen(false)}}>
                  <XMarkIcon className="h-5 w-5"/>
                </button>
              </div>
              {/* <div>LIST OF TRIGGERS: Clickable, title & description & icn </div> */}
              <div className="block space-y-1 mb-4">{Object.entries(Available_Triggers).map(([key, val])=>(
                <Link href="" onClick={(e)=>addNodeToCanvas('triggerNode', val.title, val.icon, val.defaultName)} key={key} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{TriggerIconMap[val.icon] || TriggerIconMap['default']}</div>
                  <div className="flex flex-col"><span className="text-sm font-semibold text-gray-700">{val.title}</span><span className="text-xs text-gray-400 line-clamp-1">{val.description}</span></div>
                </Link>
              ))}</div>
            </div>
            <div className="mb-2 pb-2"> 
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Actions</div>
              {/* <div>LIST OF ACTIONS: Clickable, title & description & Icon   -- --  onClick: open a modal, add the node on the screen & custom name(check the nodes with the same name -> add +1 number at the next node -> the modal finally(LOGIC)</div> */}
              <div className="space-y-1">{Object.entries(Available_Actions).map(([key, val])=>(
                <Link href="" onClick={(e)=>addNodeToCanvas( 'actionNode', val.title, val.icon, val.defaultName)} key={key} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-all cursor-pointer">
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
                 <button className="absolute top-4 right-4" onClick={() => setActiveNodeForm(null)}><XMarkIcon className="h-6 w-6"/></button>
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
                  <NodeForm formDataHandler={formDataHandler} title={activeNodeForm.data.nodeTitle} type={activeNodeForm.type!} alreadyFilledValues={activeNodeForm.data.executionData} nodeId={activeNodeForm.id} />
              </div> 
            </div>
          </div>
        )}
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

// TODO: nodes from db, render on the canvas
// TODO: nodes chosing from sidebar:
// fetch from packages/nodes-base -> add the list to the sidebar -> allow to be clicked upon & add to "nodes" state & open the modal
// TODO: logic to delete a node & its adjacent edges 
// TODO: if trigger is deleted then set isTriggerNodePresent = false