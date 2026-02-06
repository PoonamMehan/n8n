'use client'
import Link from "next/link";
import { UserIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface Workflow {
  id: number,
  title: string,
  nodes: object,
  connections: object,
  createdAt: string,
  updatedAt: string,
  userId: string,
  executing: boolean
}


export const AllWorkflowsList = ({ workflowsData, overview }: { workflowsData: Workflow[], overview: boolean }) => {
  // TODO: maybe change the type of workflows data
  // take the data and show it here

  return (
    <>
      {/* TODO: if 0 entries in the row */}
      {/* a list of all the workflows */}
      {console.log(workflowsData)}
      {workflowsData?.map((w: Workflow) => {
        return (
          <Link className="mb-3" key={w.id} href={`/workflow/${w.id}`}>
            <div>
              {w.title}
            </div>
            <div>
              {
                overview &&
                <button>
                  <UserIcon className="h-5 w-5" /><span>Personal</span>
                </button>
              }
              <EllipsisVerticalIcon className="h-5 w-5"/>
            </div>
          </Link>
        )
      })}
    </>
  )
}

// if the project == personal && the component calling this send "personal" in the props then do not show the Project name, otherwise show it
