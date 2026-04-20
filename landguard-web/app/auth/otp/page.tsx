"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Mail, RotateCcw, Shield, Smartphone } from "lucide-react";
import { getRoleHome, normalizeRole, setClientSession } from "@/lib/auth/session";

type Channel = "sms" | "email";

function OTPVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") || "buyer";
  const redirectTarget = searchParams.get("redirect");
  const initialChannel = (searchParams.get("channel") as Channel) || "email";
  const fallbackContact = searchParams.get("contact") || "your registered email address";
  const emailContact = searchParams.get("emailContact") || (initialChannel === "email" ? fallbackContact : "your registered email address");
  const smsContact = searchParams.get("smsContact") || (initialChannel === "sms" ? fallbackContact : "your registered phone number");

  const [channel, setChannel] = useState<Channel>(initialChannel);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canResend = resendTimer <= 0;
  const activeContact = channel === "email" ? emailContact : smsContact;

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    setError("");
    setResendTimer(30);
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setClientSession(role);

    if (redirectTarget && redirectTarget.startsWith("/")) {
      router.push(redirectTarget);
      return;
    }

    router.push(`/auth/onboarding?role=${role}&next=${encodeURIComponent(getRoleHome(normalizeRole(role)))}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image src="/img/logo.jpg" alt="LANDGUARD Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-emerald-600 dark:text-emerald-400">LAND</span>
                <span className="text-amber-500 dark:text-amber-400">GUARD</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-7"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Shield className="w-4 h-4" /> OTP Verification
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your account</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 capitalize">Role: {role}</p>
          </div>

          <div className="grid grid-cols-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1 mb-5">
            <button
              type="button"
              onClick={() => setChannel("email")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                channel === "email" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setChannel("sms")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                channel === "sms" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Smartphone className="w-4 h-4" /> SMS
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-5">
            We sent a 6-digit code via <span className="font-semibold capitalize">{channel}</span> to
            <br />
            <span className="font-semibold text-slate-900 dark:text-white">{activeContact}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-12 text-center text-lg font-semibold bg-slate-50 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-5 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                <RotateCcw className="w-4 h-4" /> Resend code
              </button>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" /> Resend in {resendTimer}s
              </p>
            )}
          </div>

          <p className="mt-5 text-xs text-center text-slate-500 dark:text-slate-400">
            Code expires in 10 minutes. Never share your OTP with anyone.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense>
      <OTPVerificationContent />
    </Suspense>
  );
}
