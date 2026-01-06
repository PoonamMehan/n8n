'use client'
import {useState} from 'react';
import Link from 'next/link';
export function CreatDropdownComponent(){
  const [isOpen, setIsOpen] = useState(false);
return(
  <>  
    <div>
      {/* change the project name to be dynamic */}
      <Link href='/workflow/new?project=Personal'>Create Workflow</Link>
      {isOpen && 
        <div>
          <Link href='/credential'>Create Credential</Link>
        </div>
      }
    </div>
  </>
)
}