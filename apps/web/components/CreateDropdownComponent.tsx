'use client'
import {useState} from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from "@heroicons/react/24/outline";


export function CreatDropdownComponent(){

  const [isOpen, setIsOpen] = useState(false);


  return(
    <>  
      <div>
        <div className="flex">

          <Link href='/workflow/new?project=Personal'>Create Workflow</Link>
          <button onClick={(e)=>{e.preventDefault; setIsOpen(val => !val)}}><ChevronDownIcon/></button>

        </div>

        {isOpen && 

          <div>
            <Link href='/credential'>Create Credential</Link>
            {/* update the correct path */}
          </div>
        }
      </div>
    </>
  )
}