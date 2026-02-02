// SSR
// get the userinfo 
// logged in -> Go to the workspace
// Logged Out -> Get Started
import Link from 'next/link';

export const LandingPage = ({isLoggedIn}: {isLoggedIn: boolean}) => {
    return isLoggedIn? (
        <>
          <Link href="/home/workflows">Go to Workspace</Link>
        </>
    ): (
        <>
          <Link href="/start-auth">Get Started</Link>
        </>
    )
}