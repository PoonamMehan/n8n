import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {prisma} from "@repo/db";
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
    console.log("Here is the validated data: ", validatedData);
    const {username, email, password} = validatedData.data;
    console.log(username, " ", email, " ", password);
    //encrypt the password using bcrypt
    const saltRounds = 12;
    let cryptedPassword;
    cryptedPassword = await bcrypt.hash(password, saltRounds);
    console.log("here is the crypted password: ", cryptedPassword);
    if(cryptedPassword){
    //store that in the Db
      const userEntryInDb = await prisma.user.create({
        data: {         
          email: email,
          username: username,
          password: cryptedPassword
        }
      });
      console.log("userEntryInDb: ", userEntryInDb);
      //check if the email or username already exists err is there & send a custom error message. //yeah 'P2002' 
      return res.status(200).send(userEntryInDb.id)
    }    
}catch(err: any){
  if(err.code=='P2002'){
    return res.status(400).send(err.message);
    //TODO: find specific return status codes according to different conditions
  }
  console.log("Err while logging in the user: ", err.message);
  return res.status(500).send(`Some error occurred at the backend: ${err.message}`);
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
    const fetchedUser = await prisma.user.findUnique({
      where: username? {username} : {email: email!}
    })

    if(fetchedUser){
      const verifyPassword = await bcrypt.compare(password, fetchedUser?.password);
      if(verifyPassword){
        // generate session & refresh tokens
        const accessSecret = process.env.ACCESS_TOKEN_SECRET;
        const jwtAccessToken = jwt.sign({userId: fetchedUser.id}, accessSecret!, {expiresIn: '15m'});
        console.log("Access Token: ", jwtAccessToken);

        const jwtRefreshToken = jwt.sign({userId: fetchedUser.id}, process.env.REFRESH_TOKEN_SECRET!, {expiresIn: '7d'});

        //save the refresh token in db
        fetchedUser.sessions.push(jwtRefreshToken);
        const savedToken = await prisma.user.update({
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

        res.status(200).send({isSuccessful: true, userData: {username: savedToken.username, email: savedToken.email}});
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
  const userId = req.userId!;
  const sessions = req.sessions!;
  // get the refreshToken
  const refreshToken = req.cookies['__Host-refresh_token'];

  // delete that from the user.sessions[] in db
  const newSessionsArr = sessions.filter((seshn) => seshn != refreshToken);
  // it should work because the middleware has already checked that a user with this user id exists unless some network or db's internal working error occurs
  const editedUserRecord = await prisma.user.update({
    where: {
      id: userId
    }, 
    data: {
      sessions: newSessionsArr
    }
  }) 
  
  // remove the 'Authorization' cookie from the header
  res.clearCookie('__Host-refresh_token', {httpOnly: true, sameSite: 'lax', secure: true, path: '/'});
  res.clearCookie('__Host-access_token', { httpOnly: true, sameSite: 'lax', secure: true, path: '/'})

  // return status(200)
  return res.status(200).send("User logged out successfully.");
  }catch(err: any){
    return res.status(500).send(`Some error happened at the backend: ${err.message}`);
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
  const fetchedUser = await prisma.user.findUnique({
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
  const newSessionsArr = fetchedUser.sessions.filter((seshn: any) => seshn != refreshToken);
  newSessionsArr.push(newRefreshToken);

  const addRefreshTokenToDb = await prisma.user.update({
    where: {
      id: fetchedUser.id
    },
    data: {
      sessions: newSessionsArr
    }
  })

  // set the token in the cookies
  res.cookie('__Host-refresh_token', newRefreshToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
  res.cookie('__Host-access_token', newAccessToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});

  // return status(200)
  res.status(200).send("New Tokens generated successfully.");
  }catch(err){
    res.status(500).send("Some error occurred at the backend.");
  }
  
}

export const getMe = async (req: Request, res: Response) => {
  try {
    // Try to verify the ACCESS TOKEN first
    const accessToken = req.cookies['__Host-access_token'];
    
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        if(typeof decoded == 'object'){
          const user = await prisma.user.findUnique({ 
            where: { id: decoded.userId },
            select: { id: true, username: true, email: true } 
          });
          return res.status(200).json({ isAuthenticated: true, user });
        }
      } catch (err) {
        // Token invalid or expired? Fall through to next
      }
    }

    console.log("I did not run.")
    // Access Token failed/missing, try REFRESH TOKEN.
    const refreshToken = req.cookies['__Host-refresh_token'];
    
    if (!refreshToken) {
      return res.status(200).json({ isAuthenticated: false, user: null });
    }

    let decoded;
    try{
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    }
    catch(err: any){
        res.clearCookie('__Host-access_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
        res.clearCookie('__Host-refresh_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
        return res.status(200).json({ isAuthenticated: false, user: null });  
    }

    if(typeof decoded == 'string'){
      res.clearCookie('__Host-access_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
      res.clearCookie('__Host-refresh_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
      return res.status(200).json({ isAuthenticated: false, user: null });  
    }
      // Verify Refresh Token (Check DB, etc. reuse refresh logic here)
      const existingToken = await prisma.user.findUnique({
        where: {
          id: decoded.id
        }
      });

      if (!existingToken) {
       // Refresh token is dead. Clear cookies and return false.
       res.clearCookie('__Host-access_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
       res.clearCookie('__Host-refresh_token', {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
       return res.status(200).json({ isAuthenticated: false, user: null });
      }
    // Refresh was successful. Generate NEW tokens.
    const newAccessToken = jwt.sign({userId: existingToken.id}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: '15m'});
    const newRefreshToken = jwt.sign({userId: existingToken.id}, process.env.REFRESH_TOKEN_SECRET!, {expiresIn: '7d'});
    
    const newSessionArr = existingToken.sessions.filter((seshn: any) => seshn != refreshToken);
    newSessionArr.push(newRefreshToken);

    // Update DB with new refresh token (Rotate)
    await prisma.user.update({
      where: {
        id: existingToken.id
      },
      data: {
        sessions: newSessionArr
      }
    }); 

    // Set new Cookies
    res.cookie('__Host-access_token', newAccessToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});
    res.cookie('__Host-refresh_token', newRefreshToken, {httpOnly: true, secure: true, sameSite: 'lax', path: '/'});

    // Return success
    return res.status(200).json({ 
      isAuthenticated: true, 
      user: { id: existingToken.id, username: existingToken.username, email: existingToken.email } 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// custom status codes for different situations