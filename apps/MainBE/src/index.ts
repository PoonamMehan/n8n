//ENDPOINTS:
    // /signup
    // /login
    // POST /workflow
    // GET /workflow
    // GET /workflow/:id
    // PUT /workflow/:id
    // POST /credential 
    // DELETE /credential
    // PUT /credential ??????????????????
    // POST, GET, PUT webhook

 
//DB SCHEMA:
    // users
    // workflow
    // webhook
    // credentials
    // available_triggers
    // available_credential_applications
    // availabe_actions
    // workflow_executions


//FRONTEND: 
    // React flow nodes showing
    // sidebar and other UI componenets(without functionality added) (shadcn / framer motion / tailwind)
    

import dotenv from "dotenv";
import app from './app.js';

dotenv.config();

const port = process.env.PORT || 8000;
const server = app.listen(port, ()=>{
    console.log("Server has started on port: ", port);
})

server.on("error", (error: Error)=>{
    console.log("Error occured in the running server: ", error)
})

server.on("listening", ()=>{
    console.log("Server has started listening!");
})

server.on("close", ()=>{
    console.log("Server closed.");
})