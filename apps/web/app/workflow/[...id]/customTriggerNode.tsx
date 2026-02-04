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
    <div className="flex flex-col items-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
        <div className="text-2xl text-slate-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>
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
}
// UI
// FE: Start-auth & access_token refresh_token flow -> credentials -> nodes & logs -> workflow new -> new credential 