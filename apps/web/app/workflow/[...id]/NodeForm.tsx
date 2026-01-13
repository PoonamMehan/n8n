'use client'
import { Available_Triggers } from "./Available_Triggers";
import { Available_Actions } from "./Available_Actions";
import {useState, useEffect, useRef} from "react";

interface NodeFormProps {
  formDataHandler: (formData: Record<string, any>, id: string) => void,
  title: string,
  type: string,
  alreadyFilledValues: Record<string, any>,
  nodeId: string
}


export const NodeForm = ({ formDataHandler, title, type, alreadyFilledValues, nodeId}: NodeFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const triggerData = Available_Triggers[title];
  const valuesRef = useRef(formValues);
  const actionData = Available_Actions[title];
   const [credentialOptions, setCredentialOptions] = useState<Record<string, any[]>>({});


  useEffect(() => {
    const loadData = async () => {
      const defaults: Record<string, any> = {};
    
      if (type === "triggerNode" && triggerData) {
        triggerData.parameters.forEach((param) => {
          defaults[param.label] = param.default;
        });

        // after adding the default values of the form in our app -> add the values that were previously added by the user
        Object.entries(alreadyFilledValues).map(([key, val])=>{
          defaults[key] = val;
        })
        setFormValues(defaults);
      }

      if (type === "actionNode" && actionData) {

        const firstOperationKey = Object.keys(actionData.parameters)[0];
        const params = actionData.parameters[( firstOperationKey as string )]?.Parameters || [];
        const newCredOptions: Record<string, any[]> = {};

        for (const param of params) {
          defaults[param.label] = param.default || "";
          if (param.isCredential && param.fetch) {
            try {
              const res = await fetch(param.fetch.url, { method: param.fetch.method });
              const data = await res.json(); // [{id: "1", name: "My Bot"}, ...]
              
              newCredOptions[param.label] = Array.isArray(data) ? data : [];
                const fetchedList = Array.isArray(data) ? data : [];
  
              newCredOptions[param.label] = fetchedList;
              if (fetchedList.length > 0) {
                defaults[param.label] = fetchedList[0].id || fetchedList[0].name;
              } else {
                defaults[param.label] = "CREATE_NEW";
              }
              
            } catch (error) {
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
    };

    loadData();
  }, [title, type, triggerData, actionData]);

const handleInputChange = (label: string, value: string, isCredential = false, platform?: string) => {
    // Special check for the "Create New" option
    if (isCredential && value === "CREATE_NEW") {
      console.log(`OPEN MODAL for platform: ${platform}`);
      // Don't update state here, just open the modal
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  useEffect(()=>{
    valuesRef.current = formValues;
  }, [formValues]);

  useEffect(()=>{
    return ()=>{
      console.log(" The form Data sent from the NodeForm component: ", valuesRef.current);
      formDataHandler(valuesRef.current,nodeId);
    }
  },[]);

  let firstOperationKey;
  let actionNodeParams;
  if(actionData){
    firstOperationKey = Object.keys(actionData.parameters)[0];
    actionNodeParams = actionData.parameters[(firstOperationKey as string)]?.Parameters || [];
  }

  return type === "triggerNode" && triggerData ? (
    <div className="flex flex-col h-full" onClick={(e)=>{e.stopPropagation()}}>
     
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-bold text-gray-800">{triggerData.title}</h2>
        
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <p className="text-sm text-gray-500 mb-4">{triggerData.description}</p>

        {triggerData.parameters.map((val, index) => {
          const commonLabel = (
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {val.label}
            </label>
          );
          
          if (val.element === 'input') {
            return (
              <div key={index}>
                {commonLabel}
                <input
                  type="text"
                  value={formValues[val.label] || ""}
                  readOnly={val.readOnly}
                  onChange={(e) => handleInputChange(val.label, e.target.value)}
                  className={`w-full rounded border px-3 py-2 text-sm outline-none transition-all 
                    ${val.readOnly 
                      ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                />
              </div>
            );
          }
          
          else if (val.element === 'select') {
            return (
              <div key={index}>
                {commonLabel}
                <select
                  value={formValues[val.label] || ""}
                  onChange={(e) => handleInputChange(val.label, e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {val.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          
          else if (val.element === 'custom_webhook_url_renderer') {
            const currentMethod = formValues["HTTP Method"] || "GET";
            
            return (
              <div key={index} className="rounded-md bg-slate-50 border border-slate-200 p-3">
                {commonLabel}
                <div className="flex items-center gap-0 overflow-hidden rounded border border-gray-300 bg-white">
               
                  <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 border-r border-gray-300">
                    {currentMethod}
                  </div>
                 
                  <div className="flex-1 px-3 py-2 text-xs text-gray-600 truncate font-mono select-all">
                    {formValues[val.label] || val.default}
                  </div>
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  ) : (actionData && type === "actionNode" && actionNodeParams) ?(
    <>  
       <form onSubmit={(e)=>e.preventDefault()} className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
        <div className="border-b pb-2">
           <h3 className="font-bold text-lg">{actionData.title}</h3>
           <p className="text-xs text-gray-500">{actionData.defaultName}</p>
        </div>

        {actionNodeParams.map((param, idx) => {
          return (
            <div key={idx} className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">{param.label}</label>
              
              {param.element === "select" && (
                <select
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                  value={formValues[param.label] || ""}
                  onChange={(e) => handleInputChange(param.label, e.target.value, param.isCredential, param.platform)}
                >
                
                  {param.isCredential ? (
                    <>
                     
                      {credentialOptions[param.label]?.map((opt: any) => (
                        <option key={opt.id} value={opt.id}>{opt.name || opt.id}</option>
                      ))}
                  
                      {credentialOptions[param.label]?.length! > 0  && <option disabled>──────────</option>}

                      <option value="CREATE_NEW" className="text-blue-600 font-bold">
                        + Create New Credential...
                      </option>
                    </>
                  ) : (
      
                    param.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))
                  )}
                </select>
              )}

              {param.element === "input" && (
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                  value={formValues[param.label] || ""}
                  onChange={(e) => handleInputChange(param.label, e.target.value)}
                  placeholder={typeof param.default === 'string' ? param.default : ''}
                />
              )}
            </div>
          );
        })}
      </form>
    </>
  ):(
    <>
      <div>Some wrong form opened.</div>
    </>
  )
  
}