'use client'
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LandingPageLoggedIn() {

  const router = useRouter();

  // TODO: Add this in some /lib/utility
  const signoutHandler = async () => {
    // call the /api/v1/auth/signout
    // then redirect to "/" or refresh the page or start showing the LandingPageLoggedOut(No cuz the outermost component is SSR so we can't send any signal from this component tot it, AND, here if we show that, then i don't see any problem because it is saving one backend&Db request time )
    try {
      const h = await fetch('/api/v1/auth/signout', {
        method: 'GET'
      });
      const data = await h.json();
      if (h.ok) {
        if (h.status == 200) {
          //user is signed out now router.refresh()
          toast.success('Signed out successfully!');
          router.refresh();
        }
      } else {
        // toaster: signout unsuccessful
        //retry sign out again? 
        // stay on this page itself
        toast.error('Failed to sign out. Please try again.');
        console.log("Failed to signout, try again: ", data)
      }
    } catch (err: any) {
      //toaster: signout unsuccessful
      toast.error('Failed to sign out. Please try again.');
      console.log("Failed to signout, try again: ", err.message);
    }
  }

  return (
    <>
      <button onClick={signoutHandler}>Sign Out</button>
    </>
  )
}