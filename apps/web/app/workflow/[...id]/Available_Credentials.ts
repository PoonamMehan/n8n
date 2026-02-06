export interface Credentials_Structure {
  title: string,
  description: string,
  parameters: CredentialParameterField[],
  icon: string,
  defaultName: string
} //we might not need this 

export type Avail_Credentials_Obj = Record<string, Credentials_Structure>;

export interface Credential_DbTable_Structure {
  title: string, //the actual name to be shown on the top
  platform: string, //the name given by the node forms to find the credential 
  data: Record<string, any>   //have description as one of the keys
}

export interface CredentialParameterField {
  label: string,
  element: "input" | "select" | "button",
  default: string,
  readOnly?: boolean,
  options?: string[],
  icon?: string
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
  GmailAccount: {
    title: "Gmail Account",
    description: "",
    defaultName: "Gmail Account",
    parameters: [
      // {
      //   label: "Allowed HTTP request domains",
      //   element: "select",
      //   options: ["All"],
      //   default: "All"
      // },
      {
        label: "Sign in with Google",
        element: "button",
        default: "",
        icon: "google"
      }
    ],
    icon: "gmail"
  },
  LLMApiKey: {
    title: "LLM API Key",
    description: "",
    defaultName: "LLM API Key",
    parameters: [
      {
        label: "API Key",
        element: "input",
        default: ""
      }
    ],
    icon: "aiAgent"
  }
}