import { NodeProps, Handle, Position, Node } from "@xyflow/react";
import { TriggerIconMap } from "./NodeIcons";

type CustomNodeData = {
  nodeIcon: string,
  nodeTitle: string,
  nodeName: string,
  executionData: object
}

export type CustomAIAgentNode = Node<CustomNodeData>
export type CustomActionNode = Node<CustomNodeData>

export function N8nStyleTriggerNode({ data }: NodeProps<CustomAIAgentNode>) {

  return (
    <div>
      <div>
        <div>
          <span>{TriggerIconMap[data.nodeIcon]}</span>
          <span>{data.nodeName}</span>
        </div>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" id="tools" position={Position.Bottom} />
      </div>
    </div>
  )
}

export function N8nStyleToolNode({data}: NodeProps<CustomActionNode>) {
  return(
    <div>
      <div>
        <div>
          {TriggerIconMap[data.nodeIcon]}
        </div>
        <Handle type="target" position={Position.Top} />
      </div>
      <div>
        {data.nodeName}
      </div>
    </div>
  )
}