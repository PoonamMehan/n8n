import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { google } from "googleapis";
import { Resend } from "resend";

const signupSchemaNormal = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string().min(6, "Password is required and has to be of 6 characters or longer.")
})

const signupSchema = z.object({
  email: z.email()
})

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  password: z.string().min(6, "Password is required and has to be of 6 characters or longer.")
}).refine((data) => data.username || data.email, {
  message: "Either username or email is required."
})


export async function signupHandler(req: Request, res: Response) {
  //validate the data came in request
  try {
    const validatedData = signupSchema.safeParse(req.body);
    if (!validatedData.success) {
      console.log("While signing up, validation failed: ", validatedData.error);
      return res.status(400).send(validatedData.error);
    }

    console.log("Here is the validated data: ", validatedData);
    const { username, email, password } = validatedData.data;
    console.log(username, " ", email, " ", password);

    //encrypt the password using bcrypt
    const saltRounds = 12;
    let cryptedPassword;
    cryptedPassword = await bcrypt.hash(password, saltRounds);
    console.log("here is the crypted password: ", cryptedPassword);

    if (cryptedPassword) {
      const userEntryInDb = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: cryptedPassword
        }
      });
      console.log("userEntryInDb: ", userEntryInDb);

      // send an email using nodemailer
      // generate a token
      const tempToken = jwt.sign({ userId: userEntryInDb.id, email: userEntryInDb.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

      //LOGIN: 
      // have two options:
      // ?token
      // username OR email & password
      // after success from either of the two methods: 
      // generate access & refresh tokens
      // save the refresh token in db
      // set the token in the cookies
      // return the result with "Login Successful!"
      return res.status(200).send({ status: "success", data: userEntryInDb.id, error: null });
    }

  } catch (err: any) {
    if (err.code == 'P2002') {
      //TODO: specifically which field failed?
      return res.status(400).send({ status: "failed", data: null, error: "Username or email already exists." });
      //TODO: toaster in FE
    }
    console.log("Err while signing up the user: ", err.message);
    return res.status(500).send({ status: "failed", data: null, error: `Some error occurred at the backend: ${err.message}` });
  }
}

const sendEMail = async ({ to, subject, html, from }: { to: string, subject: string, html: string, from?: string }) => {
  const resendAPIKey = process.env.RESEND_API_KEY;
  if (!resendAPIKey) {
    return { success: false, data: null, error: "No resend API key found." };
  }
  const resend = new Resend(resendAPIKey);

  console.log("DAta: ", { from, to, subject, html });
  const { data, error } = await resend.emails.send({
    from: from || 'S30 <no-reply@resend.dev>',
    to,
    subject,
    html
  })

  if (error) {
    return { success: false, data: null, error: error }
  }

  return { success: true, data: data, error: null }
}


const sendLoginMagicLink = async ({ email, token }: { email: string, token: string }) => {
  const backend_url = process.env.BACKEND_URL;
  if (!backend_url) {
    return { success: false, data: null, error: "Missing BACKEND_URL environment variable." };
  }

  const result = await sendEMail({
    to: email,
    subject: "Login to S30 n8n",
    html: `<p>Click <a href="${backend_url}/api/v1/auth/magic-login?token=${token}">here</a> to Login!</p>`
  })

  console.log("Login magic link email: ", result);
  if (result.success) {
    return { success: true, data: result.data, error: null }
  } else {
    return { success: false, data: null, error: result.error }
  }
}

const sendVerificationMagicLink = async ({ email, token }: { email: string, token: string }) => {
  const backend_url = process.env.BACKEND_URL;
  if (!backend_url) {
    return { success: false, data: null, error: "Missing BACKEND_URL environment variable." };
  }

  const result = await sendEMail({
    to: email,
    subject: "Login to S30 n8n",
    html: `<p>Click <a href="${backend_url}/api/v1/auth/magic-verification?token=${token}">here</a> to verify your email!</p>`
  })

  console.log("result: ", result);

  if (result.success) {
    return { success: true, data: result.data, error: null }
  } else {
    return { success: false, data: null, error: result.error }
  }
}

