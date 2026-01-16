// Action Nodes
import { NodeProps, Position, Handle, Node } from "@xyflow/react";
import { TriggerIconMap } from "./NodeIcons"

type CustomNodeData = {
  nodeTitle: string,
  nodeIcon: string,
  nodeName: string,
  executionData: object
}
export type CustomActionNode = Node<CustomNodeData>

export function N8nStyleActionNode({ data }: NodeProps<CustomActionNode>) {

  return(
     <div className="flex flex-col items-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
        <div className="text-2xl text-slate-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-slate-400 !w-3 !h-3 !-left-2" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-slate-400 !w-3 !h-3 !-right-2" 
        />
      </div>
      <div className="mt-1 max-w-[100px] text-center text-xs font-semibold text-slate-500">
        {data.nodeName}
      </div>
    </div>
  )
};//TODO: go onto opening the modal