interface Credentials_Structure {
    title: string,
    description: string,
    parameters: object
}

type Avail_Credentials_Obj = Record<string, Credentials_Structure>;

const Available_Credential_Apps: Avail_Credentials_Obj = {
    "Telegram API": {
        title: "Telegram Account",
        description: "",
        parameters: {
            "Access Token": "String",
            "Base URL": "https://api.telegram.org"
        }
    },
    "Basic Auth": {
        title: "Basic Auth",
        description: "",
        parameters: {
            User: "Contains Username",
            Password: "Password",
            "Allowed HTTP request domains": {"All": "Allow all requests","Specific Domains": "Restrict request to specific domains", "None": "Block all requests"}
        }
    },
    "JWT Auth": {
        title: "JWT Auth Account",
        description: "",
        parameters: {
            "Key Type": ["Passphrase", "PEM Key"],
            "If Passphrase": {"Secret": "Contains the secret", "Algorithm": "HS256"},
            "If PEM Key": {"Public Key": "Contains public key", "Private Key": "Contains Private key", "Algorithm": "RS256"}
        }
    }
}