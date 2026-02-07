import { prisma } from "@repo/db";
import axios from "axios";
import type { WebSocket } from "ws";

export async function telegramNodeExecutor(wsClients: Map<string, WebSocket>, workflowSubscribers: Map<string, Set<WebSocket>>, fullExecutionData: Record<string, any>, executionData: any, workflowId: string, nodeName: string) {

  const subscribers = workflowSubscribers.get(workflowId);

  const broadcast = (message: any) => {
    subscribers?.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
      }
    });
  }

  //TODO: send WS message that we started running this node
  if (subscribers) {
    console.log("EXECUTION DATA: ", executionData);
    broadcast({ [nodeName]: { status: "running", output: "", log: "" } });
  }
  console.log("Telegram mein execution data: ", executionData);
  if (!executionData['Chat Id']) {
    console.log("No chat ID");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No chat ID provided." }
    if (subscribers) {
      broadcast({ [nodeName]: { status: "failed", output: "", log: "No chat ID provided." } });
    }
    return;
  }

  if (!executionData['Credential to connect with']) {
    console.log("No credential");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential provided." }
    if (subscribers) {
      console.log("Sending WS message that node failed due to no credential");
      broadcast({ [nodeName]: { status: "failed", output: "", log: "No credential provided." } });
    }
    return;
  }
  if (!executionData.Text) {
    console.log("No text to send");
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "No text to send." }
    if (subscribers) {
      broadcast({ [nodeName]: { status: "failed", output: "", log: "No text to send." } });
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
    if (subscribers) {
      broadcast({ [nodeName]: { status: "failed", output: "", log: "No credential found." } });
    }
    return;
  }

  try {
    // Use the token from credential.data, not the credential ID
    const token = (credential.data as any)?.['Access Token'];
    if (!token) {
      console.log("No access token in credential");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Invalid credential. No access token." }
      if (subscribers) {
        broadcast({ [nodeName]: { status: "failed", output: "", log: "Invalid credential. No access token." } });
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
    if (subscribers) {
      console.log("I AM TOH RUNNING");
      fullExecutionData[nodeName] = { status: "success", output: "", log: "Message sent successfully." }
      broadcast({ [nodeName]: { status: "success", output: "", log: "Message sent successfully." } });
    }
    return { status: 'success', data: response.data };
    // TODO: send WS message that we finished running this node -> successful

  } catch (error: any) {
    console.error("Telegram API Error:", error.response?.data || error.message);
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to send message." }
    if (subscribers) {
      broadcast({ [nodeName]: { status: "failed", output: "", log: "Failed to send message." } });
    }
    return { status: 'failed', error: error.response?.data || error.message };
  }

}