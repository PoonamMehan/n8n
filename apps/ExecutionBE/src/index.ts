// Kafka consumer: 
import { Kafka } from "kafkajs";
import { prisma } from "@repo/db";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { telegramNodeExecutor } from "./Executors/telegramExecutor.js";
import { gmailNodeExecutor } from "./Executors/gmailExecutor.js";
import { aiAgentNodeExecutor } from "./Executors/aiAgentExecutor.js";

const wsClients = new Map<string, WebSocket>();
const workflowSubscribers = new Map<string, Set<WebSocket>>();

const kafka = new Kafka({
  clientId: 'my-execution-app',
  brokers: ['localhost:9092']
})

interface Nodes {
  id: string,
  data: any,
  type: string,
  dragging: boolean,
  measured: {
    width: number,
    height: number
  },
  position: {
    x: number,
    y: number
  },
  selected: boolean
}

interface Edges {
  id: string,
  source: string,
  target: string
}



const nodeTitleToExecutionFunction: Record<string, (data: Map<string, WebSocket>, data2: Map<string, Set<WebSocket>>, data3: Record<string, any>, data4: any, data5: any, data6?: any, data7?: any, data8?: any, data9?: any) => Promise<any>> = {
  Telegram: telegramNodeExecutor,
  Gmail: gmailNodeExecutor,
  "AI Agent": aiAgentNodeExecutor,
  "Telegram Tool": telegramNodeExecutor,
  "Gmail Tool": gmailNodeExecutor
}

//TODO: here start the ws server: then -> add the users -> in-memory/redis

// user connects to ws server -> user Id -> we take the userID from the kafka message -> both userId matches -> send the updates about the corresponding workflow executions to that user(ws client)
// BE: endpoint /generateWSToken -> FE takes the token -> ?token=${token} -> new URLSearchParams(req.url?.split("?")[1]) -> urlParams.get('token') -> wsClient.set(userId, ws) -> 
// 

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', async (ws, req) => {
  console.log("WS connection started to be established.");
  const urlParams = new URLSearchParams(req.url?.split("?")[1]);
  const token = urlParams.get('token');
  if (!token) {
    ws.close(1008, "Token is required.");
    return;
  }

  try {
    const jwt_secret = process.env.ACCESS_TOKEN_SECRET;
    if (!jwt_secret) {
      console.log("Missing ACCESS_TOKEN_SECRET env variable, closing the ws connection.");
      ws.close(1011, "Internal server error.");
      return;
    }

    const decoded = jwt.verify(token, jwt_secret);
    if (typeof decoded == "string") {
      ws.close(1008, "Invalid auth token.");
      return;
    }

    const userId = decoded.userId;
    if (!userId) {
      ws.close(1008, "Invalid auth token.");
      return;
    }

    //check if user exists in db:
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    if (!user) {
      ws.close(1008, "Invalid auth token.");
      return;
    }

    wsClients.set(userId, ws);
    console.log("WS clients rn cnnected to the server: ", wsClients.keys());
    console.log("New ws client connected: ", userId);

    ws.on('message', async (message) => {

      console.log("Ws client message: ", message.toString());
      const msg = JSON.parse(message.toString());
      if (msg.type == 'SUBSCRIBE') {
        console.log("User subscribed to workflow: ", msg.workflowId);
        const workflowId = msg.workflowId;
        let workflow;
        try {
          workflow = await prisma.workflow.findUnique({
            where: {
              id: Number(workflowId)
            }
          })
        } catch (err) {
          console.log("Error while fetching workflow: ", err);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Workflow not found' }));
          return;
        }


        if (!workflow) {
          console.log("Workflow not found for user: ", userId);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Workflow not found' }));
          return;
        }

        if (userId != workflow.userId) {
          console.log("User not authorized to access this workflow: ", workflowId);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'You are not authorized to access this workflow' }));
          return;
        }
        console.log("User is authorized to access this workflow: ", workflowId);

        if (!workflowSubscribers.has(workflowId)) {
          workflowSubscribers.set(workflowId, new Set());
        }
        workflowSubscribers.get(workflowId)?.add(ws);

        console.log("New ws client subscribed to workflow: ", workflowId);
      } else if (msg.type == 'UNSUBSCRIBE') {
        const workflowId = msg.workflowId;
        workflowSubscribers.get(workflowId)?.delete(ws);
        console.log("Ws client unsubscribed from workflow: ", workflowId);
      }
    })

    ws.on('close', (code, reason) => {
      wsClients.delete(userId);
      // Remove from all subscriptions
      workflowSubscribers.forEach((subscribers) => {
        subscribers.delete(ws);
      });
      console.log("Ws client disconnected: ", userId, " code: ", code, " reason: ", reason);
    })

  } catch (err) {
    console.log("Error while connecting to ws server: ", err);
    ws.close(1011, "Internal server error.");
  }
})

