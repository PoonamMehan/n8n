//navbar
//actual stuff
  // fetch all the workflows 
// create Workflow button: this will have total number of workflows -> we are going to pass that number to the 


// Overview: all the workflows
// Create workflows button

// when saved workflow clicked: URL: /workflow/workflowId
// when new workflow being created: 
  // URL: /workflow/new?projectId=Personal
    // we will be creating new prject: yet no data is stred in the db
    // we generate workflow name (using the number of workflows were in the /workflows page -> send the number somehow to the child component & generate the name)
      //once generated: 
      // UI:
        // PrjoectId/workflow name: NAVBAR: save Button
        // react flow
        // right: all the nodes that can be used

        // once a node is added on the react flow: 
        // we maintain a react state to store all the nodes & connections
        // add a dustbin button to delete a node: dynamically keep on changing the react state to reflect the current state of the react flow canvas

        // SAVE button pressed: 
        // get the workflow id from the backend: -> in the workflow component: URL: /workflow/workflowId


        // AS I proceed to add any new node: 
          // Open a form like component hovered over the old structure
          // TODO: framer motion subtle animations/transitions
          // as i click on the node to be added
            // open /workflow/[workflowId]/[newNodeId]
            // a new db entry is made as the node is opened to be added:
              // inside the node form i fill all the data, SAVE button will make a new entry in the db with the data.
              // before we click 'x' or click anywhere outside the opened form: look for if the "save" button is enabled & toaster("Save the node before you exit.");

              //TODO: IDK abut the fallback [nodeId]/page.tsx page's sharing

        // Credentials UI & saving


              
// EXECUTION: 


