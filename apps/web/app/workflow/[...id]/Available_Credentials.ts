export interface Credentials_Structure {
    title: string,
    description: string,
    parameters: CredentialParameterField[],
    icon: string,
    defaultName: string
} //we might not need this 

type Avail_Credentials_Obj = Record<string, Credentials_Structure>;

export interface Credential_DbTable_Structure {
  id: number,
  title: string, //the actual name to be shown on the top
  platform: string, //the name given by the node forms to find the credential 
  data: Record<string, any>   //have description as one of the keys
}

export interface CredentialParameterField{
  label: string,
  element: "input" | "select",
  default: string,
  readOnly?: boolean
}

export const Available_Credential_Apps: Avail_Credentials_Obj = {
    TelegramAPI: {                // this key is given by AvailableActions.parameter.platform
      description: "",
      title: "Telegram API",
      defaultName: "Telegram Account",
      parameters: [
        { 
          label: "Access Token",
          element: "input",
          default: ""
        },
        {
          label: "BaseURL",
          element: "input",
          default: "https://api.telegram.org",
          readOnly: true
        }
      ],
      icon: "telegram"
    },
    BasicAuth: {
        title: "Basic Auth",
        description: "",
        parameters: [
          {
            label: "User",
            element: "input",
            default: ""
          },
          {
            label: "Password",
            element: "input",
            default: ""
          },
          {
            label: "Allowed HTTP request domains",
            element: "input",
            default: ""
          }   
        ],
        defaultName: "Basic Auth Credential",
        icon: ""
    },
    JWTAuth: {
        title: "JWT Auth Account",
        description: "",
        parameters: [
            // KeyType: ["Passphrase", "PEM Key"],
            // IfPassphrase: {"Secret": "Contains the secret", "Algorithm": "HS256"},
            // IfPEMKey: {"Public Key": "Contains public key", "Private Key": "Contains Private key", "Algorithm": "RS256"}
        ],
        defaultName: "JWT Auth account",
        icon: ""
    }
}