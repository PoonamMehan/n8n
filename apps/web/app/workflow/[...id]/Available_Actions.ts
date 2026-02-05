interface Actions_Structure {
	title: string,
	description: string,
	defaultName: string,
	parameters: Record<string, ActionOperation>
	icon: string
}

interface FetchConfig {
	url: string;
	method: "GET" | "POST" | "PUT" | "DELETE";
}

interface ActionParameterField {
	label: string;
	element: "input" | "select" | "textarea" | "checkbox";
	default?: string | number | boolean;
	options?: string[];
	isCredential?: boolean;
	platform?: string;
	fetch?: FetchConfig;
}

interface ActionOperation {
	Parameters: ActionParameterField[];
	Settings?: object
}

type Avail_Actions_Obj = Record<string, Actions_Structure>;

export const Available_Actions: Avail_Actions_Obj = {
	"Telegram": {
		title: "Telegram",
		description: "",
		defaultName: "Send a Chat message",
		parameters: {
			"Send a chat action": {
				"Parameters": [
					{
						label: "Credential to connect with",
						isCredential: true,
						element: "select",
						fetch: {
							url: "/platform/TelegramAPI",
							method: "GET"
						}, // this is a special option which the renderer has to check and add and write the code for it
						//when you click on the "create credentials" -> open the modal using the platform -> "TelegramAPI"
						platform: "TelegramAPI"
					},
					{
						label: "Resource",
						element: "select",
						options: ["Message"],
						default: "Message",
					},
					{
						label: "Operation",
						element: "select",
						options: ["Send Message"],
						default: "Send Message"
					},
					{
						label: "Chat Id",
						element: "input",
						default: "",
					},
					{
						label: "Text",
						element: "input",
						default: ""
					}
				],
				"Settings": {
					"Retry On Fail": [true, false],
					"On Error": {
						"Stop Workflow": "Halt execution and Fail workflow",
						"Continue": "Pass error message as item in regular output",
						"Continue (using error output)": "Pass item to an extra 'error' output"
					}
				}
			}
		},
		icon: "telegram"
	},
	"Gmail": {
		title: "Gmail",
		description: "",
		defaultName: "Send a Gmail",
		parameters: {
			"Send a Gmail": {
				"Parameters": [
					{
						label: "Credential to connect with",
						isCredential: true,
						element: "select",
						fetch: {
							url: "/platform/GmailAccount",
							method: "GET"
						},
						platform: "GmailAccount"
					},
					{
						label: "Resource",
						element: "select",
						options: ["Message"],
						default: "Message",
					},
					{
						label: "Operation",
						element: "select",
						options: ["Send"],
						default: "Send"
					},
					{
						label: "To",
						element: "input",
						default: "",
					},
					{
						label: "Subject",
						element: "input",
						default: ""
					},
					{
						label: "Message",
						element: "textarea",
						default: ""
					}
				]
			}
		},
		icon: "gmail"
	},
	"AI Agent": {
		title: "AI Agent",
		description: "",
		defaultName: "AI Agent",
		parameters: {
			"AI Agent": {
				"Parameters": [
					{
						label: "Credential to connect with",
						isCredential: true,
						element: "select",
						fetch: {
							url: "/platform/LLMApiKey",
							method: "GET"
						},
						platform: "LLMApiKey"
					},
					{
						label: "System Prompt",
						element: "textarea",
						default: ""
					},
					{
						label: "Prompt (User Message)",
						element: "textarea",
						default: ""
					}
				]
			}
		},
		icon: "aiAgent"
	}
}
// TODO: send this file to the packages common folder