// wait till from the server comes a msg "authenticated"  OR  store all the messages in an object: key=userId, value=messageReceived[], and when authenticated, process all them messages and then -> set isAuthenticated(true) -> done 



try {
  const consumer = kafka.consumer({ groupId: 'execution-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'workflow-execution-requests', fromBeginning: true });
  await consumer.run({
    partitionsConsumedConcurrently: 1,
    eachMessage: async ({ topic, partition, message }) => {
      let collectedMessage: any;
      if (!message || message.value == null) {
        collectedMessage = null
      }
      else {
        const dataWithEveryNode: Record<string, any> = {};
        collectedMessage = message;
        if (!collectedMessage || !collectedMessage.value) {
          console.log("No message collected.");
        } else {
          const val = JSON.parse(collectedMessage.value.toString()); //buffer -> string -> json
          console.log("val: ", val);

          const workflowId = String(val.workflowId);
          const payload = val.payload; //keep it in-memory for this execution or save to the redis -> or save to the DB -> or in-memory
          const triggerId = val.triggerId;

          if (!workflowId || !triggerId) {
            console.log("No workflow id or trigger id found.");
            // should we send a message that the workflowId is not found or triggerId is not found
          } else {
            try {
              const workflow = await prisma.workflow.findUnique({
                where: {
                  id: Number(workflowId)
                }
              })
              if (!workflow) {
                console.log("Workflow not found.");
              }
              else {
                const nodes: Nodes[] = workflow.nodes as any;
                const edges: Edges[] = workflow.connections as any;
                const userId = workflow.userId;
                console.log("Nodes: ", nodes);
                console.log("Edges: ", edges);
                console.log("Edges type: ");
                console.log("triggerId: ", triggerId);

                // DATA SHARING CHECK
                const triggerNode = nodes.find((n: any) => n.id === triggerId);

                if (!triggerNode) {
                  if (userId) {
                    const userWSClient = wsClients.get(userId);
                    if (userWSClient) {
                      userWSClient.send(JSON.stringify({ status: "failed", log: "Trigger node not found.", workflowId: workflowId }));
                    }
                  }
                  console.log("Trigger Node not found.");
                  return;
                }

                // Store webhook payload using the actual node name so {{Webhook 1.body.message}} works
                const triggerNodeName = triggerNode.data.nodeName;


                // Store data in-memory about the whole Execution
                const executionId = crypto.randomUUID();
                const fullExecutionData: Record<string, any> = {
                  status: "running",
                  workflowId: workflowId,
                  log: "Workflow is running.",
                  nodeDetails: {}
                }

                try {
                  await prisma.executions.create({
                    data: {
                      id: executionId,
                      workflowId: Number(workflowId),
                      status: "running",
                      log: "Workflow is running.",
                      nodeDetails: {
                        [triggerNodeName]: {
                          status: "success",
                          output: payload,
                          log: `${triggerNodeName} trigger node ran successfully.`
                        }
                      }
                    }
                  })
                }
                catch (err) {
                  console.log("Error while creating execution: ", err);
                }

                dataWithEveryNode[triggerNodeName] = { body: payload };
                console.log("Stored payload under key: ", triggerNodeName, dataWithEveryNode[triggerNodeName]);

                // here use WebSocket to tell that trigger node has run successfully -> add the payload to the db/redis
                // here use WebSocket to tell that trigger node has run successfully -> add the payload to the db/redis
                const subscribers = workflowSubscribers.get(workflowId);
                if (subscribers) {
                  subscribers.forEach(ws => {
                    if (ws.readyState === 1) {
                      ws.send(JSON.stringify({ executionId: executionId, [triggerNodeName]: { status: "success", output: payload, log: `${triggerNodeName} trigger node ran successfully.` } }));
                    }
                  });
                }

                // go onto processing the connections -> BFS -> then in a queue add the nodes sequentially
                const helperQueue: string[] = []; //TODO: implement an efficent Q: use linked list
                const serializedNodesForExecution: string[] = [];
                const visited: Set<string> = new Set(); // Track nodes already queued to prevent duplicates

                let currNodeId = triggerId;
                if (edges && nodes) {
                  // First add trigger's children to queue
                  edges.forEach((e: any) => {
                    if (e.source === currNodeId && !visited.has(e.target)) {
                      helperQueue.push(e.target);
                      visited.add(e.target);
                    }
                  });

                  while (helperQueue.length > 0) {
                    const nodeId = helperQueue.shift()!;
                    const parents = edges.filter((e: any) => e.target === nodeId).map((e: any) => e.source);

                    const allParentsProcessed = parents.every((p: string) =>
                      p === triggerId || serializedNodesForExecution.includes(p)
                    );

                    if (allParentsProcessed) {
                      serializedNodesForExecution.push(nodeId);

                      //add its children to queue
                      edges.forEach((e: any) => {
                        if (e.source === nodeId && !visited.has(e.target)) {
                          helperQueue.push(e.target);
                          visited.add(e.target);
                        }
                      });
                    } else {
                      //not ready yet, push back to end of queue
                      helperQueue.push(nodeId);
                    }
                  }

                  // Helper to resolve {{NodeName.property}}

                  // Example of executionData: {
                  //   "Credential to connect with": "5",
                  //   "Chat Id": "123456789",
                  //   "Text": "{{Webhook 1.body.message}}"
                  // }
                  const resolveParameters = (data: any, context: any) => {
                    const resolvedData: any = {};
                    for (const key in data) {
                      const value = data[key];
                      if (typeof value != 'string') {
                        resolvedData[key] = value;
                        continue;
                      }
                      const regex = /{{(.*?)}}/g;
                      const match = regex.exec(value);
                      if (match) {
                        const path = match[1]?.split('.');
                        let current = context;
                        if (path) {
                          for (const p of path) {
                            if (current) {
                              current = current[p];
                            }
                          }
                        }
                        resolvedData[key] = current;
                      } else {
                        resolvedData[key] = value;
                      }
                    }
                    return resolvedData; //returns correct execution data
                  }

                  // run them nodes one by one from the serializedNodesForExecution queue:
                  for (const currNodeId of serializedNodesForExecution) {
                    console.log("bruh bruh");
                    const currNodeInfo = nodes.find((n: any) => n.id == currNodeId);
                    if (currNodeInfo) {
                      // Skip tool nodes - they should only be executed by AI Agent
                      if (currNodeInfo.type === "toolNode") {
                        console.log("Skipping tool node, will be executed by AI Agent:", currNodeInfo.data.nodeName);
                        continue;
                      }

                      // Resolve parameters using data from previous nodes
                      const executionData = resolveParameters(currNodeInfo.data.executionData, dataWithEveryNode);

                      console.log("Execution Data: ", executionData, " currNodeId: ", currNodeId);
                      const nodeTitle = currNodeInfo.data.nodeTitle;
                      let result = null;
                      if (nodeTitle && nodeTitleToExecutionFunction[nodeTitle]) {
                        console.log("bruh bruh bruh");
                        console.log("nodeTitle: ", nodeTitle);
                        if (nodeTitle == "AI Agent") {
                          console.log("AI node to run");
                          result = await nodeTitleToExecutionFunction[nodeTitle](wsClients, workflowSubscribers, fullExecutionData, executionData, workflowId, currNodeInfo.data.nodeName, currNodeInfo.id, edges, nodes);
                        } else {
                          result = await nodeTitleToExecutionFunction[nodeTitle](wsClients, workflowSubscribers, fullExecutionData, executionData, workflowId, currNodeInfo.data.nodeName);
                        }
                      }
                      // Store the result for future nodes to use
                      if (currNodeInfo.data.nodeName) {
                        dataWithEveryNode[currNodeInfo.data.nodeName] = result;
                      }
                    }
                  }

                  // Determine workflow status based on node statuses
                  const nodeKeys = Object.keys(fullExecutionData).filter(
                    key => !['status', 'workflowId', 'log'].includes(key)
                  );

                  let successCount = 0;
                  let failedCount = 0;

                  for (const key of nodeKeys) {
                    const nodeData = fullExecutionData[key];
                    if (nodeData?.status === 'success') {
                      successCount++;
                    } else if (nodeData?.status === 'failed') {
                      failedCount++;
                    }
                  }

                  let workflowStatus: string;
                  let workflowLog: string;

                  if (failedCount === 0) {
                    workflowStatus = "success";
                    workflowLog = "Workflow completed successfully.";
                  } else if (successCount === 0) {
                    workflowStatus = "failed";
                    workflowLog = "Workflow failed. All nodes failed.";
                  } else {
                    workflowStatus = "partial-success";
                    workflowLog = `Workflow partially completed.`;
                  }

                  fullExecutionData.status = workflowStatus;
                  fullExecutionData.log = workflowLog;
                  //TODO: save the fullExecutionData to the DB
                  //TODO: create executions table
                  const subscribers = workflowSubscribers.get(workflowId);
                  if (subscribers) {
                    subscribers.forEach(ws => {
                      if (ws.readyState === 1) {
                        ws.send(JSON.stringify({ status: workflowStatus, log: workflowLog, workflowId: workflowId }));
                      }
                    });
                  }

                  let nodeDetails: any = {};
                  nodeKeys.forEach((key) => {
                    nodeDetails[key] = fullExecutionData[key];
                  })

                  try {
                    await prisma.executions.update({
                      where: {
                        id: executionId
                      },
                      data: {
                        status: workflowStatus,
                        log: workflowLog,
                        nodeDetails: nodeDetails,
                        finishedAt: new Date()
                      }
                    })
                  }
                  catch (err) {
                    console.log("Error while updating execution: ", err);
                  }
                  //take every edge and search thru it and if source is same as the currNodeId -> add the target to the helperQueue ->
                  // now out of the .forEach -> take the first element from the helperQueue(if not empty) -> add its id to the serializedNodesForExecution -> remove it from the helperQueue -> remove it from the the helperQueue -> set currNodeId to the removed element -> repeat until the helperQueue is empty
                }
                console.log("Serialized nodes for execution: ", serializedNodesForExecution);
              }
            } catch (err) {
              console.log("Error in finding workflow: ", err);
            }

          }

        }
      }
      console.log("partition: ", partition, " message: ", message.value?.toString(), " message offset: ", message.offset);
    }
  })
} catch (error) {
  console.log("Error in kafka consumer: ", error);
}

// TODO: IMPROVEMENTS:
// Redis:
// DB executions table: to show execution history (so user can check why a particular node failed on a particular date) (what was the data involved with a particular Execution ID)