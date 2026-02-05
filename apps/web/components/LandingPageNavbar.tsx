'use client';

import { useSelector } from "react-redux";
import { RootState } from "@/app/ReduxStore/store";
import { LandingPageLoggedIn } from "./LandingPageLoggedIn";
import { LandingPageLoggedOut } from "./LandingPageLoggedOut";

export const LandingPageNavbar = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn ? (
    <>
      <div>
        <LandingPageLoggedIn />
      </div>
    </>
  ) : (
    <>
      <div>
        <LandingPageLoggedOut />
      </div>
    </>
  )
}