export async function startAuthHandler(req: Request, res: Response) {
  try {
    const payloadData = req.body;
    const validationResult = signupSchema.safeParse(payloadData);
    if (!validationResult.success) {
      console.log("While signing up validation failed: ", validationResult);
      return res.status(400).send({ success: false, data: null, error: "Incorrect email." });
    }

    const { email } = validationResult.data;

    // create entry in the table
    const userExistsInDb = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    const jwt_secret = process.env.ACCESS_TOKEN_SECRET;
    if (!jwt_secret) {
      console.log("No JWT secret found in the .env file.");
      return res.status(500).send({ success: false, data: null, error: "Internal server error." })
    }

    const tempToken = jwt.sign({ email: email }, jwt_secret, { expiresIn: '25m' });

    if (userExistsInDb) {

      if (userExistsInDb.isVerified) {
        // send magic-login link
        const result = await sendLoginMagicLink({ email: email, token: tempToken })
        if (result.success) {
          return res.status(200).send({ success: true, data: "Login link sent successfully", error: null })
        } else {
          return res.status(500).send({ success: false, data: null, error: "Failed to send login link" })
        }

      } else {

        // send magic-verify link
        const result = await sendVerificationMagicLink({ email: email, token: tempToken })
        if (result.success) {
          return res.status(200).send({ success: true, data: "Verification link sent successfully", error: null })
        } else {
          return res.status(500).send({ success: false, data: null, error: "Failed to send verification link" })
        }

      }
    } else {

      // create entry with isVerified == false -> send the magic-verify link
      try {
        const newUser = await prisma.user.create({
          data: {
            email: email,
            isVerified: false
          }
        })

        if (newUser) {
          const result = await sendVerificationMagicLink({ email: email, token: tempToken })
          if (result.success) {
            return res.status(200).send({ success: true, data: "Verification link sent successfully", error: null })
          } else {
            return res.status(500).send({ success: false, data: null, error: "Failed to send verification link" })
          }
        }

      } catch (error) {
        return res.status(500).send({ success: false, data: null, error: "Failed to create a new user" })
      }
    }
  } catch (err) {
    console.log("Error while starting the auth handler: ", err);
    return res.status(500).send({ success: false, data: null, error: "Failed to get you started, try again!" });
  }
}


const generateTokens = (userId: string, email: string) => {
  try {
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
    if (!access_token_secret || !refresh_token_secret) {
      console.log("No access token secret or refresh token secret found in the .env file.");
      return { success: false, data: null, error: "Internal server error" }
    }

    const access_token = jwt.sign({ userId: userId, email: email }, access_token_secret, { expiresIn: '300d' });
    const refresh_token = jwt.sign({ userId: userId, email: email }, refresh_token_secret, { expiresIn: '700d' });
    return { success: true, data: { access_token: access_token, refresh_token: refresh_token }, error: null }
  }
  catch (error) {
    console.log("Error while generating tokens: ", error);
    return { success: false, data: null, error: "Failed to generate tokens." }
  }
}


export const magicLinkHandler = async (req: Request, res: Response) => {

  const reqPath = req.path;
  const source = reqPath.split("/").pop();
  let needToSetVerified;
  if (source == "magic-login") {
    needToSetVerified = false;
  } else {
    needToSetVerified = true;
  }

  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send({ success: false, data: null, error: "No token provided" });
    }
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    if (!access_token_secret) {
      console.log("No access token secret found in the .env file. Here in magic-login handler.");
      return res.status(500).send({ success: false, data: null, error: "Internal server error" })
    }

    const decoded = jwt.verify(token as string, access_token_secret);
    console.log("Decoded: ", decoded);

    if (typeof decoded == "string" || !decoded.email) {
      return res.status(400).send({ success: false, data: null, error: "Invalid token" })
    }

    const userInDb = await prisma.user.findUnique({
      where: {
        email: decoded.email
      }
    })
    if (!userInDb) {
      return res.status(400).send({ success: false, data: null, error: "Invalid token" })
    }

    //generate access & refresh tokens
    const tokens = generateTokens(userInDb.id, userInDb.email);
    if (!tokens.success) {
      return res.status(500).send({ success: false, data: null, error: "Failed to generate tokens" })
    }

    const refresh_token = tokens.data?.refresh_token
    if (!refresh_token) {
      return res.status(500).send({ success: false, data: null, error: "Internal server error" })
    }
    const newSessionsArr = [...userInDb.sessions, refresh_token];

    if (needToSetVerified) {
      await prisma.user.update({
        where: {
          id: userInDb.id
        },
        data: {
          isVerified: true,
          sessions: newSessionsArr
        }
      })
    } else {
      await prisma.user.update({
        where: {
          id: userInDb.id
        },
        data: {
          sessions: newSessionsArr
        }
      })
    }

    // set cookies
    res.cookie("__Host-access_token", tokens.data?.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    res.cookie("__Host-refresh_token", tokens.data?.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    // redirect
    const feURL = process.env.FRONTEND_URL;
    return res.redirect(`${feURL || "http://localhost:3000"}/verify-auth?success=true`);


    //TODO: redirect the user onto the Dashboard -> show a toaster success message

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-auth?success=false`);
    }
    console.log("Error while verifying the token: ", err);
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-auth?success=false`);
  }

}

