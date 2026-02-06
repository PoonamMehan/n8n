import {Request, Response} from "express";
import {prisma} from "@repo/db";

interface FinalData {
	title?: string,
	nodes?: Record<string, any>,
	connections?: Record<string, any>,
	executing?: boolean
}

// n8n complete
    // bolt
    // rag
    // draw excali
    // react, next, ts, js
    // kafka 
    // redis
    // jwt docs


// backend endpoints
// schema optimize
// frontend react flow


// TODO: attach the user
export async function createWorkflow(req:Request, res:Response){
	try{
	const userId = req.userId!;
	// you make an entry to the "workflows" table with just mentioning the name of the workflow "title"
	const {title} = req.body;
	console.log("Workflow title: ", title);
	
	let workflowTitle = "";
	if(!title){
		workflowTitle = `Workflow_${crypto.randomUUID()}`;
	}
			const workflow = await prisma.workflow.create({
				data: {
						"title": title || workflowTitle,
						"userId": userId
				}
			});
      console.log("Created workflow: ", workflow);

		return res.status(200).send({success: true, data: workflow, error: null});
	}catch(error){
			console.log("Error while making an entry in the Workflow table: ", error);
			return res.status(500).send({success: false, data: null, error: `Some error occurred at the backend.`});
	}
}

export async function getWorkflows(req:Request, res:Response){
	try{
			const userId = req.userId;
			if(!userId){
				return res.status(400).send({success: false, data: null, error: "No user id found."});
			}
			const allWorkflows = await prisma.workflow.findMany({
				where: {
					userId: userId
				}
			});
			
			if(allWorkflows){
					return res.status(200).send({success: true, data: allWorkflows, error: null});
			}
			return res.status(500).send({success: false, data: null, error: `Some error occurred at the backend while fetching the workflows.`});
	}
	catch(err){
			res.status(500).send({success: false, data: null, error: `Error happened while fetching workflows from the db.`});
    }
}

export async function getParticularWorkflow(req:Request, res:Response){
	try{

		const userId = req.userId;
		if(!userId){
			return res.status(400).send({success: false, data: null, error: "Unauthorized!"});
		}
		const workflowId = Number(req.params.id);
		if(!Number.isNaN(workflowId)){
			const particularWorkflow = await prisma.workflow.findUnique({
					where: {
							id: workflowId,
							userId: userId
					}
			})

			if(!particularWorkflow){
					return res.status(400).send({success: false, data: null, error: "No record found with this id!"});
			}

			if(particularWorkflow.userId != userId){
					return res.status(400).send({success: false, data: null, error: "User is not authorized to access this workflow!"});
			}

			return res.status(200).send({success: true, data: particularWorkflow, error: null});
		}else{
				return res.status(400).send({success: false, data: null, error: "No record found with this id!"});
		}

	}catch(err: any){
		console.log("Error fetching workflow: ", err);
			res.status(500).send({success: false, data: null, error: `Some error occurred while fetching the workflow from the db. Err: ${err.message}`})
	}
}

export async function editParticularWorkflow(req:Request, res:Response){
	//TODO: ensure credeit belongs to the current user
    const {title, nodes, connections, executing} = req.body;
		const { id } = req.params;
    if(!id){
        return res.status(400).send({success: false, data: null, error: "No such workflow exists with this userId."});
    }
		const workflowId = Number(id);
	  if(Number.isNaN(workflowId)){
			return res.status(450).send({success: false, data: null, error: "No workflow exists with this id."});
		}

    let finalData: FinalData = {};
    if(title){
        finalData.title = title
    }
    if(nodes){
        finalData.nodes = nodes
    }
    if(connections){
        finalData.connections = connections
    }
    if(executing !== undefined){
        finalData.executing = executing
    }
		
    try{
			// TODO: add a transaction here:
			const updatedWorkflow = await prisma.workflow.update({
					where: {
							id: workflowId
					},
					data: finalData
			})

			//TODO: ideally this should be a transaction
			if(finalData.nodes){
				finalData.nodes.forEach(async (node: any) => {
					if(node.type == "triggerNode" && node.data.nodeTitle == "Webhook"){
						const savedWebhook = await prisma.webhook.upsert({
							where: {
								id: node.id
							},
							update: {path: node.data.executionData.Path}, //TODO: maybe make these field names consistent and lowercased/camel cased
							create: {
								id: node.id,
								corresponding_workflow_id: workflowId,
								path: node.id,
								executing: updatedWorkflow.executing
							}
						})
					}
				})
			}

			// Sync executing status to Webhook table
			if(finalData.executing !== undefined){
				await prisma.webhook.updateMany({
					where: {
						corresponding_workflow_id: workflowId
					},
					data: {
						executing: finalData.executing
					}
				})
			}
			
			// if this workflow has a webhook trigger, then we need to create a webhook entry in the "webhook" table.
			
      return res.status(200).send({success: true, data: updatedWorkflow, error: null});
    }catch(err: any){
        if(err){
            if(err.code === 'P2025'){
                return res.status(500).send(`No entry in db found with this id. Err: ${err}`);
            }
        }
        console.log(`Error happened while trying to update the row in db: ${err}`);
        res.status(500).send(`Error happened while trying to update the row in db: ${err}`);
    }    
}

export const deleteAParticularWorkflow = async (req: Request, res: Response)=>{
	try{
		const workflowId = Number(req.params.id);
		if(!Number.isNaN(workflowId)){
			const workflow = await prisma.workflow.delete({
				where: {
					id: workflowId
				}
			})
			return res.status(200).send(workflow);
		}
		return res.status(400).send("No workflow exists with this id.");
		}catch(err: any){
			if(err.code == 'P2025'){
				return res.status(400).send("No workflow exists for this id.");
			}
			console.log(`Error while deleting a workflw: ${err.message}`);
			return res.status(500).send(`Some error occurred at the backend while deleting the workflow: ${err.message}`);
		}
}


// let's just save the available triggers in a file:

    // to save all of them in a single file:    
        // in an array[{}, {}, {}, {}]
        // in an object {} 
            // much easier to access all the values

    // in a single folder, but in different files 
