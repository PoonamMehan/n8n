'use client'
import { Available_Triggers } from "./Available_Triggers";
import { Available_Actions } from "./Available_Actions";
import {useState, useEffect, useRef} from "react";

interface NodeFormProps {
  formDataHandler: (formData: Record<string, any>) => void;
  formClosingHandler: () => void;
  title: string;
  type: string;
}


export const NodeForm = ({ formDataHandler, formClosingHandler, title, type}: NodeFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const triggerData = Available_Triggers[title];
  const valuesRef = useRef(formValues);


  useEffect(() => {
    if (triggerData) {
      const defaults: Record<string, any> = {};
      triggerData.parameters.forEach((param) => {
        defaults[param.label] = param.default;
      });
      setFormValues(defaults);
    }
  }, [title, triggerData]);

  const handleInputChange = (label: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    formDataHandler(formValues); // Pass data back to parent
    formClosingHandler();
  };

  useEffect(()=>{
    valuesRef.current = formValues;
  }, [formValues]);

  useEffect(()=>{
    return ()=>{
      formDataHandler(valuesRef.current);
    }
  },[])

  return type === "triggerNode" && triggerData ? (
    <div className="flex flex-col h-full" onClick={(e)=>{e.stopPropagation()}}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-bold text-gray-800">{triggerData.title}</h2>
        <button 
          onClick={(e)=>onSave(e)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Form Area */}
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
  ) : (
    <>  
      
    </>
  )
}