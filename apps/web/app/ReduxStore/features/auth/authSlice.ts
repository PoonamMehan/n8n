import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  email: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userId: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<{ userId: string; email: string }>) => {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
    },
    setLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.userId = null;
      state.email = null;
    },
  },
});

export const { setLoggedIn, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
