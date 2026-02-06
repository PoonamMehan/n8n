'use client'
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BsLightningChargeFill } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import Link from "next/link";

export default function StartAuth() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authHandler = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const authenticatedUser = await fetch('http://localhost:8000/api/v1/auth/startAuth', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const authenticatedUserData = await authenticatedUser.json();
      if (authenticatedUser.ok) {
        console.log("Logged in user response: ", authenticatedUser);
        if (authenticatedUserData.success) {
          console.log("User signed in successfully!");
          toast.success("Check your inbox for the magic link!");
        } else {
          console.log("Something wrong happened on our end: ", authenticatedUser);
          toast.error("Something went wrong, please try again later.");
        }
      } else {
        console.log('Some error occured while logging in the user: ', authenticatedUserData)
        toast.error("Something went wrong, please try again later.");
      }
    } catch (err: any) {
      console.log('Some error occured while logging in the user: ', err.message)
      toast.error("Something went wrong, please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      authHandler();
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
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
        {/* Radial fade for grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_70%)]" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-900/40 via-pink-900/20 to-transparent blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-950/30 to-transparent blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-rose-500/10 via-pink-600/5 to-transparent blur-[150px] rounded-full" />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.8)] transition-shadow">
              <BsLightningChargeFill className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </div>
            <span className="text-2xl font-semibold text-white">FlowBolt</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Subtle glow on card */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-gray-400 text-sm">Enter your email to receive a magic link</p>
            </div>

            {/* Email input */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineMail className="w-5 h-5 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300"
                />
              </div>

              {/* Submit button */}
              <motion.button
                onClick={authHandler}
                disabled={isLoading}
                className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-rose-400 to-pink-500 blur-xl -z-10" />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <BsLightningChargeFill className="w-4 h-4" />
                      Send Magic Link
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Back to home */}
            <Link
              href="/"
              className="block w-full py-3 rounded-xl border border-white/10 text-center text-gray-400 text-sm font-medium hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="text-center text-xs text-gray-600 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  )
}