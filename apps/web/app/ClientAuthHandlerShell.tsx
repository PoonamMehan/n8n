'use client'
import { useDispatch } from "react-redux"
import { AppDispatch } from "./ReduxStore/store"
import { setLoggedIn, setLoggedOut } from "./ReduxStore/features/auth/authSlice"

interface Props {
  isLoggedIn: boolean;
  userId: string | null;
  email: string | null;
  children: React.ReactNode;
}

export const ClientAuthHandlerShell = ({ isLoggedIn, userId, email, children }: Props) => {

  const dispatch = useDispatch<AppDispatch>();

  if (isLoggedIn && userId !== null && email !== null) {
    dispatch(setLoggedIn({ userId, email }));
  } else {
    dispatch(setLoggedOut());
  }

  return (<>
    {children}
  </>
  )
}