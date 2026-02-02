'use client'
import { ReactEventHandler, useState } from "react";
import { useRouter } from "next/navigation";

export function Signup (){
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signupHandler = async(e: React.MouseEvent<HTMLButtonElement>)=>{
    try{
      e.preventDefault();
      const signedUpUser = await fetch('/api/v1/auth/signup', {
      method: 'POST',
    })
    if(!signedUpUser.ok){
      // TODO: toaster: Signup again  &  observe the returned codes for correct instructions to user about the payload they are sending.
      // unique constraint error 
      // password small in size
      return;
    }
    setUsername("");
    setEmail("");
    setPassword("");
    router.push("/home/workflows");
    }
    catch(err: any){
      console.log("Error occurred while signing up: ", err, " .Try again later.");
      // TODO: toaster: instruct to signup again because the error occurred on the backend.
    }
  }
  return(
    <>
      <input placeholder="Username" onChange={e=>setUsername(e.target.value)}></input>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)}></input>
      <input placeholder="Password" onChange = {e => setPassword(e.target.value)}></input>
      <button onClick={signupHandler}>Signup</button>
    </>
  )
}
// TODO: loading.tsx

// user gives info -> we hit /auth/signup -> use nodemailer to send the user /auth/login?token=kajreskfg -> in login check the token -> create new access token + refresh token -> redirect the user to /signin FE -> do (/auth/me) -> if authenticated show btn "Go to Dashboard"  -> else show login form -> once use logs in manually -> add the data to the state -> 
// do /auth/me (user will be authenticated or not based on the access token) -> if authenticated -> show go to dashborad -> if not then login form 