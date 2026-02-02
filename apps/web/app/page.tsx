import { ClientAuthHandlerShell } from "./ClientAuthHandlerShell";
import {LandingPageLoggedIn } from "../components/LandingPageLoggedIn";
import {LandingPageLoggedOut } from "../components/LandingPageLoggedOut";
import {LandingPage} from "../components/LandingPage";

export default async function Home() {
  let userLoginStatus;
  let user;
  //we fetch the user status here and set the state in the store
  try{
    //SSR, cuz cache: 'no-store'
    const res = await fetch('/api/v1/auth/me', {
      credentials: "include",
      cache: 'no-store'
    })
    if (res.ok){
      const resData = await res.json();
      console.log("User Login Data full object: ", resData)
      userLoginStatus = resData.isAuthenticated;
      user = resData.user
    }else{
      userLoginStatus = false
    }
  }catch(err){
    userLoginStatus = false;
  }

  return userLoginStatus? (
    <>
      <ClientAuthHandlerShell isLoggedIn={userLoginStatus} userId={user.id} username={user.username}>
        <LandingPageLoggedIn />
        <LandingPage isLoggedIn={userLoginStatus} />  
      </ClientAuthHandlerShell>
    </>
  ):(
    //  if userLoginStatus = false show "Login", "SIGNUP" & "GET STARTED"
    <>  
      <ClientAuthHandlerShell isLoggedIn={userLoginStatus} userId={null} username={null}>
        <LandingPageLoggedOut />
        <LandingPage isLoggedIn={userLoginStatus} />  
      </ClientAuthHandlerShell>
    </>
  );
}