'use client';
import Link from "next/link";
import { BsLightningChargeFill, BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { HiArrowRight } from "react-icons/hi";
import { useSelector } from "react-redux";
import type { RootState } from "../ReduxStore/store";
import { useSearchParams } from "next/navigation";

export function VerifyAuth() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const authState = useSelector((state: RootState) => state.auth.isLoggedIn);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const isSuccess = success === "true" && authState && !isLoading;
  const isFailed = !isLoading && !isSuccess;

  const gradientTheme = isLoading || isSuccess ? 'rose' : 'red';

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_70%)]" />
      </div>

      <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${gradientTheme === 'rose' ? 'bg-gradient-to-bl from-rose-900/40 via-pink-900/20' : 'bg-gradient-to-bl from-red-900/40 via-red-900/20'} to-transparent blur-[120px]`} />
      <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${gradientTheme === 'rose' ? 'bg-gradient-to-tr from-rose-950/30' : 'bg-gradient-to-tr from-red-950/30'} to-transparent blur-[100px]`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${gradientTheme === 'rose' ? 'bg-gradient-to-b from-rose-500/10 via-pink-600/5' : 'bg-gradient-to-b from-red-500/10 via-red-600/5'} to-transparent blur-[150px] rounded-full`} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.8)] transition-shadow">
              <BsLightningChargeFill className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </div>
            <span className="text-2xl font-semibold text-white">FlowBolt</span>
          </Link>
        </div>

        <div className="relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className={`absolute inset-0 rounded-2xl ${gradientTheme === 'rose' ? 'bg-gradient-to-b from-rose-500/5' : 'bg-gradient-to-b from-red-500/5'} to-transparent pointer-events-none`} />

          <div className="relative z-10">

            {isLoading && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30">
                    <div className="w-10 h-10 rounded-full border-[3px] border-rose-500/20 border-t-rose-400 animate-spin" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-3">Verifying...</h1>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Hang tight, we're confirming your session.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" style={{ animationDelay: '600ms' }} />
                  </div>
                </div>
              </>
            )}

            {isSuccess && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30">
                    <BsCheckCircleFill className="w-10 h-10 text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-3">You're all set!</h1>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Welcome back! You've been successfully authenticated. Click below to access your workspace.
                  </p>
                </div>
                <Link
                  href="/home/workflows"
                  className="group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Workspace
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </>
            )}

            {isFailed && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
                    <BsXCircleFill className="w-10 h-10 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-3">Link Expired</h1>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This magic link has expired or is invalid. Please request a new one to continue.
                  </p>
                </div>
                <Link
                  href="/start-auth"
                  className="group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 bg-white/10 border border-white/10 text-white hover:bg-white/15 hover:border-white/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <BsLightningChargeFill className="w-4 h-4" />
                    Try Again
                  </span>
                </Link>
              </>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Need help? Contact support@flowbolt.app
        </p>
      </div>
    </div>
  )
}
