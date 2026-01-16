import { useEffect, useState, useRef } from "react";
import { Available_Triggers } from "./Available_Triggers";
import { Available_Actions } from "./Available_Actions";
import { Available_Credential_Apps } from "./Available_Credentials";

const [type, setType] = useState<string>('actionNode');
const [title, setTitle] = useState<string>('');
const triggerData = Available_Triggers[title];
const [nodeId, setNodeId] = useState<string>('');
const [alreadyFilledValues, setAlreadyFilledValues] = useState<Record<string, any>>({});
const [formValues, setFormValues] = useState<Record<string, any>>({});
const actionData = Available_Actions[title];
const [credentialOptions, setCredentialOptions] = useState<Record<string, any>>({});
const valuesRef = useRef(formValues);
const [credentialsFormValues, setCredentialsFormValues] = useState<Record<string, any>>({}); 

useEffect(()=>{
  const loadData = async()=>{
    const defaults: Record<string, any> = {};
    if(type === "triggerNode" && triggerData){
      triggerData.parameters.forEach((param) => {
        if(param.element === "custom_webhook_url_renderer"){
          defaults[param.label] = `${param.default}${nodeId}`;
        }else if(param.label === "Path"){
          defaults[param.label] = nodeId;
        }else{
          defaults[param.label] = param.default;
        }
      });

      Object.entries(alreadyFilledValues).map(([key, val])=>{
        defaults[key] = val;
      })
      setFormValues(defaults);
    }
    if(type === 'actionNode' && actionData) {
      const firstOperationKey = Object.keys(actionData.parameters)[0];
      const params = actionData.parameters[(firstOperationKey as string)]?.Parameters || [] ;
      const newCredOptions: Record<string, any[]> = {};

      for (const param of params){
        defaults[param.label] = param.default || "";
        if(param.isCredential && param.fetch){
          try{
            const res = await fetch(param.fetch.url, { method: param.fetch.method });
            const data = await res.json();
            const fetchedList = Array.isArray(data) ? data : [];
            newCredOptions[param.label] = fetchedList;
            if(fetchedList.length > 0){
              defaults[param.label] = fetchedList[0].id || fetchedList[0].name;
            }else{
              defaults[param.label] = "";
            }
          }
          catch(error){
            console.error(`Error fetching credentials for ${param.label}`, error);
            newCredOptions[param.label] = [];
            defaults[param.label] = "CREATE_NEW";
          }
        } 
      }
      Object.entries(alreadyFilledValues).map(([key, val])=>{
        defaults[key] = val;
      })

      setCredentialOptions(newCredOptions);
      setFormValues(defaults);
    }
    loadData();
  }
}, [title, type, triggerData, actionData]);

const handleInputChange = (label: string, value: string, isCredential = false, platform?: string )=>{
  if(isCredential && value === "CREAT_NEW"){
    if(platform){
      openCredentialCreationForm(platform);
    }
    return;
  }

  setFormValues((prev) => ({
    ...prev,
    [label]: value
  }));
};

useEffect(()=>{
  valuesRef.current = formValues;
}, [formValues]);

useEffect(()=>{
  return ()=>{
    console.log(" The form Data sent from the NodeForm component: ", valuesRef.current);
    // formDataHandler(valuesRef.current, nodeId);
  }
},[])

const openCredentialCreationForm = (credentialPlatform: string)=>{
  const credAppConfig = Available_Credential_Apps[credentialPlatform];
  if(!credAppConfig){
    return;
  }
  
  let defaults: Record<string, any> = {};
  let existingCount = 0;
  if(actionData){
    const firstOperationKey = Object.keys(actionData.parameters)[0];
    const params = actionData.parameters[( firstOperationKey as string )]?.Parameters || [];
    const parentParam = params.find(p => p.platform === credentialPlatform);
    // parentParam = {label, }
    if (parentParam && credentialOptions[parentParam.label]) {

      existingCount = credentialOptions[parentParam.label]?.length!;
    }
    
  }

}


const handleCredentialInputChange = (label: string, value: string)=>{
  setCredentialsFormValues(prev => ({
    ...prev,
    [label]: value
  }));
};

const handleSaveCredential = async () => {
  if(!currentCredentialPlatform) return;

  const payload = {
    title: Available_Credential_Apps[currentCredentialPlatform]?.title,
    platform: currentCredetialPlatform,
    data: credentialsFormValues,
    userId: ""
  };

  try{
    const response = await fetch("http://lacalhost:8000/api/v1/credential", {
    method: "POST",
    headers: {'Content_Type': "application/json"},
    body: JSON.stringify(payload)
    });

    const savedCredential = await response.json();
    if(!response.ok){
      console.log("Error while saving the credential: ", savedCredential);
      return;
    }

    const actionParams = actionData?.parameters[Object.keys(actionData.parameters)[0]].Parameters || [];
    const parentParam = actionParams.find(p => p.platform === currentCredentialPlatform);

    if(parentParam){
      setCredentialOptions(prev => ({
        ...prev,
        [parentParam.label]: [
          ...Available_Actions
        ]
      }))
    }
  }
}