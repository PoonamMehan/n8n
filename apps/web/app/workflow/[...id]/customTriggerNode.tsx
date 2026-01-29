import { NodeProps, Handle, Position, Node } from "@xyflow/react";
import { ReactNode } from "react";
import { TriggerIconMap } from "./NodeIcons";

type CustomNodeData = {
  nodeIcon: string,
  nodeTitle: string,
  nodeName: string,
  executionData: object
}

export type CustomTriggerNode = Node<CustomNodeData>

export function N8nStyleTriggerNode({ data }: NodeProps<CustomTriggerNode>) {

  return (
     <div className="relative flex min-w-[120px] items-center gap-3 rounded-xl border-2 border-purple-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-purple-500 hover:shadow-md">

      <div className="text-xl text-purple-600">
        {TriggerIconMap[data.nodeIcon]}
      </div>

      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
        {data.nodeName || "AI Agent"}
      </div>
          
      <Handle
        type="target"
        position={Position.Left}
        id="main-input"
        className="!bg-slate-400 !w-3 !h-3 !-left-2" 
      />

      <Handle
        type="source"
        position={Position.Right}
        id="main-output"
        className="!bg-slate-400 !w-3 !h-3 !-right-2" 
      />

      <Handle
        type="source" 
        id="tools"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3 !-bottom-2"
      />
      
    </div>
  )
}