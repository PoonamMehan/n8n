import {Request, Response} from "express";
import bcrypt from "bcrypt";
import PrismaClient from "@repo/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";

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
  try{
    const validatedData = loginSchema.safeParse(req.body);
    if(!validatedData.success){
      console.log("While logging in, validation failed: ", validatedData.error);
      return res.status(400).send(validatedData.error);
    }
    const {username, email, password} = validatedData.data;

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
}catch(err){

}
}

export async function loginHandler(req:Request, res:Response){
  try{
    const validatedData = loginSchema.safeParse(req.body);
    if(!validatedData.success){
      console.log("While logging in, validation failed: ", validatedData.error);
      return res.status(400).send(validatedData.error);
    }

    const {username, email, password} = validatedData.data;

    //search the db for password & handle if any entry with this username doesn't exist
    const fetchedUser = await PrismaClient.user.findUnique({
      where: username? {username} : {email: email!}
    })

    if(fetchedUser){
      const verifyPassword = await bcrypt.compare(password, fetchedUser?.password);
      if(verifyPassword){
        // generate session & refresh tokens
        const accessSecret = process.env.ACCESS_TOKEN_SECRET;
        const jwtAccessToken = jwt.sign({userId: fetchedUser.id}, accessSecret!, {expiresIn: '15m'});
        console.log("Access Token: ", jwtAccessToken);

        const refreshToken = jwt.sign({userId: fetchedUser.id}, process.env.REFRESH_SECRET_TOKEN!, {expiresIn: '7d'});

        //save the refresh token in db
        fetchedUser.sessions.push(refreshToken);
        const savedToken = await PrismaClient.user.update({
          where: {
            id: fetchedUser.id
          }, 
          data: {
            sessions: fetchedUser.sessions
          }
        })
        //we can set the session limit to avoid bloated DB due to a lot of stalled refresh tokens.

        // set the token in the cookies
        // return the result with "Login Successful!"
        res.cookie('Authorization', jwtAccessToken, {httpOnly: true, secure: true, sameSite: 'lax'});
        res.status(200).send("User logged in successfully.");
      }else{
        return res.status(400).send("Incorrect password.");
      }
    }else{
      console.log("No user was found with this username/email.")
      return res.status(400).send("Incorrect credentials.");
    }
    
  }catch(err: any){
    return res.status(500).send(`Some error occurred at the backend: ${err.message}`)
  }
}

export function signoutHandler(){

}

//signup, signin, signout, middleware