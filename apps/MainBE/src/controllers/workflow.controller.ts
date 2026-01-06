import {Request, Response} from "express";
import {prisma} from "@repo/db";

interface FinalData {
    title?: string,
    enabled?: boolean,
    nodes?: Record<string, unknown>,
    connections?: Record<string, unknown>
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
    // you make an entry to the "workflows" table with just mentioning the name of the workflow "title"
    const {title} = req.body;
    // try{
    //     const workflow = await prisma.workflow.create({
    //     data: {
    //         "title": title
    //     }
    //     })
    //     res.status(200).send(`Successfully entry made in the workflow table. Data: ${workflow}`)
    // }catch(error){
    //     console.log("Error while making an entry in the Workflow table: ", error);
    //     res.status(500).send(`Error happened at the backend while creating an entry in the Workflow db. Err: ${error}`);
    // }
}

export async function getWorkflows(req:Request, res:Response){
    try{
        const allWorkflows = await prisma.workflow.findMany();
        res.status(200).send(allWorkflows);
    }
    catch(err){
        res.status(500).send(`Error happened while fetching workflows from the db: ${err}`);
    }
}

export async function getParticularWorkflow(req:Request, res:Response){
    const {workflowId} = req.body
    try{
        const particularWorkflow = await prisma.workflow.findUnique({
            where: {
                id: workflowId
            }
        })
        if(!particularWorkflow){
            res.status(400).send("No record found with this id!");
        }
        res.status(200).send(particularWorkflow);
    }catch(err){
        res.status(500).send(`Some error occurred while fetching the workflow from the db. Err: ${err}`)
    }
}

export async function editParticularWorkflow(req:Request, res:Response){
    const d = req.body;
    let title = null;
    let enabled = null;
    let nodes = null;
    let connections = null;

    if(d.title){
        title = d.title
    }
    if(d.enabled){
        enabled = d.enabled;
    }
    if(d.nodes){
        nodes = d.nodes;
    }
    if(d.connections){
        connections = d.connections;
    }

    const finalData:FinalData = {};
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
        // const updatedWorkflow = await prisma.workflow.update({
        //     where: {
        //         id: d.id
        //     },
        //     data: finalData
        // })

        // res.status(200).send(updatedWorkflow);
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
