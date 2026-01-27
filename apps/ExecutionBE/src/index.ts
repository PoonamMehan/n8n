// TODO: webhook & telegram basic execution
// TODO: await gmail node
// TODO: AI node + tools 
// TODO: UI
// TODO: redis


//kafka consumer: 
import { Kafka } from "kafkajs";
import { prisma } from "@repo/db";
import axios from "axios";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import jwt from "jsonwebtoken";

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

// Node executor functions
async function telegramNodeExecutor(executionData: any, workflowId: string, nodeName: string) {

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
      currWSClient.send(JSON.stringify({ type: 'NODE_STARTED', workflowId, nodeName: nodeName }));
    }
  }

  if (!executionData['Chat Id']) {
    console.log("No chat ID")
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: { 'Chat Id': 'No chat ID' } }));
    }
    return;
  }

  if (!executionData['Credential to connect with']) {
    console.log("No credential");
    if (currWSClient) {
      console.log("Sending WS message that node failed due to no credential");
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: { 'Credential to connect with': 'No credential' } }));
    }
    return;
  }
  if (!executionData.Text) {
    console.log("No text to send");
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: { 'Text': 'No text to send' } }));
    }
    return
  }

  const credential = await prisma.credentials.findUnique({
    where: {
      id: executionData['Credential to connect with']
    }
  })
  if (!credential) {
    console.log("No credential found for this id");
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: { 'Credential to connect with': 'No credential found for this id' } }));
    }
    return;
  }

  try {
    // Use the token from credential.data, not the credential ID
    const token = (credential.data as any)?.['Access Token'];
    if (!token) {
      console.log("No access token in credential");
      if (currWSClient) {
        currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: { 'Credential to connect with': 'No access token in credential' } }));
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
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: true, workflowId, nodeName: nodeName, data: 'Node ran successfully!' }));
    }
    return { status: 'success', data: response.data };
    // TODO: send WS message that we finished running this node -> successful

  } catch (error: any) {
    console.error("Telegram API Error:", error.response?.data || error.message);
    if (currWSClient) {
      currWSClient.send(JSON.stringify({ type: 'NODE_RAN', success: false, workflowId, nodeName: nodeName, data: 'Node failed due to some issue at our end!' }));
    }
    return { status: 'failed', error: error.response?.data || error.message };
  }

}

const nodeTitleToExecutionFunction: Record<string, (data: any, data2: any, data3: any) => Promise<any>> = {
  Telegram: telegramNodeExecutor
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

// wait till from the server comes a msg "suthenticated"  OR  store all the messages in an object: key=userId, value=messageReceived[], and when authenticated, process all them messages and then -> set isAuthenticated(true) -> done 



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


          const val = JSON.parse(collectedMessage.value.toString());
          console.log("val: ", val);
          const workflowId = String(val.workflowId);
          const payload = val.payload; //keep it in-memory for this execution or save to the redis -> or save to the DB -> or in-memory
          const triggerId = val.triggerId;
          dataWithEveryNode['Webhook'] = payload;
          // save in redis OR in db (in-memory too for speed)
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

                //TODO: here use Websocket to tell that trigger ndoe has run successfully -> add the payload to the db/redis
                // Now:   
                // go onto processing the connections -> BFS -> then in a queue add the nodes sequentially
                //TODO: maybe i have to use a 'Set' data structure to ensure that a common target node runs only once
                const helperQueue: string[] = []; //TODO: implement an efficent Q: use linked list
                const serializedNodesForExecution: string[] = [];

                let currNodeId = triggerId;
                if (edges && nodes) {
                  while (true) {
                    edges.forEach((currConnection: { id: string, source: string, target: string }) => {
                      if (currConnection.source == currNodeId) {
                        helperQueue.push(currConnection.target);
                      }
                    })
                    if (helperQueue.length == 0) {
                      break;
                    }
                    currNodeId = helperQueue.shift();
                    serializedNodesForExecution.push(currNodeId);

                  }
                  // run them nodes one by one from the serializedNodesForExecution queue:
                  for (const currNodeId of serializedNodesForExecution) {
                    console.log("bruh bruh");
                    const currNodeInfo = nodes.find((n: any) => n.id == currNodeId);
                    if (currNodeInfo) {
                      console.log("Execution Data: ", currNodeInfo.data.executionData, " currNodeId: ", currNodeId);
                      const nodeTitle = currNodeInfo.data.nodeTitle;
                      // const executor = nodeTitle ? nodeTitleToExecutionFunction[nodeTitle] : undefined;
                      if (nodeTitle && nodeTitleToExecutionFunction[nodeTitle]) {
                        console.log("bruh bruh bruh");
                        await nodeTitleToExecutionFunction[nodeTitle](currNodeInfo.data.executionData, workflowId, currNodeInfo.data.nodeName);
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

  //TODO: redis & DB executions table

} catch (error) {
  console.log("Error in kafka consumer: ", error);
}


// keep on getting the node executed message on FE via websocket -> but at the end also send the fully executed
