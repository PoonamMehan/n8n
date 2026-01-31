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
const workflowIdToUserId = new Map<string, string>();

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



const nodeTitleToExecutionFunction: Record<string, (data: Map<string, WebSocket>, data2: Map<string, string>, data3: any, data4: any, data5: any, data6?: any, data7?: any, data8?: any) => Promise<any>> = {
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
        workflowIdToUserId.set(workflowId, userId);
        console.log("WS clients rn connected to the server for a particular workflow: ", workflowIdToUserId.keys());
        console.log("New ws client connected: ", workflowId);
      } else if (msg.type == 'UNSUBSCRIBE') {
        const workflowId = msg.workflowId;
        workflowIdToUserId.delete(workflowId);
        console.log("Ws client unsubscribed from workflow: ", workflowId);
      }
    })

    ws.on('close', (code, reason) => {
      wsClients.delete(userId);
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
  let collectedMessage: any;
  await consumer.run({
    partitionsConsumedConcurrently: 1,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message || message.value == null) {
        collectedMessage = null
      }
      else {
        const dataWithEveryNode: Record<string, any> = {};
        collectedMessage = message;
        if (!collectedMessage || !collectedMessage.value) {
          console.log("No message collected.");
        } else {
          //start executing the workflow
          // get the workflow id
          // get the workflow from db 
          // get the nodes and connections from the workflow
          // run the decided algo to serialize the execution of the nodes
          // now run them nodes one by one
          // as a node is done executing send the signal to the frontend via WEBSOCKET that it is done, 

          //if this backend goes down -> keep record in the redis cache
          // as the backend comes alive see if there is any running/pending workflows in the db


          // can run the next nodes even if the older node's execution was not successful
          // decorators


          //CURRENTLY V0: 
          // run the nodes -> as being executed -> to the redis cache/queue -> from the redis queue to the ws server -> server fins the user based on theri user id -> sends them the updates -> show on the frontend (use AI)


          const val = JSON.parse(collectedMessage.value.toString()); //buffer -> string -> json
          console.log("val: ", val);
          const workflowId = String(val.workflowId);
          const payload = val.payload; //keep it in-memory for this execution or save to the redis -> or save to the DB -> or in-memory
          const triggerId = val.triggerId;
          if (!workflowId || !triggerId) {
            console.log("No workflow id or trigger id found.");
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
                if (triggerNode) {
                  // Store webhook payload using the actual node name so {{Webhook 1.body.message}} works
                  const triggerNodeName = triggerNode.data.nodeName || 'Webhook';
                  dataWithEveryNode[triggerNodeName] = { body: payload };
                  console.log("Stored payload under key: ", triggerNodeName, dataWithEveryNode[triggerNodeName]);
                }

                //TODO: here use Websocket to tell that trigger ndoe has run successfully -> add the payload to the db/redis

                // go onto processing the connections -> BFS -> then in a queue add the nodes sequentially
                const helperQueue: string[] = []; //TODO: implement an efficent Q: use linked list
                const serializedNodesForExecution: string[] = [];
                const visited: Set<string> = new Set(); // Track nodes already queued to prevent duplicates

                let currNodeId = triggerId;
                if (edges && nodes) {
                  while (true) {
                    edges.forEach((currConnection: { id: string, source: string, target: string }) => {
                      if (currConnection.source == currNodeId && !visited.has(currConnection.target)) {
                        helperQueue.push(currConnection.target);
                        visited.add(currConnection.target);
                      }
                    })
                    if (helperQueue.length == 0) {
                      break;
                    }
                    currNodeId = helperQueue.shift();
                    serializedNodesForExecution.push(currNodeId);

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
                      // const executor = nodeTitle ? nodeTitleToExecutionFunction[nodeTitle] : undefined;
                      let result = null;
                      if (nodeTitle && nodeTitleToExecutionFunction[nodeTitle]) {
                        console.log("bruh bruh bruh");
                        console.log("nodeTitle: ", nodeTitle);
                        if (nodeTitle == "AI Agent") {
                          console.log("AI node to run");
                          result = await nodeTitleToExecutionFunction[nodeTitle](wsClients, workflowIdToUserId, executionData, workflowId, currNodeInfo.data.nodeName, currNodeInfo.id, edges, nodes);
                        } else {
                          result = await nodeTitleToExecutionFunction[nodeTitle](wsClients, workflowIdToUserId, executionData, workflowId, currNodeInfo.data.nodeName);
                        }
                      }
                      // Store the result for future nodes to use
                      if (currNodeInfo.data.nodeName) {
                        dataWithEveryNode[currNodeInfo.data.nodeName] = result;
                      }
                    }
                  }
                  //take every edge and search thru it and if source is same as the currNodeId -> add the target to the helperQueue ->
                  // now out of the .forEach -> take the first element from the helperQueue(if not empty) -> add its id to the serializedNodesForExecution -> remove it from the helperQueue -> remove it from the the helperQueue -> set currNodeId to the removed element -> repeat until the helperQueue is empty

                }

                console.log("Serialized nodes for execution: ", serializedNodesForExecution);
                // TODO: make "nodes" an bject with nodeIds as keys 

                // run them nodes one by one

                // if one fails(add the reason to the redis -> show on the frontend logs(maybe upon hovering over the nodes X or Y) -> show n the FE that the node X or Y) -> continue onto the next -> complete the workflow 
                // status: running | completed | failed -> log: failed or successful 
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