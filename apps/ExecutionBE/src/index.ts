// TODO: webhook & telegram basic execution
// TODO: await gmail node
// TODO: AI node + tools 
// TODO: UI
// TODO: redis


//kafka consumer: 
import { Kafka } from "kafkajs";
import { prisma } from "@repo/db";
import axios from "axios";

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
async function telegramNodeExecutor(executionData: any) {

  //TODO: send WS message that we started running this node
  if (!executionData['Chat Id']) {
    console.log("No chat ID")
    return;
  }

  if (!executionData['Credential to connect with']) {
    console.log("No credential");
    return;
  }
  if (!executionData.Text) {
    console.log("No text to send");
    return
  }

  const credential = await prisma.credentials.findUnique({
    where: {
      id: executionData['Credential to connect with']
    }
  })
  if (!credential) {
    console.log("No credential found for this id");
    return;
  }

  try {
    // Use the token from credential.data, not the credential ID
    const token = (credential.data as any)?.['Access Token'];
    if (!token) {
      console.log("No access token in credential");
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: executionData['Chat Id'],
      text: executionData.Text,
      parse_mode: 'HTML'
    });

    console.log("Message sent successfully:", response.data);
    return { status: 'success', data: response.data };
    // TODO: send WS message that we finished running this node -> successful

  } catch (error: any) {
    console.error("Telegram API Error:", error.response?.data || error.message);
    return { status: 'failed', error: error.response?.data || error.message };
  }
}

const nodeTitleToExecutionFunction: Record<string, (data: any) => Promise<any>> = {
  Telegram: telegramNodeExecutor
}

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
          const workflowId = val.workflowId;
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
                  id: workflowId
                }
              })
              if (!workflow) {
                console.log("Workflow not found.");
              }
              else {
                const nodes: Nodes[] = workflow.nodes as any;
                const edges: Edges[] = workflow.connections as any;
                console.log("Nodes: ", nodes);
                console.log("Edges: ", edges);
                console.log("Edges type: ");
                console.log("triggerId: ", triggerId);

                //TODO: here use Websocket to tell that trigger ndoe has run successfully -> add the payload to the db/redis
                // Now:   
                // go onto processing the connections -> BFS -> then in a queue add the nodes sequentially
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
                        await nodeTitleToExecutionFunction[nodeTitle](currNodeInfo.data.executionData);
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
