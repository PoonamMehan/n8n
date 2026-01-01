import prisma, { PrismaClientKnownRequestError } from '@repo/db/index';
import { Request, Response } from 'express';

interface TelegramCredentials{
    accessToken: string,
    baseURL: string,
    usersSharing?: string[]
}
// Connection: 
    // access token 
    // base url
    // Table: Created at, Last modified

export async function addCredentialHandler(req: Request, res: Response){
    //Get credentials of all the available things for credentials
    // all the available credentials, their interface based on the name of the credential
    const d = req.body;
    let finalData: Partial<TelegramCredentials> = {};
    finalData.accessToken = d.accessToken;  
    finalData.baseURL = d.baseURL;
    finalData.usersSharing = d.usersSharing;
    // according to the name of the credential came in payload, Predefined Interface, take that and get all the credential info

    try{
        const addedCredential = await prisma.credential.create({
            data: {
                title: d.title,
                platform: d.platform,
                data: finalData
            }
        })

        if(addedCredential){
            res.status(200).send(addedCredential);
        }else{
            res.send(500).send(`Credential wasn't properly added to the db, db reply: ${addedCredential}`)
        }
    }catch(err){
        res.status(500).send(`Some error occured while making entry to the db. Err: ${err}`);
    }
}

export function deleteCredentialHandler (req: Request, res: Response){
    //delete the credential based on its id
    const {id} = req.body;

    if(id){
        try{
            const fetchedCred = prisma.credential.delete({
                where: {
                    id: id
                }
            })
            res.status(200).send(fetchedCred);
        }catch(err){
            if(err instanceof PrismaClientKnownRequestError){
                if(err.code === 'P2025'){
                    res.status(400).send("No credential with this id existed in the db.");
                }
            }
            res.status(500).send(`Some error ocurred while deleting the credential from the db: ${err}`);
        }
    }
}


export async function editCredentialHandler (req:Request, res:Response){
    // edit a credential based on its id
    // title
    // data: accessToken
    // baseURL 
    // usersSharing
    
    const {id, title, accessToken, baseURL, usersSharing} = req.body;
    
    let d: Partial<TelegramCredentials> = {};
    if(accessToken){
        d.accessToken = accessToken;
    }if(baseURL){
        d.baseURL = baseURL;
    }if(usersSharing){
        d.usersSharing = usersSharing;
    }
    
    try{    
        const updatedRecord = await prisma.credential.update({
            where: {
                id: id
            },
            data: {
                title: title,
                data: d
            }
        })

        res.status(200).send(updatedRecord);
    }catch(err){
        if(err instanceof PrismaClientKnownRequestError){
            if(err.code === 'P2025'){
                res.status(400).send("No credential with this id existed in the db.");
            }
        }
        res.status(500).send(`Some error occured while updating the row in db: ${err}`);
    }
}



// Optimize the db
// Webhook: Trigger: Db table
    // Figure out the parameters for Webhook trigger
    // Mention all the methods/options we are going to provide to the Webhook in the available_triggers: parameters

// Telegram: Action: db table:  
    // figure out params nested object structure
    // Edit the Available_Actions table

// Available_Credential_Apps: db table: 
    // Descriptive object of all the params Telegram needs
    // Basic auth 
    // header auth

// React flow 
// Build the ui
// make all them available at the frontend

// what is the need of interfaces? Figure out
