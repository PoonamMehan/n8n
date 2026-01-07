import {Request, Response} from "express";
import {prisma} from "@repo/db";

interface FinalData {
    title?: string,
    enabled?: boolean,
    nodes?: Record<string, any>,
    connections?: Record<string, any>
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
        const workflow = await prisma.workflow.create({
        data: {
            "title": title,
            "userId": userId
        }
        });
        res.status(200).send(`Successfully entry made in the workflow table. Data: ${JSON.stringify(workflow)}`);
    }catch(error){
        console.log("Error while making an entry in the Workflow table: ", error);
        res.status(500).send(`Error happened at the backend while creating an entry in the Workflow db. Err: ${error}`);
    }
}

export async function getWorkflows(req:Request, res:Response){
    try{
        const allWorkflows = await prisma.workflow.findMany();
        if(allWorkflows){
            return res.status(200).send(allWorkflows);
        }
        return res.status(500).send(`Some error happened at the backemd while fetching the workflows: ${allWorkflows}`);
    }
    catch(err){
        res.status(500).send(`Error happened while fetching workflows from the db: ${err}`);
    }
}

export async function getParticularWorkflow(req:Request, res:Response){
    try{
        const workflowId = Number(req.params.id);
        if(!Number.isNaN(workflowId)){
            const particularWorkflow = await prisma.workflow.findUnique({
                where: {
                    id: workflowId
                }
            })
            if(!particularWorkflow){
                res.status(400).send("No record found with this id!");
            }
            res.status(200).send(particularWorkflow);
        }else{
            res.status(400).send("No record found with this id!")
        }
    }catch(err: any){
        res.status(500).send(`Some error occurred while fetching the workflow from the db. Err: ${err.message}`)
    }
}

export async function editParticularWorkflow(req:Request, res:Response){
    const {title, enabled, nodes, connections, id} = req.body;
    if(!id){
        return res.status(400).send("No such workfl exists with this userId.");
    }

    let finalData: FinalData = {};
    if(title){
        finalData.title = title
    }
    if(enabled){
        finalData.enabled = enabled
    }
    if(nodes){
        finalData.nodes = nodes
    }
    if(connections){
        finalData.connections = connections
    }

    try{
        const updatedWorkflow = await prisma.workflow.update({
            where: {
                id: id
            },
            data: finalData
        })

        res.status(200).send(updatedWorkflow);
    }catch(err: any){
        if(err){
            if(err.code === 'P2025'){
                res.status(500).send(`No entry in db found with this id. Err: ${err}`);
            }
        }
        console.log(`Error happened while trying to update the row in db: ${err}`);
        res.status(500).send(`Error happened while trying to update the row in db: ${err}`);
    }
    
}



// let's just save the available triggers in a file:

    // to save all of them in a single file:    
        // in an array[{}, {}, {}, {}]
        // in an object {} 
            // much easier to access all the values

    // in a single folder, but in different files 
