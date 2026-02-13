import { Suspense } from "react";
import Link from "next/link";
import { BsLightningChargeFill } from "react-icons/bs";
import { VerifyAuth } from "./VerifyAuthClient";

function LoadingFallback() {
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

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-900/40 via-pink-900/20 to-transparent blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-950/30 to-transparent blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-rose-500/10 via-pink-600/5 to-transparent blur-[150px] rounded-full" />

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
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
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
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Need help? Contact support@flowbolt.app
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyAuth />
    </Suspense>
  );
}