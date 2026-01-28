import {prisma} from '@repo/db';
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
    // let finalData: Partial<TelegramCredentials> = {};
    // finalData.accessToken = d.accessToken;  
    // finalData.baseURL = d.baseURL;
    // finalData.usersSharing = d.usersSharing;
    // according to the name of the credential came in payload, Predefined Interface, take that and get all the credential info

    //WHEN  WE WILL USE THOSE CREDENTIALS THEN WE WILL THRW THE ERROR THAT THE CREDENTIAL IS NOT COMPLETE.
    console.log(d);

    if(!d.title || !d.platform || !d.data || !d.userId){
        return res.status(400).send({errorMesasge: "Invalid payload sent."});
    }
    try{
        const addedCredential = await prisma.credentials.create({
            data: {
                title: d.title,
                platform: d.platform,
                data: d.data,
                userId: d.userId //TODO: don't hard code it -> JWT HANDLER 
            }
        })

        if(addedCredential){
            return res.status(200).send(addedCredential);
        }else{
            return res.send(500).send(`Credential wasn't properly added to the db, db reply: ${addedCredential}`)
        }
    }catch(err){
        return res.status(500).send(`Some error occured while making entry to the db. Err: ${err}`);
    }
}

export function deleteCredentialHandler (req: Request, res: Response){
    //delete the credential based on its id
    const {id} = req.params;
    const credId = Number(id);
    if(!Number.isNaN(credId)){
        try{
            const fetchedCred = prisma.credentials.delete({
                where: {
                    id: credId
                }
            })
            res.status(200).send(fetchedCred);
        }catch(err: any){
            if(err){
                if(err.code === 'P2025'){
                    return res.status(400).send("No credential with this id existed in the db.");
                }
            }
            return res.status(500).send(`Some error ocurred while deleting the credential from the db: ${err}`);
        }
    }else{

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
        const updatedRecord = await prisma.credentials.update({
            where: {
                id: id
            },
            data: {
                title: title,
                data: d
            }
        })

        res.status(200).send(updatedRecord);
    }catch(err: any){
        if(err){
            if(err.code === 'P2025'){
                res.status(400).send("No credential with this id existed in the db.");
            }
        }
        res.status(500).send(`Some error occured while updating the row in db: ${err}`);
    }
}

export async function getAllCredentialHandler(req: Request, res: Response){
    try{
        const allCredentials = await prisma.credentials.findMany();
        return res.status(200).send(allCredentials);
    }catch(err: any){
        return res.status(500).send(`Some err occurred at the BE while fetching the creadentials from DB: ${err.message}`);
    }
}

export async function getACredentialHandler(req: Request, res: Response){
    try{
        const idParam = Number(req.params.id);
        if(!Number.isNaN(idParam)){
            const cred = await prisma.credentials.findUnique({
                where: {
                    id: idParam
                }
            })
            if(cred){
                return res.status(200).send(cred);
            }
            return res.status(400).send("No credential with this id exists.");
        }
        return res.status(400).send("Invalid credential id.");
    }catch(err: any){
        return res.status(500).send(`Some error occurred on our backend: ${err.message}`);
    }
}

export const getACredentialWithPlatformHandler = async (req: Request, res: Response)=>{
	try{
		const {platform} = req.params;
		if(!platform){
			console.log("Incorrect credential platform.");
			return res.status(400).send(`Give a valid platform to find the credentials for.`);
		}
		const allCredentials = await prisma.credentials.findMany({
			where: {
				platform: platform 
			}
		})
		return res.status(200).send(allCredentials);
	}catch(err: any){
		console.log("Some err occurred on the backend: ", err);
		res.status(500).send(`Some error happened on the backend while fetching the credentials: ${err.message}`);
	}
}
// get all credentials
// get particular credential


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
