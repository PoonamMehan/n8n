import {Request, Response} from "express";
import bcrypt from "bcrypt";
import PrismaClient from "@repo/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";

const signupSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6, "Password is required and has to be of 6 characters or longer.")
})
const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "Password is required and has to be of 6 characters or longer.")
}).refine((data)=> data.username || data.email, {
  message: "Either username or email is required."
})

export async function signupHandler(req: Request, res: Response){
  //validate the data came in request
  try{
    const validatedData = signupSchema.safeParse(req.body);
    if(!validatedData.success){
      console.log("While signing up, validation failed: ", validatedData.error);
      return res.status(400).send(validatedData.error);
    }
    const {username, email, password} = validatedData.data;

    //encrypt the password using bcrypt
    const saltRounds = 12;
    let cryptedPassword;
    cryptedPassword = await bcrypt.hash(password, saltRounds);
    if(cryptedPassword){
    //store that in the Db
      const userEntryInDb = await PrismaClient.user.create({
        data: {
          email: email,
          username: username,
          password: cryptedPassword
        }
      })
      //check if the email or username already exists errr is there & send a custom error message. //yeah 'P2002' 
      return res.status(200).send(userEntryInDb.id)
    }    
}catch(err: any){
  if(err.code=='P2002'){
    return res.status(400).send(err.message);
    //TODO: find specific return status codes according to different conditions
  }
  return res.status(500).send("Some error occurred at the backend.");
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

        const jwtRefreshToken = jwt.sign({userId: fetchedUser.id}, process.env.REFRESH_SECRET_TOKEN!, {expiresIn: '7d'});

        //save the refresh token in db
        fetchedUser.sessions.push(jwtRefreshToken);
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
        res.cookie('__Host-access_token', jwtAccessToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
        res.cookie('__Host-refresh_token', jwtRefreshToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});   

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

export async function signoutHandler(req: Request, res: Response){
  try{
  //add the middleware, extract the userID
  const { userId, sessions } = req.body;
  // get the refreshToken
  const refreshToken = req.cookies['__Host-refresh_token'];

  // delete that from the user.sessions[] in db
  const newSessionsArr = sessions.filter((seshn: String[]) => seshn != refreshToken);
  const editedUserRecord = await PrismaClient.user.update({
    where: {
      id: userId
    }, 
    data: {
      sessions: newSessionsArr
    }
  }) 
  
  // remove the 'Authorization' cookie from the header
  res.clearCookie('__Host-refresh_token');
  res.clearCookie('__Host-access_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/'
  })

  // return status(200)
  return res.status(200).send("User logged out successfully.");
  }catch(err){
    return res.status(500)
  }
}

export async function refreshJWTokens(req: Request, res: Response){
  try{
    //extract refresh token 
  const refreshToken = req.cookies['__Host-refresh_token']; 
  if(!refreshToken){
    res.status(401).send("No refresh token provided.")
  }
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!); 
  if(typeof decodedToken == 'string'){
    return res.status(400).send("Invalid JWT token. Login again!");
  }
  // find the user with the user Id with the payload found from this refresh token
  const fetchedUser = await PrismaClient.user.findUnique({
    where: {
      id: decodedToken.userId
    }
  })
  if(!fetchedUser){
     // if user does not exist then return status(400) => lead to re-login on FE
    return res.status(400).send("Invalid JWT token. Login again!");
  }

  // if the user exists, then create accessToken , refreshToken
  const newAccessToken = jwt.sign({userId: fetchedUser.id}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: '15m'});
  const newRefreshToken = jwt.sign({userId: fetchedUser.id}, process.env.REFRESH_TOKEN_SECRET!, {expiresIn: '7d'});

  // from db, the already fetched user, remove the old refresh token and add the new one
  const newSessionArr = fetchedUser.sessions.filter((seshn)=>seshn != refreshToken);
  newSessionArr.push(newRefreshToken);

  // set the token in the cookies
  res.cookie('__Host-refresh_token', newRefreshToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
  res.cookie('__Host-access_token', newAccessToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});

  // return status(200)
  res.status(200).send("New Tokens successfully generated.");
  }catch(err){
    res.status(500).send("Some error occurred at the backend.");
  }
  
}


// custom status codes for different situations