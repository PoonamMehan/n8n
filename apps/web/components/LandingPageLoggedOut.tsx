import Link from 'next/link';
export function LandingPageLoggedOut(){

  return(
    <>
    <Link href='/login'>Login</Link>
    <Link href='/signup'>Signup</Link>
    <Link href='/signup'>Get Started</Link>
    </>
  )
}