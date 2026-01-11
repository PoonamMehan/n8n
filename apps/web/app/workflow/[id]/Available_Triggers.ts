interface Triggers_Structure {
    title: string,
    description: string,
    parameters: object,
    icon: string,
    defaultName: string
}

type Avail_Triggers_Obj = Record<string, Triggers_Structure>;

// object containing the Available triggers
export const Available_Triggers: Avail_Triggers_Obj = {
    "Webhook": {
        title: "Webhook",
        defaultName: "Webhook",
        description: "Starts the workflow when a webhook is called",
        parameters: {
            "Production URL": "Stores URL string",
            "HTTP Method": ['GET', 'POST', 'PUT'],
            "Path": "Mixture of numbers & characters",
            "Authentication": ["Basic Auth", "JWT Auth", "None"],
            "Options": {
                "Response Code": {
                    200: "OK - Request has succeeded",
                    201: "Created - Request has been fulfilled",
                    301: "Moved permanently - Request resource moved permanently",
                    302: "Found - Request resource moved temporarily",
                    400: "Bad Request - Request resource moved tempotatily",
                    401: "Unauthorized - Request requires user authentication",
                    404: "Not Found - Server has not found a match"
                }, 
                "No Response Body": ["true", "false"],
                "Response Data": "Use res.send() and send any data user gives here, as .send() can handle any kind of data and implicitly adds the corresponding header in the response after automatically identifying the data type.",
                "Allowed Origins (CORS)": "User gives Allowed Origins",
                "Response Headers": ["Name", "Value"]
            }
        },
        icon: "webhook"
    }
}

// should we make the Path of webhook unique, exclusive for one webhook only? 