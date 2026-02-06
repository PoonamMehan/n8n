import Link from "next/link";
import { BsLightningChargeFill, BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { HiArrowRight } from "react-icons/hi";

export default async function VerifyAuth({ searchParams }: { searchParams: Promise<{ success: string }> }) {
  const success = (await searchParams).success;
  const isSuccess = success === "true";

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
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

      {/* Gradient orbs */}
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${isSuccess ? 'bg-gradient-to-bl from-rose-900/40 via-pink-900/20' : 'bg-gradient-to-bl from-red-900/40 via-red-900/20'} to-transparent blur-[120px]`} />
      <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${isSuccess ? 'bg-gradient-to-tr from-rose-950/30' : 'bg-gradient-to-tr from-red-950/30'} to-transparent blur-[100px]`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${isSuccess ? 'bg-gradient-to-b from-rose-500/10 via-pink-600/5' : 'bg-gradient-to-b from-red-500/10 via-red-600/5'} to-transparent blur-[150px] rounded-full`} />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.8)] transition-shadow">
              <BsLightningChargeFill className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </div>
            <span className="text-2xl font-semibold text-white">FlowBolt</span>
          </Link>
        </div>

        {/* Card */}
        <div className="relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl">
          {/* Subtle glow on card */}
          <div className={`absolute inset-0 rounded-2xl ${isSuccess ? 'bg-gradient-to-b from-rose-500/5' : 'bg-gradient-to-b from-red-500/5'} to-transparent pointer-events-none`} />

          <div className="relative z-10">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuccess
                ? 'bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30'
                : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30'
                }`}>
                {isSuccess ? (
                  <BsCheckCircleFill className="w-10 h-10 text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                ) : (
                  <BsXCircleFill className="w-10 h-10 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                )}
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-3">
                {isSuccess ? "You're all set!" : "Link Expired"}
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                {isSuccess
                  ? "Welcome back! You've been successfully authenticated. Click below to access your workspace."
                  : "This magic link has expired or is invalid. Please request a new one to continue."}
              </p>
            </div>

            {/* Action button */}
            <Link
              href={isSuccess ? "/home/workflows" : "/start-auth"}
              className={`group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 ${isSuccess
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                : 'bg-white/10 border border-white/10 text-white hover:bg-white/15 hover:border-white/20'
                }`}
            >
              {/* Shimmer effect for success */}
              {isSuccess && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}

              <span className="relative z-10 flex items-center gap-2">
                {isSuccess ? (
                  <>
                    Go to Workspace
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <BsLightningChargeFill className="w-4 h-4" />
                    Try Again
                  </>
                )}
              </span>
            </Link>

            {/* Secondary link */}
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

        {/* Footer text */}
        <p className="text-center text-xs text-gray-600 mt-8">
          Need help? Contact support@flowbolt.app
        </p>
      </div>
    </div>
  )
}