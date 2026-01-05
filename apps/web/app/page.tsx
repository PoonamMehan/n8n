export default async function Home() {
  // if user is loggedIn then show "SIGNOUT" & "CONTINUE CREATING"
  // if logged out then show "Login", "SIGNUP" & "GET STARTED"

  //to know if the user is logged in: 
  // create endpoint /auth/me
  // 

  let userLoginStatus;
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
    }else{
      userLoginStatus = false
    }
  }catch(err){
    userLoginStatus = false;
  }
  
  
  
  // here should i use axios/fetch: fetch all the way!
  // do I need to do ISR? : NO cuz once the result came it will stay until signout or login buttons are not pressed, and once they are pressed then the onClick event handling function will automatically handle if we have to make changes in the component.
  // just SSR(cuz specific to every user)
  
  
  // fetch(userInfo)
  // isAuthorized =true then userLogginStatus = true
  // 


  return userLoginStatus? (
    // if userLoginStatus = true show "SIGNOUT" & "CONTINUE CREATING
    <>
    {/* This component could be designed by making a single component and then passing "SignOut" or "Login" alng with hrefs to that cmponent, along with "Continue Creating" or "Get Started" */}
      {/* Create this C1 */}
      
    </>
  ):(
    //  if userLoginStatus = false show "Login", "SIGNUP" & "GET STARTED"
    <>  
      {/* Create this C2 */}
      <button>Login</button>
      <button>Signup</button>
      <button>Get Started</button>
    </>
  );
}
