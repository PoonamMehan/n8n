import { NodeProps, Handle, Position, Node } from "@xyflow/react";
import { ReactNode } from "react";

type CustomNodeData = {
  nodeIcon: ReactNode,
  nodeTitle: string,
  nodeName: string,
  executionData: object
}

export type CustomTriggerNode = Node<CustomNodeData>

export function N8nStyleTriggerNode ({data}: NodeProps<CustomTriggerNode>){

  return(
    <div>
      <div>{data.nodeIcon}</div>
      <div>{data.nodeName}</div>
      <Handle type="source" position={Position.Right}/>
    </div>
  )
}