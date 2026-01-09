'use client'

interface Workflow{
  id: number,
  title: string,
  enabled: boolean,
  nodes: object,
  connections: object,
  createdAt: string,
  updatedAt: string,
  userId: string
}

const WorkflowEditorClientComponent = ({workflow}: {workflow: Workflow}) => {
  return(
    <>
      
    </>
  )
}