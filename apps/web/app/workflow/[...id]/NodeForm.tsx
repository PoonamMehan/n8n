'use client'
import { Available_Triggers } from "./Available_Triggers";
import { Available_Actions } from "./Available_Actions";
import { Available_Tools } from "./Available_Tools";
import { useState, useEffect, useRef } from "react";
import { Available_Credential_Apps } from "./Available_Credentials";
import { TriggerIconMap } from "./NodeIcons";
import { MdClose } from "react-icons/md";

interface NodeFormProps {
  formDataHandler: (formData: Record<string, any>, id: string) => void,
  title: string,
  type: string,
  alreadyFilledValues: Record<string, any>,
  nodeId: string,
  nodes: any[]
}

export const NodeForm = ({ formDataHandler, title, type, alreadyFilledValues, nodeId, nodes }: NodeFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const triggerData = Available_Triggers[title];
  const valuesRef = useRef(formValues);
  const actionData = Available_Actions[title];
  const toolData = Available_Tools[title];
  const [credentialOptions, setCredentialOptions] = useState<Record<string, any[]>>({});
  const [isCredentialFormOpen, setIsCredentialFormOpen] = useState(false);
  const [currentCredentialPlatform, setCurrentCredentialPlatform] = useState<string | null>(null);
  const [credentialsFormValues, setCredentialsFormValues] = useState<Record<string, any>>({});
  const [activeParamForVariable, setActiveParamForVariable] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const defaults: Record<string, any> = {};

      if (type === "triggerNode" && triggerData) {

        triggerData.parameters.forEach((param) => {
          if (param.element === 'custom_webhook_url_renderer') {
            defaults[param.label] = `${param.default}${nodeId}`;
          } else if (param.label === "Path") {
            defaults[param.label] = nodeId;
          } else {
            defaults[param.label] = param.default;
          }
        });

        // after adding the default values of the form in our app -> add the values that were previously added by the user
        Object.entries(alreadyFilledValues).map(([key, val]) => {
          defaults[key] = val;
        })
        setFormValues(defaults);
      }

      const nodeData = (type === "actionNode" || type === "aiAgentNode") ? actionData : (type === "toolNode" ? toolData : null);
      if (nodeData && (type === "actionNode" || type === "aiAgentNode" || type === "toolNode")) {
        const firstOperationKey = Object.keys(nodeData.parameters)[0];
        const params = nodeData.parameters[(firstOperationKey as string)]?.Parameters || [];
        const newCredOptions: Record<string, any[]> = {};

        for (const param of params) {
          defaults[param.label] = param.default || "";
          if (param.isCredential && param.fetch) {
            try {
              const res = await fetch(param.fetch.url, { method: param.fetch.method });
              const data = await res.json();
              const fetchedList = Array.isArray(data) ? data : [];
              newCredOptions[param.label] = fetchedList;
              if (fetchedList.length > 0) {
                defaults[param.label] = fetchedList[0].id || fetchedList[0].name; // I think it will be "fetchedList[title]" OR fetchedList[data.uniqueName]
              } else {
                defaults[param.label] = "";
              }

            } catch (error) {
              console.error(`Error fetching credentials for ${param.label}`, error);
              newCredOptions[param.label] = [];
              defaults[param.label] = "";
            }
          }
        }
        // Apply previously saved values, but validate credentials still exist
        Object.entries(alreadyFilledValues).forEach(([key, val]) => {
          // Check if this key is a credential field
          const isCredentialField = newCredOptions[key] !== undefined;

          if (isCredentialField) {
            // Only use saved value if credential still exists in fetched list
            const credentialStillExists = newCredOptions[key]?.some((cred: any) => String(cred.id) === String(val));
            if (credentialStillExists) {
              defaults[key] = val;
            }
            // Otherwise keep the default (empty string or first available)
          } else {
            // Non-credential field, use saved value directly
            defaults[key] = val;
          }
        });
        setCredentialOptions(newCredOptions);
        setFormValues(defaults);
      }
    };

    loadData();
  }, [title, type, triggerData, actionData, toolData]);

  const handleInputChange = (label: string, value: string, isCredential = false, platform?: string) => {
    // Special check for the "Create New" option
    if (isCredential && value === "CREATE_NEW") {
      // Logic to open the modal
      if (platform) {
        openCredentialCreationForm(platform);
      }
      // Don't update state of the main form to "CREATE_NEW", keep the old value until they save the new one
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleVariableSelection = (variable: string) => {
    if (activeParamForVariable) {
      setFormValues((prev) => ({
        ...prev,
        [activeParamForVariable]: (prev[activeParamForVariable] || "") + variable
      }));
      setActiveParamForVariable(null);
    }
  }

  useEffect(() => {
    valuesRef.current = formValues;
  }, [formValues]);

  useEffect(() => {
    return () => {
      console.log(" The form Data sent from the NodeForm component: ", valuesRef.current);
      formDataHandler(valuesRef.current, nodeId);
    }
  }, []);

  const openCredentialCreationForm = (credentialPlatform: string) => {
    const credAppConfig = Available_Credential_Apps[credentialPlatform];

    if (!credAppConfig) return;

    let defaults: Record<string, any> = {};

    // Calculate Default Name (e.g., Telegram Account 2)
    // Find the parameter label in the *main form* that uses this platform to check how many exist
    let existingCount = 0;
    if (currentNodeData) { //TODO: change the method we find the name for a new credential
      const firstOperationKey = Object.keys(currentNodeData.parameters)[0];
      const params = currentNodeData.parameters[(firstOperationKey as string)]?.Parameters || [];
      const parentParam = params.find((p: any) => p.platform === credentialPlatform);

      if (parentParam && credentialOptions[parentParam.label]) {
        // console.log("NAME: ", (credentialOptions[parentParam.label])![0].data.name);
        const regex = /^(?<name>.+?)\s+(?<number>\d+)$/
        credentialOptions[parentParam.label]?.forEach(cred => {
          const currentCredName = cred.data.name;
          const match = currentCredName.match(regex);
          if (match.groups.name == credAppConfig.defaultName && match.groups.name) {
            existingCount = Math.max(existingCount, Number(match.groups.number));
            console.log("NUMBER: ", existingCount);
          }
        })
      }
    }

    // Set internal name for the credential (shown in dropdowns)
    defaults["name"] = `${credAppConfig.defaultName} ${existingCount + 1}`;
    console.log("NAME: ", defaults["name"])
    // Set defaults for the credential fields (Access Token, etc.)
    credAppConfig.parameters.forEach(param => {
      defaults[param.label] = param.default;
    });

    setCredentialsFormValues(defaults);
    setCurrentCredentialPlatform(credentialPlatform);
    setIsCredentialFormOpen(true);
  }
  // TODO:  only save the id of selected credential, and refretch all the credentials -> so that when a cred is deleted we are not shing that as an option.
  const handleCredentialInputChange = (label: string, value: string) => {
    setCredentialsFormValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleSaveCredential = async () => {
    if (!currentCredentialPlatform) return;

    // Create the Payload Object
    // Note: We don't send 'id' because the database creates it.
    const payload = {
      title: Available_Credential_Apps[currentCredentialPlatform]?.title, // e.g., "Telegram API"
      platform: currentCredentialPlatform, // e.g., "TelegramAPI"
      data: credentialsFormValues, // e.g., { name: "My Bot", "Access Token": "123..." }
      userId: "933680c6-5d6f-4f0a-92c8-72c3eca5ea31" //TODO: don't hard code it
    };

    try {
      //send the payload and save the "credential"
      const response = await fetch("http://localhost:8000/api/v1/credential/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const savedCredential = await response.json();
      if (!response.ok) {
        console.log("Error while saving the credential: ", savedCredential);
        return;
      }
      // We need to find which parameter in the main form triggered this modal
      // to update the specific dropdown list.
      const nodeParams = currentNodeData?.parameters[Object.keys(currentNodeData.parameters)[0]!]?.Parameters || [];
      const parentParam = nodeParams.find((p: any) => p.platform === currentCredentialPlatform);

      if (parentParam) {
        // Add the new credential to the dropdown list
        setCredentialOptions(prev => ({
          ...prev,
          [parentParam.label]: [
            ...(prev[parentParam.label] || []),
            { id: savedCredential.id, name: savedCredential.data.name }
          ]
        }));
        // Structure of credentialOptions: credentialOptions = {
        //   [label: string]: Array<{
        //     id: string | number
        //     name: string
        //   }>
        // }

        // Automatically select the new credential in the main form
        handleInputChange(parentParam.label, savedCredential.id);
      }

      // Close Modal
      setIsCredentialFormOpen(false);
      setCredentialsFormValues({}); // Clear form

    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save credential");
    }
  };

  let firstOperationKey;
  let nodeParams;
  const currentNodeData = actionData || toolData;
  if (currentNodeData) {
    firstOperationKey = Object.keys(currentNodeData.parameters)[0];
    nodeParams = currentNodeData.parameters[(firstOperationKey as string)]?.Parameters || [];
  };

  const handleCredentialButtonClick = (label: string, credentialName: string) => {
    if (label == "Sign in with Google") {
      // window.open()
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        `http://localhost:8000/api/v1/auth/google/login?name=${credentialName}`,
        "GoogleAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  }

  useEffect(() => {
    const handleGoogleAuthSuccessEvent = (event: MessageEvent) => {
      if (event.origin != "http://localhost:8000") return;

      if (event.data.status === "success" && event.data.credential) {
        const newCred = event.data.credential;
        console.log("Google Auth Success: ", newCred);

        //find the parent parameter to update
        const currentActionData = Available_Actions[title];
        if (currentActionData) {
          const firstOperationKey = Object.keys(currentActionData.parameters)[0];
          const actionParams = currentActionData.parameters[(firstOperationKey as string)]?.Parameters || [];
          const parentParam = actionParams.find(p => p.platform === newCred.platform);

          if (parentParam) {
            //add new credential to options
            setCredentialOptions(prev => ({
              ...prev,
              [parentParam.label]: [
                ...(prev[parentParam.label] || []),
                { id: newCred.id, name: newCred.name }
              ]
            }));

            //Select the new credential
            setFormValues(prev => ({
              ...prev,
              [parentParam.label]: newCred.id
            }));

            //close the modal
            setIsCredentialFormOpen(false);
            setCredentialsFormValues({});
          }
        }
      }
    }
    window.addEventListener("message", handleGoogleAuthSuccessEvent);
    return () => {
      window.removeEventListener("message", handleGoogleAuthSuccessEvent);
    }
  }, [title])

  return type === "triggerNode" && triggerData ? (
    <div className="flex flex-col h-full" onClick={(e) => { e.stopPropagation() }}>
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
          )
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
            )
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
                    {formValues[val.label] || `${val.default}${nodeId}`}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  ) : (currentNodeData && (type === "actionNode" || type === "aiAgentNode" || type === "toolNode") && nodeParams) ? (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 p-4 h-full overflow-y-auto relative">
        <div className="border-b pb-2">
          <h3 className="font-bold text-lg">{currentNodeData.title}</h3>
          <p className="text-xs text-gray-500">{currentNodeData.defaultName}</p>
        </div>
        {nodeParams.map((param: any, idx: number) => {
          return (
            <div key={idx} className="flex flex-col gap-1">
              {param.element === "input" || param.element === "textarea" ? (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">{param.label}</label>
                  <button type="button" onClick={() => setActiveParamForVariable(param.label)} className="text-xs text-blue-500 hover:text-blue-700">
                    + Variable
                  </button>
                </div>
              ) : (
                <label className="text-sm font-semibold text-gray-700">{param.label}</label>
              )}
              
              {param.element === "select" && (
                <select
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                  value={formValues[param.label] || ""}
                  onChange={(e) => handleInputChange(param.label, e.target.value, param.isCredential, param.platform)}
                >
                  {param.isCredential ? (
                    <>
                      <option value="" disabled>Select Credential...</option>
                      {credentialOptions[param.label]?.map((opt: any) => (
                        <option key={opt.id} value={opt.id}>{opt.name || opt.id}</option>
                      ))}
                      {credentialOptions[param.label]?.length! > 0 && <option disabled>──────────</option>}
                      <option value="CREATE_NEW" className="text-blue-600 font-bold" onClick={(e) => { e.preventDefault(); setIsCredentialFormOpen(true) }}>
                        + Create New Credential
                      </option>
                    </>
                  ) : (
                    param.options?.map((opt: any) => (
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
              {param.element === "textarea" && (
                <textarea
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
                  value={formValues[param.label] || ""}
                  onChange={(e) => handleInputChange(param.label, e.target.value)}
                  placeholder={typeof param.default === 'string' ? param.default : ''}
                />
              )}
            </div>
          );
        })}

        {activeParamForVariable && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setActiveParamForVariable(null)}>
            <div className="w-72 rounded-xl bg-white p-4 shadow-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-700">Select Variable</span>
                <button onClick={() => setActiveParamForVariable(null)}><MdClose className="h-4 w-4 text-gray-400" /></button>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {nodes
                  .filter(n => n.id !== nodeId && n.type === "triggerNode")
                  .map((n) => (
                    <div key={n.id} className="border border-gray-100 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-bold bg-gray-100 px-1 rounded text-gray-500">{n.data.nodeTitle}</div>
                        <div className="truncate text-sm font-medium text-gray-700">{n.data.nodeName}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleVariableSelection(`{{${n.data.nodeName || 'Node'}.body}}`)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          .body
                        </button>
                        <button
                          onClick={() => handleVariableSelection(`{{${n.data.nodeName || 'Node'}.body.message}}`)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          .body.message
                        </button>
                        <button
                          onClick={() => handleVariableSelection(`{{${n.data.nodeName || 'Node'}.body.text}}`)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          .body.text
                        </button>
                      </div>
                    </div>
                  ))}
                {nodes.filter(n => n.type === "triggerNode").length === 0 && <div className="text-xs text-gray-400 italic">No trigger nodes found.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Credential Modal */}
        {isCredentialFormOpen && currentCredentialPlatform && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            {/* Credential Modal Content */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-500">New Credential</span>
                <span className="font-bold text-gray-800">{Available_Credential_Apps[currentCredentialPlatform]?.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCredentialFormOpen(false)}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCredential}
                  className="rounded bg-blue-600 px-4 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                  value={credentialsFormValues["name"] || ""}
                  disabled={true}
                />
              </div>
              {Available_Credential_Apps[currentCredentialPlatform]?.parameters.map((param, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">{param.label}</label>
                  {param.element === "input" && (
                    <input
                      type="text"
                      className={`border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 ${param.readOnly ? 'bg-gray-100 text-gray-500' : ''}`}
                      value={credentialsFormValues[param.label] || ""}
                      readOnly={param.readOnly}
                      onChange={(e) => handleCredentialInputChange(param.label, e.target.value)}
                      placeholder={param.default}
                    />
                  )}
                  {param.element === "button" && (
                    <button
                      className="flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={(e) => { e.preventDefault(); handleCredentialButtonClick(param.label, credentialsFormValues["name"]) }}
                    >
                      {param.icon && TriggerIconMap[param.icon] && (
                        <span>{TriggerIconMap[param.icon]}</span>
                      )}
                      <span>{param.label}</span>
                    </button>
                  )}
                  {param.element === "select" && (
                    <select
                      className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                      value={credentialsFormValues[param.label] || param.default || ""}
                      onChange={(e) => handleCredentialInputChange(param.label, e.target.value)}
                      disabled={param.readOnly}
                    >
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </form>
    </>
  ) : (
    <>
      <div>Some wrong form opened.</div>
    </>
  )

}