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
     <div className="flex flex-col items-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-green-400 hover:shadow-md">
        
        <div className="text-xl text-slate-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>

        <Handle
          type="target"
          position={Position.Top}
          id="tool-output"
          className="bg-slate-400! w-3! h-3! -top-2!"
        />
        
      </div>
      
      <div className="mt-2 max-w-[100px] text-center text-xs font-semibold text-slate-500">
        {data.nodeName} 
      </div>

    </div>
  )
}