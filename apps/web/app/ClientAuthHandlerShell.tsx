'use client'
import { useDispatch } from "react-redux"
import { AppDispatch } from "./ReduxStore/store"
import { setLoggedIn, setLoggedOut } from "./ReduxStore/features/auth/authSlice"

interface Props {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  children: React.ReactNode;
}

export const ClientAuthHandlerShell = ({ isLoggedIn, userId, username, children }: Props) => {

  const dispatch = useDispatch<AppDispatch>();

  if (isLoggedIn && userId !== null && username !== null) {
    dispatch(setLoggedIn({ userId, username }));
  } else {
    dispatch(setLoggedOut());
  }

  return (<>
    {children}
  </>
  )
}