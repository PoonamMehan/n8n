interface Actions_Structure {
    title: string,
    description: string,
    defaultName: string,
    parameters: object,
    icon: string
}

type Avail_Actions_Obj = Record<string, Actions_Structure>;

export const Available_Actions: Avail_Actions_Obj = {
    "Telegram": {

			title: "Telegram",
			description: "",
			defaultName: "Send a Chat message",
			parameters: {
				"Send a chat action": {
					"Paramters": [
						{
							label: "Credential to connect with",
							isCredential: true,
							element: "select",
							fetch: {
								url: "http://localhost:8000/api/v1/credential/platform/TelegramAPI",
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
}
// TODO: send this file to the packages common folder 

// 