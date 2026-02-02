'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export function login(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const loginHandler = async() => {
    const data = {username, password};
    try{
    const loggedInUser = await fetch('/api/v1/auth/login', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const loggedInUserData = await loggedInUser.json();
    if(loggedInUser.ok){
      // good now redirect to /home/workflows
      console.log("Logged in user response: ", loggedInUser);
      if(loggedInUserData.isSuccessful){
        //Toaster
        console.log("User signed in successfully!");
        router.push('/home/workflows');
      }else{
        console.log("Something wrong happened on our end: ", loggedInUser)
      }
    }else{
      // TODO: custom error message
      console.log('Some error occured while logging in the user: ', loggedInUserData)
    }
  }catch(err: any){
    console.log('Some error occured while logging in the user: ', err.message)
  }
    
  }

  return(
    <> 
    <input placeholder="Username" id="username" onChange={e => {e.preventDefault(); setUsername(e.target.value)}}></input>
    <input placeholder="Password" id="password" onChange={e => {e.preventDefault(); setPassword(e.target.value)}}></input>
    <button onClick={loginHandler}>Login</button>
    </>
  )
}
// n8n: 
// hackathon:
// draw ai:
// bolt: 