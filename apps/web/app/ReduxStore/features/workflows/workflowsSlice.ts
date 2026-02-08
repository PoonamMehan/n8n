import { createSlice } from "@reduxjs/toolkit";

interface Workflow{
  id: number,
  title: string,
  executing: boolean,
  updatedAt: 
}
export interface WorkflowsState {
  workflows: ,
  credentials: []
}

const initialState: WorkflowsState = {
  workflows: [],
  credentials: []
}

