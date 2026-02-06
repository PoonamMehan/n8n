'use client'
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateDropdownComponent({ component }: { component: string }) {

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const newWorkflowCreator = async () => {

    try {
      const newWorkflowResponse = await fetch('/api/v1/workflow', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `Workflow_${crypto.randomUUID()}`
        })
      });
      if (!newWorkflowResponse.ok) {
        toast.error('Failed to create workflow. Please try again.');
        return;
      }
      toast.success('Workflow created!');
      const data = await newWorkflowResponse.json();
      const workflowId = data.data.id;
      router.push(`/workflow/${workflowId}`);

    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  }

  const newCredentialCreator = async () => {
    router.push("/home/credentials?modal=create");
  }

  return component == "workflow" ? (
    <>
      <div>
        <div className="flex">

          <button onClick={(e) => { e.preventDefault(); newWorkflowCreator(); }}>Create Workflow</button>
          <button onClick={(e) => { e.preventDefault; setIsOpen(val => !val) }}>{isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}</button>

        </div>

        {isOpen &&

          <div>
            <button onClick={(e) => { e.preventDefault(); newCredentialCreator(); }}>Create Credential</button>
          </div>
        }
      </div>
    </>
  ) : (
    <>
      <div>
        <div className="flex">

          <button onClick={(e) => { e.preventDefault(); newCredentialCreator(); }}>Create Credential</button>
          <button onClick={(e) => { e.preventDefault; setIsOpen(val => !val) }}>{isOpen ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}</button>

        </div>

        {isOpen &&

          <div>
            <button onClick={(e) => { e.preventDefault(); newWorkflowCreator(); }}>Create Workflow</button>
          </div>
        }
      </div>
    </>
  )
}