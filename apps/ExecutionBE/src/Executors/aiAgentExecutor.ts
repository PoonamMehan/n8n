import { prisma } from "@repo/db";
import type { WebSocket } from "ws";
import { telegramNodeExecutor } from "./telegramExecutor.js";
import { gmailNodeExecutor } from "./gmailExecutor.js";


async function generateContent(prompt: string, systemPrompt: string, apiKey: string) {
  console.log("I AM HERE TO GENERATE ANSWER FROM THE LLM.");
  console.log("api key: ", apiKey);
  try {
    console.log('Prompt: ', prompt);
    const response = await fetch("https://apifreellm.com/api/v1/chat", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        message: `System Prompt: "${systemPrompt}" User Prompt: "${prompt}"`
      })
    }
    )

    const respData = await response.json();
    if (respData.success) {
      const text = respData.response;
      console.log("Generated content: ", text);
      return { status: "success", text };
    } else {
      console.log("Failed to generate content", respData)
      return { status: "failed", error: "Failed to generate content" }
    }

  } catch (error: any) {
    console.error("Error generating content:", error.message);
    return { status: "failed", error: error.message }
  }
}

export const aiAgentNodeExecutor = async (wsClients: Map<string, WebSocket>, workflowIdToUserId: Map<string, string>, fullExecutionData: Record<string, any>, executionData: any, workflowId: string, nodeName: string, nodeId: any, edges: any, nodes: any) => {
  let currWSClient = null;
  console.log("I am in AI Agent Node Executor")
  // Setup WebSocket client for notifications
  if (workflowIdToUserId.get(workflowId)) {
    const userId = workflowIdToUserId.get(workflowId);
    if (userId) {
      currWSClient = wsClients.get(userId);
    }
    fullExecutionData[nodeName] = { status: "running", output: "", log: "" }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "running", output: "", log: "" } }));
    }
  }

  try {
    const cred = executionData['Credential to connect with'];
    if (!cred) {
      console.log("No credential");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential provided." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No credential provided." } }));
      }
      return;
    }

    const credential = await prisma.credentials.findUnique({
      where: {
        id: Number(cred)
      }
    });

    if (!credential) {
      console.log("No credential found.");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "No credential found." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "No credential found." } }));
      }
      return;
    }

    const credData = credential.data as any;
    const apiKey = credData['API Key'];
    if (!apiKey) {
      console.log("Credential is invalid. No API Key found.");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Invalid credential. No API KEY found." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Invalid credential. No API KEY found." } }));
      }
      return;
    }

    //tools:
    //find the tools using edges
    let toolsIds: string[] = [];
    for (const edge of edges) {
      if (edge && edge.source === nodeId && edge.sourceHandle === "tools") {
        toolsIds.push(edge.target);
      }
    }

    // Find the tool nodes
    let tools = nodes.filter((node: any) => toolsIds.includes(node.id));
    console.log("Tools: ", tools);
    //filter out relevant tools info to send to the LLM: toolsInfoForLLM
    let toolsInfoForLLM = [];
    for (const tool of tools) {
      const toolInfo = { id: tool.id, nodeName: tool.data.nodeName };
      toolsInfoForLLM.push(toolInfo);
    }
    console.log("toolsInfoForLLM: ", toolsInfoForLLM);

    //send toolsInfoForLLM to the LLM
    //sys prompt
    //send as the sys prompt to the LLM
    const sysPrompt = executionData['System Prompt'] || '';
    const systemPrompt = `You are an AI agent in a workflow automation app. Based on this system prompt: "${sysPrompt}" you must decide which tools to run.
    You will receive a user prompt and a list of available tools. Return ONLY a JSON array of tool IDs that should run. 
    Available tools: ${JSON.stringify(toolsInfoForLLM)}
    Examples:
    - If tools should run: ["7f3c1e2b-9a4e-4c9d-8c7f-6b2a4f0d1e93", "c8a2d4f1-3e9b-45c7-b6a1-0d8f4e2a9c35"]
    - If one tool should run: ["1b6e9f24-7d3c-4a8e-9f0b-2c5e1d7a4b98"]
    - If no tools should run: []
    IMPORTANT: Return ONLY the JSON array, nothing else. Use double quotes for strings.`;
    //user's prompt
    const userPrompt = executionData["Prompt (User Message)"] || '';

    const response = await generateContent(userPrompt, systemPrompt, apiKey);
    if (response.status === "failed") {
      console.log("Failed to get response from AI.");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to get response from AI." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Failed to get response from AI." } }));
      }
      return;
    }

    const toolsToRunText = response.text;
    if (!toolsToRunText) {
      console.log("Failed to get response from AI.");
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to get correct response from AI." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Failed to get correct response from AI." } }));
      }
      return;
    }

    // Parse the JSON array from LLM response
    let toolsToRun: string[] = [];
    try {//TODO: correct this: 
      // Clean up the response - remove any markdown code blocks if present
      let cleanedResponse = toolsToRunText.trim();
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      // Replace single quotes with double quotes for valid JSON
      // cleanedResponse = cleanedResponse.replace(/'/g, '"');
      toolsToRun = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.log("Failed to parse AI response as JSON:", toolsToRunText);
      fullExecutionData[nodeName] = { status: "failed", output: "", log: "Failed to get correct response from AI." }
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "Failed to get correct response from AI." } }));
      }
      return;
    }

    console.log("AI Agent execution completed.");
    fullExecutionData[nodeName] = { status: "success", output: "", log: "AI Agent node ran successfully." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "success", output: "", log: "AI Agent node ran successfully." } }));
    }

    console.log("Tools to run:", toolsToRun);
    //run all the tools (by calling the functions)
    for (const toolId of toolsToRun) {
      const tool = tools.find((t: any) => t.id === toolId);
      if (!tool) {
        console.log(`Tool not found: ${toolId}`);
        continue;
      }

      // Use nodeTitle to lookup the execution function
      const toolTitle = tool.data.nodeTitle;
      const toolExecutionFunction = nodeTitleToExecutionFunction[toolTitle];
      if (!toolExecutionFunction) {
        console.log(`No execution function found for tool: ${toolTitle}`);
        continue;
      }

      await toolExecutionFunction(wsClients, workflowIdToUserId, tool.data.executionData, workflowId, tool.data.nodeName);
    }

    return { status: "success", data: {}, error: null }


  } catch (error: any) {
    console.error("AI Agent Error:", error);
    fullExecutionData[nodeName] = { status: "failed", output: "", log: "AI Agent node failed." }
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ nodeName: { status: "failed", output: "", log: "AI Agent node failed." } }));
    }
    return { status: 'failed', error: error.message };
  }
};

const nodeTitleToExecutionFunction: Record<string, (data: Map<string, WebSocket>, data2: Map<string, string>, data3: Record<string, any>, data4: any, data5: any, data6?: any, data7?: any, data8?: any, data9?: any) => Promise<any>> = {
  Telegram: telegramNodeExecutor,
  Gmail: gmailNodeExecutor,
  "AI Agent": aiAgentNodeExecutor,
  "Telegram Tool": telegramNodeExecutor,
  "Gmail Tool": gmailNodeExecutor
}
