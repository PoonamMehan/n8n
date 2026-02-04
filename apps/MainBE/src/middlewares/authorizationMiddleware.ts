import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";

export async function jwtHandler(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("jwtHandler middleware is called.");
    //extract the acess Token from cookies
    const accessToken = req.cookies['__Host-access_token'];
    //verify the access token
    const decodedTokenPayload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    if (typeof decodedTokenPayload == "string") {
      return res.status(400).send("Invalid Access Token");
    }

    // if expired access token, send custom status code to the FE so that it calls /refresh
    // if not expired, check the db for the user with the userId 
    const userInDb = await prisma.user.findUnique({
      where: {
        id: decodedTokenPayload.userId
      }
    })

    // if user not exist in the DB return(400)
    if (!userInDb) {
      //also remove it's Refresh Token from the sessions[] if exists, along with access Token & refreshToken from the cookies
      return res.status(400).send({status: "failed", data: null, error: "No such user exists."});
    }


    //if user exists, add the userId to req object
    req.userId = userInDb.id;
    req.sessions = userInDb.sessions;
    // call next()
    next();
  }
  catch (err: any) {
    //TODO: we can check for the err.name == TokenExpiredError || JsonWebTokenError & send status code for FE to call /refresh
    //TODO: 
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError || err instanceof jwt.TokenExpiredError) {
      return res.status(401).send({status: "failed", data: null, error: "Invalid Token."});
    }
    console.log("Error in jwtHandler middleware: ", err.message);
    return res.status(500).send({status: "failed", data: null, error: `Some error occurred at the backend.`});
  }
}