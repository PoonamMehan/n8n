import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Workflow{
  id: number,
  title: string,
  executing: boolean,
  updatedAt: string
}

export interface Credential{
  id: number,
  title: string,
  platform: string,
  createdAt: string,
  data: {name: string}
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
    setWorkflowsAndCredentials: (state, action: PayloadAction<{workflows: Workflow[], credentials: Credential[]}> ) => {
      state.workflows = action.payload.workflows;
      state.credentials = action.payload.credentials;
    },
    removeWorkflowsAndCredentials: (state) => {
      state.workflows = [];
      state.credentials = [];
    }
  }
})

export const { setWorkflowsAndCredentials, removeWorkflowsAndCredentials } = workflowsSlice.actions;
export default workflowsSlice.reducer;
