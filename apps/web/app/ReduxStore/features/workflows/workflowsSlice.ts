import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Workflow {
  id: number,
  title: string,
  executing: boolean,
  updatedAt: string
}

export interface Credential {
  id: number,
  title: string,
  platform: string,
  createdAt: string,
  data: { name: string }
}

export interface WorkflowsState {
  workflows: Workflow[],
  credentials: Credential[]
}

const initialState: WorkflowsState = {
  workflows: [],
  credentials: []
}

const workflowsSlice = createSlice({
  name: 'workflowsAndCredentials',
  initialState,
  reducers: {
    setWorkflowsAndCredentials: (state, action: PayloadAction<{ workflows: Workflow[], credentials: Credential[] }>) => {
      state.workflows = action.payload.workflows;
      state.credentials = action.payload.credentials;
    },
    removeWorkflowsAndCredentials: (state) => {
      state.workflows = [];
      state.credentials = [];
    },
    addCredential: (state, action: PayloadAction<Credential>) => {
      state.credentials.push(action.payload);
    },
    updateCredential: (state, action: PayloadAction<Credential>) => {
      const index = state.credentials.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.credentials[index] = action.payload;
      }
    },
    deleteCredential: (state, action: PayloadAction<number>) => {
      state.credentials = state.credentials.filter(c => c.id !== action.payload);
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflows.push(action.payload);
    },
    updateWorkflow: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex(w => Number(w.id) === Number(action.payload.id));
      if (index !== -1) {
        state.workflows[index] = { ...state.workflows[index], ...action.payload };
      }
    },
    deleteWorkflow: (state, action: PayloadAction<number | string>) => {
      state.workflows = state.workflows.filter(w => Number(w.id) !== Number(action.payload));
    }
  }
})

export const {
  setWorkflowsAndCredentials,
  removeWorkflowsAndCredentials,
  addCredential,
  updateCredential,
  deleteCredential,
  addWorkflow,
  updateWorkflow,
  deleteWorkflow
} = workflowsSlice.actions;
export default workflowsSlice.reducer;
