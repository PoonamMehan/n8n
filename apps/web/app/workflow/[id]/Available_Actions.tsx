interface Actions_Structure {
    title: string,
    description: string,
    parameters: object,
    icon: string
}

type Avail_Actions_Obj = Record<string, Actions_Structure>;

export const Available_Actions: Avail_Actions_Obj = {
    "Telegram": {
        title: "Telegram",
        description: "",
        parameters: {
            "Send a chat action": {
                "Paramters": {
                    "Credential to connect with": "holds id of the credential from one of the entries in credentials table",
                    "Resource": "Message",
                    "Operation": "Send Message",
                    "Chat Id": "Holds an id",
                    "Text": "Stores text"
                },
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