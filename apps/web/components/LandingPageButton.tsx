'use client';
import { useSelector } from "react-redux";
import { RootState } from "@/app/ReduxStore/store";
import Link from "next/link";

export const LandingPageButton = () => {

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return isLoggedIn ? (
    <>
      <Link href="/home/workflows">Go to Workspace</Link>
    </>
  ) : (
    <>
      <Link href="/start-auth">Get Started</Link>
    </>
  )
}