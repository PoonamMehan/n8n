import Link from "next/link";


export default async function VerifyAuth({ searchParams }: { searchParams: Promise<{ success: string }> }) {

  const success = (await searchParams).success;

  return success === "true" ? (
    <div>
      Logged in successfully!
      <Link href="/home/workflows">Go to Workspace</Link>
    </div>
  ) : (
    <div>
      Magic link expired or invalid!
      <Link href="/start-auth">Login Again</Link>
    </div>
  )
}

// TOASTER: user signed-in successfully