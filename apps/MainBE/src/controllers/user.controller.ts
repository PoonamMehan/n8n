import {Request, Response} from "express";
import bcrypt from "bcrypt";
import PrismaClient from "@repo/db";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "Password is required and has to be of 6 characters or longer.")
}).refine((data)=> data.username || data.email, {
  message: "Either username or email is required.",
  path: ["username"]
})

export async function signupHandler(req: Request, res: Response){
  //validate the data came in request
  const validatedData = loginSchema.safeParse(req.body);


  // TODO: ZOD validation

  //encrypt the password using bcrypt
  const saltRounds = 12;
  let cryptedPassword;
  try{
    cryptedPassword = await bcrypt.hash(password, saltRounds);
  }catch(err){
    return res.status(500).send("Some error occurred at the backend while trying to prepare the password to be stored on the DB.");
  }

  //store that in the Db
  let userEntryInDb; 
  try{
    userEntryInDb = await PrismaClient.user.create({
      data: {
        email: email,
        username: username,
        password: cryptedPassword
      }
    })
  }
  catch(err: any){
    // TODO: check if the email or username already exists errr is there & send a custom error message.
    return res.status(500).send(err.message);
  }  
  //return user id
  // TODO: Check the structure of userEntryInDb object and then just send the user id back to the client.
  return res.status(200).send({userEntryInDb})
}

export async function loginHandler(req:Request, res:Response){
  // take the email or username & password 
  const {username, email, password} = req.body;
  
  if(username){
    //TODO: z.string() 

    //search the db for password & handle if any entry with this username doesn't exists
    let fetchedUser;
    try{
      fetchedUser = await PrismaClient.user.findUnique({
        where: {
          username: username
        }
      })
      
      if(fetchedUser){
        const verifyPassword = await bcrypt.compare(password, fetchedUser?.password);
        if(verifyPassword){
          // generate session & refesh tokens
          // set the token in the cookies
          // return the result with "Login Successful!"
          
        }else{
          return res.status(400).send("Incorrect password.");
        }
      }else{
        return res.status(400).send("No user found with this username.")
      }
    }catch(err: any){
      return res.status(500).send(err.message);
    }
    

  }else if(email){
    
  }else{

  }
  // zod validation
  // use bcrypt.compare() to verify the password
  // generate a jwt session token & a jwt refresh token
  // add the refresh token to the DB
  //return the status(200) 
}

export function signoutHandler(){

}

//signup, signin, signout, middleware