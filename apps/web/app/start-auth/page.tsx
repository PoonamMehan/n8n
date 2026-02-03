'use client'
import { useState } from "react";

export default function StartAuth() {
  const [email, setEmail] = useState("");

  const authHandler = async () => {
    try {
      const authenticatedUser = await fetch('http://localhost:8000/api/v1/auth/startAuth', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const authenticatedUserData = await authenticatedUser.json();
      if (authenticatedUser.ok) {
        //till then show loader
        console.log("Logged in user response: ", authenticatedUser);
        if (authenticatedUserData.success) {
          //Toaster: check your inbox
          console.log("User signed in successfully!");

        } else {
          console.log("Something wrong happened on our end: ", authenticatedUser);
          //some error happened on our end, try agian later
        }
      } else {
        //Toaster: if code 400, wrong credentials 
        //if 500, some error happened on our end, try again later
        console.log('Some error occured while logging in the user: ', authenticatedUserData)
      }
    } catch (err: any) {
      //TOASTER: some error happened on our end, try again later
      console.log('Some error occured while logging in the user: ', err.message)
    }

  }

  return (
    <>
      <input placeholder="Email" id="email" onChange={e => { e.preventDefault(); setEmail(e.target.value) }}></input>
      <button onClick={authHandler}>Get Started</button>
    </>
  )
}