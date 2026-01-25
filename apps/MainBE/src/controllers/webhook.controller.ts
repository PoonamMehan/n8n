import { Request, Response } from "express";
import { prisma } from "@repo/db";
import { producer } from "../app.js";

export const getWebhookHandler = (req: Request, res: Response) => {
  res.set('Content-Type', "text/plain");
  res.status(200).send("Webhook endpoint active.");
}

export const postWebhookHandler = async (req: Request, res: Response) => {
  const data = req.body;

  //when we have to save this payload for the working of next node
  // when we don't save it
  //just find the webhook entry in the database -> get the workflow id -> then add workflow id & payload to the Kafka queue
  //TODO:  do we save this in db? 
  // yes: in executions table, add this entry -> add this in kafka -> in ExecutionsBE: after all the nodes are done executing -> add in DB from the Executions BE -> from the redis queue add the execution entry in the DB?
  // No: we are not saving executions in the DB, we take the data from mainBE -> put in kafka -> execute in ExecutionsBE -> add the progress of every node in REdis & frontend 
  // we are going to send the payload to the new 
  console.log("Req came: ", data);
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Invalid webhook id." });
    }
    const webhook = await prisma.webhook.findUnique({
      where: {
        id: id
      }
    })

    if (!webhook) {
      return res.status(404).send({ message: "Webhook not found." });
    }

    const dataToKafka = { workflowId: webhook.corresponding_workflow_id, payload: data, triggerId: webhook.id };
    // we can save this to the executions table in db, this particular execution of this workflow, had this payload in this first node.
    // Every node will have thier own accumulated data which we can later use in the next nodes. 

    producer.send({
      topic: "workflow-execution-requests",
      messages: [
        {
          value: JSON.stringify(dataToKafka)
        }
      ]
    })
    return res.status(200).send({ message: "Webhook triggered successfully." });

    //if the webhook is found, then we now have all the webhook object, we need to send the payload and the workflow id to the kafka queue.
  } catch (error) {
    console.log("Error in postWebhookHandler: ", error);
    res.status(500).send({ message: "Internal server error." })
  }

}
