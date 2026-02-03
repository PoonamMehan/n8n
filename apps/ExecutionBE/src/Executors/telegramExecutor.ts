import { prisma } from "@repo/db";
import axios from "axios";
import type { WebSocket } from "ws";

export async function telegramNodeExecutor(wsClients: Map<string, WebSocket>, workflowIdToUserId: Map<string, string>, fullExecutionData: Record<string, any>, executionData: any, workflowId: string, nodeName: string) {

  let currWSClient = null;
  //TODO: send WS message that we started running this node
  console.log("YAHA YAHA YAHA ", workflowIdToUserId.get(workflowId));
  if (workflowIdToUserId.get(workflowId)) {
    // or .has?
    const userId = workflowIdToUserId.get(workflowId);
    console.log("User ID FOR WS CONNECTION: ", userId);
    if (userId) {
      currWSClient = wsClients.get(userId);
    }
    //TODO: we can save ourselves from redundantly writing this again and again.
    if (currWSClient) {
      console.log("EXECUTION DATA: ", executionData);
      currWSClient.send(JSON.stringify({ nodeName: { status: "running", output: "", log: "" } }));
    }
  }

  if (!executionData['Chat Id']) {
    console.log("No chat ID");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No chat ID provided." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No chat ID provided." } }));
    }
    return;
  }

  if (!executionData['Credential to connect with']) {
    console.log("No credential");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential provided." }
    if (currWSClient) {
      console.log("Sending WS message that node failed due to no credential");
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No credential provided." } }));
    }
    return;
  }
  if (!executionData.Text) {
    console.log("No text to send");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No text to send." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No text to send." } }));
    }
    return
  }

  //TODO: handle this credential finder correctly
  const credential = await prisma.credentials.findUnique({
    where: {
      id: Number(executionData['Credential to connect with'])
    }
  })
  if (!credential) {
    console.log("No credential found for this id");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential found." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No credential found." } }));
    }
    return;
  }

  try {
    // Use the token from credential.data, not the credential ID
    const token = (credential.data as any)?.['Access Token'];
    if (!token) {
      console.log("No access token in credential");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Invalid credential. No access token." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Invalid credential. No access token." } }));
      }
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: executionData['Chat Id'],
      text: executionData.Text,
      parse_mode: 'HTML'
    });

    console.log("Message sent successfully:", response.data);
    if (currWSClient) {
      console.log("I AM TOH RUNNING");
      fullExecutionData[nodeName] = { status: "success", output: "", log: "Message sent successfully." }
      currWSClient.send(JSON.stringify({ nodeName: { status: "success", output: "", log: "Message sent successfully." } }));
    }
    return { status: 'success', data: response.data };
    // TODO: send WS message that we finished running this node -> successful

  } catch (error: any) {
    console.error("Telegram API Error:", error.response?.data || error.message);
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to send message." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Failed to send message." } }));
    }
    return { status: 'failed', error: error.response?.data || error.message };
  }

}