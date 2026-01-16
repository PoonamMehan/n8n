interface Triggers_Structure {
    title: string,
    description: string,
    parameters: TriggerParameter[],
    icon: string,
    defaultName: string
}
export type TriggerElementType = 'input' | 'select' | 'custom_webhook_url_renderer';

export interface TriggerParameter {
  label: string;
  element: TriggerElementType;
  default: string;
  description?: string;
  options?: string[];
  readOnly?: boolean;
}

type Avail_Triggers_Obj = Record<string, Triggers_Structure>;

// object containing the Available triggers
export const Available_Triggers: Avail_Triggers_Obj = {
    "Webhook": {
        title: "Webhook",
        defaultName: "Webhook",
        description: "Starts the workflow when a webhook is called",
        parameters: [
							{
							label: "Webhook URL",
							element: "custom_webhook_url_renderer", 
							default: "http://localhost:8000/webhook/",
							description: "This is the URL you need to trigger to start this workflow."
							},
							{
							"label": "HTTP Method",
							"element": "select",
							"options": ["GET", "POST", "PUT"],
							"default": "GET"
							},
							{
							"label": "Path",
							"element": "input",
							"default": "",
							"readOnly": true,
							"description": "The unique identifier for this webhook."
							},
							{
							"label": "Authentication",
							"element": "select",
							"options": ["None"],
							"default": "None"
							},
							{
							"label": "Respond",
							"element": "select",
							"options": ["Immediately"],
							"default": "Immediately"
							}
					],
        icon: "webhook"
    }
}

// should we make the Path of webhook unique, exclusive for one webhook only? 