export async function loginHandler(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      console.log("While logging in, validation failed: ", validatedData.error);
      return res.status(400).send(validatedData.error);
    }

    const { username, email, password } = validatedData.data;

    //search the db for password & handle if any entry with this username doesn't exist
    const fetchedUser = await prisma.user.findUnique({
      where: username ? { username } : { email: email! }
    })

    if (fetchedUser) {
      const verifyPassword = await bcrypt.compare(password, fetchedUser?.password);
      if (verifyPassword) {
        // generate session & refresh tokens
        const accessSecret = process.env.ACCESS_TOKEN_SECRET;
        const jwtAccessToken = jwt.sign({ userId: fetchedUser.id }, accessSecret!, { expiresIn: '15m' });
        console.log("Access Token: ", jwtAccessToken);

        const jwtRefreshToken = jwt.sign({ userId: fetchedUser.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

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
        res.cookie('__Host-access_token', jwtAccessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
        res.cookie('__Host-refresh_token', jwtRefreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

        res.status(200).send({ isSuccessful: true, userData: { username: savedToken.username, email: savedToken.email } });
      } else {
        return res.status(400).send("Incorrect password.");
      }
    } else {
      console.log("No user was found with this username/email.")
      return res.status(400).send("Incorrect credentials.");
    }
  } catch (err: any) {
    return res.status(500).send(`Some error occurred at the backend: ${err.message}`)
  }
}

export async function signoutHandler(req: Request, res: Response) {
  try {
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
    res.clearCookie('__Host-refresh_token', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
    res.clearCookie('__Host-access_token', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })

    // return status(200)
    return res.status(200).send("User logged out successfully.");
  } catch (err: any) {
    return res.status(500).send(`Some error happened at the backend: ${err.message}`);
  }
}

export async function refreshJWTokens(req: Request, res: Response) {
  try {
    //extract refresh token 
    const refreshToken = req.cookies['__Host-refresh_token'];
    if (!refreshToken) {
      res.status(401).send("No refresh token provided.")
    }
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    if (typeof decodedToken == 'string') {
      return res.status(400).send("Invalid JWT token. Login again!");
    }
    // find the user with the user Id with the payload found from this refresh token
    const fetchedUser = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId
      }
    })
    if (!fetchedUser) {
      // if user does not exist then return status(400) => lead to re-login on FE
      return res.status(400).send("Invalid JWT token. Login again!");
    }

    // if the user exists, then create accessToken , refreshToken
    const newAccessToken = jwt.sign({ userId: fetchedUser.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: fetchedUser.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

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
    res.cookie('__Host-refresh_token', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
    res.cookie('__Host-access_token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

    // return status(200)
    res.status(200).send("New Tokens generated successfully.");
  } catch (err) {
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
        if (typeof decoded == 'object') {
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
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    }
    catch (err: any) {
      res.clearCookie('__Host-access_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
      res.clearCookie('__Host-refresh_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
      return res.status(200).json({ isAuthenticated: false, user: null });
    }

    if (typeof decoded == 'string') {
      res.clearCookie('__Host-access_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
      res.clearCookie('__Host-refresh_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
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
      res.clearCookie('__Host-access_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
      res.clearCookie('__Host-refresh_token', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
      return res.status(400).json({ isAuthenticated: false, user: null });
    }
    // Refresh was successful. Generate NEW tokens.
    const newAccessToken = jwt.sign({ userId: existingToken.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: existingToken.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

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

    // set new Cookies
    res.cookie('__Host-access_token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
    res.cookie('__Host-refresh_token', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

    // return success
    return res.status(200).json({
      isAuthenticated: true,
      user: { id: existingToken.id, email: existingToken.email }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// custom status codes for different situations
export const generateTokenForWsConnection = (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    console.log("userId for ws connection: ", userId);
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET) {
      return res.status(500).send("Internal Server Error");
    }

    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
    return res.status(200).json({ token: accessToken });
  } catch (err) {
    console.log("Error in generateTokenForWsConnection controller: ", err);
    return res.status(500).send("Internal Server Error");
  }
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8000/api/v1/auth/google/callback"
);

export const googleAuthRequestHandler = (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).send({ success: false, data: null, error: "Unauthorized" });
  }

  let name = req.query.name;
  if (!name) name = crypto.randomUUID();

  // Encode both name and userId in state parameter so callback can access userId
  const stateData = JSON.stringify({ name: name, userId: userId });

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state: stateData
  });

  res.redirect(url);
};

export const googleAuthCallbackHandler = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  // Decode state parameter to get userId and credential name
  if (!state) {
    return res.status(400).send({ success: false, data: null, error: "No state provided" });
  }

  let stateData: { name: string; userId: string };
  try {
    stateData = JSON.parse(state as string);
  } catch (err) {
    return res.status(400).send("Invalid state parameter");
  }

  const userId = stateData.userId;
  const credentialName = stateData.name;

  if (!userId) {
    return res.status(401).send("Unauthorized - no userId in state");
  }

  try {
    // swap Code for Tokens
    if (!code) {
      return res.status(400).send("No code provided");
    }
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    // save to Your Database (Prisma/Mongoose)
    const createdCredential = await prisma.credentials.create({
      data: {
        userId: userId,
        title: credentialName || "Gmail Account",
        platform: "GmailAccount",
        data: { tokens: JSON.stringify(tokens), name: credentialName, email }
      }
    });
    console.log("createdCredential: ", createdCredential);

    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              status: "success",
              credential: {
                id: ${createdCredential.id},
                name: "${state as string}",
                platform: "GmailAccount"
              }
            }, "http://localhost:3000");
            window.close();
          </script>
          <p>Authentication successful! Closing...</p>
        </body>
      </html>
    `;
    res.send(html);


  } catch (error) {
    console.error("Google OAuth Error:", error);
    console.error(error);
    res.send('<script>window.close();</script>');
  }
};

//nam
// exer(wak)
// tech:
// BE, FE, devops, kafka, code best practices FE