import { NodeProps, Handle, Position, Node } from "@xyflow/react";
import { TriggerIconMap } from "./NodeIcons";

type CustomNodeData = {
  nodeIcon: string,
  nodeTitle: string,
  nodeName: string,
  executionData: object,
  executionStatus?: 'running' | 'success' | 'failed'
}

export type CustomAIAgentNode = Node<CustomNodeData>
export type CustomActionNode = Node<CustomNodeData>

export function N8nStyleAIAgentNode({ data }: NodeProps<CustomAIAgentNode>) {

  const status = data.executionStatus;
  let statusClasses = "border-purple-200";
  if (status === 'success') statusClasses = "border-green-500 ring-2 ring-green-200/50 shadow-md shadow-green-100";
  if (status === 'failed') statusClasses = "border-red-500 ring-2 ring-red-200/50 shadow-md shadow-red-100";
  if (status === 'running') statusClasses = "border-amber-400 ring-2 ring-amber-200/50 animate-pulse";

  return (
    <div className={`relative flex min-w-[120px] items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all ${status ? '' : 'hover:border-purple-500 hover:shadow-md'} ${statusClasses}`}>

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

export function N8nStyleToolNode({ data }: NodeProps<CustomActionNode>) {

  const status = data.executionStatus;
  let statusClasses = "border-purple-200";
  if (status === 'success') statusClasses = "border-green-500 ring-2 ring-green-200/50 shadow-md shadow-green-100";
  if (status === 'failed') statusClasses = "border-red-500 ring-2 ring-red-200/50 shadow-md shadow-red-100";
  if (status === 'running') statusClasses = "border-amber-400 ring-2 ring-amber-200/50 animate-pulse";

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-all ${status ? '' : 'hover:border-purple-400 hover:shadow-md'} ${statusClasses}`}>

        <div className="text-xl text-purple-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>

        <Handle
          type="target"
          position={Position.Top}
          id="tool-input"
          className="!bg-purple-400 !w-2 !h-2 !-top-1.5"
        />

      </div>

      <div className="mt-2 max-w-[100px] text-center text-xs font-semibold text-slate-500 whitespace-normal leading-tight">
        {data.nodeName}
      </div>

    </div>
  )
}