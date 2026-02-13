import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  isLoggedIn: boolean | null;
  isLoading: boolean | null;
  userId: string | null;
  email: string | null;
}

const initialState: AuthState = {
  isLoggedIn: null,
  isLoading: true,
  userId: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<{ userId: string; email: string }>) => {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
    },
    setLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.userId = null;
      state.email = null;
    },
  },
});

export const { setLoggedIn, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
