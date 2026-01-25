// TODO: webhook & telegram basic execution
// TODO: await gmail node
// TODO: AI node + tools 
// TODO: UI
// TODO: redis


//kafka consumer: 
import { Kafka } from "kafkajs";
import { prisma } from "@repo/db";

const kafka = new Kafka({
  clientId: 'my-execution-app',
  brokers: ['localhost:9092']
})

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
          const payload = val.payload; //keep it in-memory for this execution or save to the redis -> or save to the DB 
          const triggerId = val.triggerId;
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
                const nodes = workflow.nodes;
                const edges = workflow.connections;
                console.log("Nodes: ", nodes);
                console.log("Edges: ", edges);
                console.log("triggerId: ", triggerId);
                
                //TODO: 
                // go onto processing the connections -> BFS -> then in a queue add the nodes sequentially
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