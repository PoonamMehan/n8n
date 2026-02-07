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
    <div className="flex flex-col items-center group">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-md">
        <div className="text-lg text-slate-600">
          {TriggerIconMap[data.nodeIcon]}
        </div>
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
}
// UI
// FE: Start-auth & access_token refresh_token flow -> credentials -> nodes & logs -> workflow new -> new credential

//TODO:
// Continue to app: after redirection