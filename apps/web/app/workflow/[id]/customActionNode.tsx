// Action Nodes
import { NodeProps, Position, Handle, Node } from "@xyflow/react";
import type { ReactNode } from "react";

type CustomNodeData = {
  nodeTitle: string,
  nodeIcon: ReactNode
}
export type CustomActionNode = Node<CustomNodeData>

export function N8nStyleActionNode({ data }: NodeProps<CustomActionNode>) {

  return(
    <>
    <div>
      {/* A box containing node icon */}
      <div className="w-25">
        {data.nodeIcon}
      </div>
      {/* An invisible bordered box to show labels under the node */}
      <div>{data.nodeTitle}</div>
      <Handle type="target" position={Position.Left}/>
      <Handle type="source" position={Position.Right}/>
    </div>
    </>
  )
};

