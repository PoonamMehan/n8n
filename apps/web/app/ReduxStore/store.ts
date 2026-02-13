import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './features/socket/socketSlice';
import authReducer from "./features/auth/authSlice";
import workflowsAndCredentialReducer from "./features/workflows/workflowsSlice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    auth: authReducer,
    workflow: workflowsAndCredentialReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: ['socket/setSocket'],
        
        ignoredActionPaths: ['payload'],
       
        ignoredPaths: ['socket.socket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;