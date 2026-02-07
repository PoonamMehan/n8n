// Action Nodes
import { NodeProps, Position, Handle, Node } from "@xyflow/react";
import { TriggerIconMap } from "./NodeIcons"

type CustomNodeData = {
  nodeTitle: string,
  nodeIcon: string,
  nodeName: string,
  executionData: object,
  executionStatus?: 'running' | 'success' | 'failed'
}
export type CustomActionNode = Node<CustomNodeData>

export function N8nStyleActionNode({ data }: NodeProps<CustomActionNode>) {

  const status = data.executionStatus;
  let statusClasses = "border-slate-200";
  if (status === 'success') statusClasses = "border-green-500 ring-2 ring-green-200/50 shadow-md shadow-green-100";
  if (status === 'failed') statusClasses = "border-red-500 ring-2 ring-red-200/50 shadow-md shadow-red-100";
  if (status === 'running') statusClasses = "border-amber-400 ring-2 ring-amber-200/50 animate-pulse";

  return (
    <div className="flex flex-col items-center group">
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 shadow-sm transition-all duration-200 ${status ? '' : 'hover:border-slate-400 hover:shadow-md'} ${statusClasses}`}>
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
      <div className="mt-1.5 max-w-[90px] text-center text-[10px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors whitespace-normal leading-tight">
        {data.nodeName}
      </div>
    </div>
  )
};//TODO: go onto opening the modal