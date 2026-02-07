import { prisma } from "@repo/db";
import type { WebSocket } from "ws";
import nodemailer from "nodemailer";

export const gmailNodeExecutor = async (wsClients: Map<string, WebSocket>, workflowSubscribers: Map<string, Set<WebSocket>>, fullExecutionData: Record<string, any>, executionData: any, workflowId: string, nodeName: string) => {

  const subscribers = workflowSubscribers.get(workflowId);
  console.log("GMAIL NODE EXECUTOR");
  const broadcast = (message: any) => {
    subscribers?.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
      }
    });
  }

  if (subscribers) {
    fullExecutionData[nodeName] = { status: "running", output: "", log: "" }
    broadcast({ [nodeName]: { status: "running", output: "", log: "" } });
  }

  try {
    // credential
    const cred = executionData['Credential to connect with'];
    if (!cred) {
      console.log("No credential");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential provided." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "No credential provided." } });
      }
      return;
    }

    const credential = await prisma.credentials.findUnique({
      where: {
        id: Number(cred)
      }
    })
    if (!credential) {
      console.log("No credential found");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential found." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "No credential found." } });
      }
      return;
    }

    // user's email, refresh token
    const credData = credential.data as any;
    const email = credData["email"];

    let refreshToken;
    let accessToken;
    try {
      const tokens = JSON.parse(credData["tokens"]);
      refreshToken = tokens.refresh_token;
      accessToken = tokens.access_token;
    } catch (e) {
      console.log("Error parsing tokens", e);
    }

    if (!email || !refreshToken || !accessToken) {
      console.log("Credential is missing some data.");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Invalid credential." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "Invalid credential." } });
      }
      return;
    }

    console.log("refresh token: ", refreshToken);
    console.log("ENV1: ", process.env.GOOGLE_CLIENT_ID)
    console.log("ENV2: ", process.env.GOOGLE_CLIENT_SECRET)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });

    // to
    const to = executionData['To'];
    if (!to) {
      console.log("No destination email provided");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "No destination email provided." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "No destination email provided." } });
      }
      return;
    }

    // subject
    let subject = executionData['Subject'];
    if (!subject) {
      subject = ""
    }

    // message
    let message = executionData['Message'];
    if (!message) {
      message = ""
    }
    console.log("Email data", email, to, subject, message);

    try {
      const info = await transporter.sendMail({
        from: email,
        to,
        subject,
        text: message
      });

      console.log("Email sent successfully:", info);
      fullExecutionData[nodeName] = { status: "success", output: "", log: "Email sent successfully." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "success", output: "", log: "Email sent successfully." } });
      }
      return { status: 'success', data: info };

    } catch (error: any) {
      console.error("Gmail Send Error:", error);
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to send email." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "Failed to send email." } });
      }
      return { status: 'failed', error: error.message };
    }
  } catch (error: any) {
    console.error("Gmail Send Error:", error);
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to send email." }
    if (subscribers) {
      broadcast({ [nodeName]: { status: "failed", output: "", log: "Failed to send email." } });
    }
    return { status: 'failed', error: error.message };
  }
}
