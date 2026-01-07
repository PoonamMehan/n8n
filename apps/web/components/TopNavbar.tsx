'use client';
import Link from "next/link";

enum Tab {
  Workflows = "Workflows",
  Credentials = "Credentials"
}
// TODO: Further make it generic for all the top navbars (i.e. can be used for /home/workflows & /personal/workflows)
export const TopNavbar = ({tabOpened}: {tabOpened: Tab})=>{
  const allTabs: Record<Tab, string> = {[Tab.Workflows]: "/home/workflows", [Tab.Credentials]: "/home/credentials"};

  return(
    <>
      <div>
        {Object.entries(allTabs).map(([key, value])=>{
          return (tabOpened==key)? (
            <div key={key}>{key}</div>
          ): (
            <Link href={value} key={key}>{key}</Link>
          )
          })}
      </div>
    </>
  )
}