import { WorkflowProvider } from './WorkflowProvider';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkflowProvider>
      {children}
    </WorkflowProvider>
  )
}
