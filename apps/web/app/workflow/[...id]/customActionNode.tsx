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

  return (
    <div className="flex flex-col items-center group">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-md">
        <div className="text-lg text-slate-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-400 !w-2 !h-2 !-left-1.5"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-400 !w-2 !h-2 !-right-1.5"
        />
      </div>
      <div className="mt-1.5 max-w-[90px] text-center text-[10px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors truncate">
        {data.nodeName}
      </div>
    </div>
  )
};//TODO: go onto opening the modal