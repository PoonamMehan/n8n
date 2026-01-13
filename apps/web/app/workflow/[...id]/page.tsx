import React from "react";
import {WorkflowClientComponent} from "./WorkflowEditorClientComponent";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";

export default function WorkflowEditorServerComponent(){
  return(
    <ReactFlowProvider>
      <WorkflowClientComponent/>
    </ReactFlowProvider>
  )
}