import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<WebSocket>) => {
      state.socket = action.payload;
      state.isConnected = true;
    },
    disconnectSocket: (state) => {
      if (state.socket) {
        state.socket.close();
      }
      state.socket = null;
      state.isConnected = false;
    },
  },
});

export const { setSocket, disconnectSocket } = socketSlice.actions;
export default socketSlice.reducer;
