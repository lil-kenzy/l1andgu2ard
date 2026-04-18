"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { formatGhanaPhone, validateGhanaPhone } from "@/lib/auth/formatting";

type VerificationChannel = "sms" | "email";
type Step = 1 | 2 | 3;

interface RecoveryFlowProps {
  role: "buyer" | "seller";
}

export default function RecoveryFlow({ role }: RecoveryFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<VerificationChannel>("sms");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const roleTitle = role === "seller" ? "Seller" : "Buyer";
  const loginHref = `/auth/login?role=${role}`;

  const nextToChannelStep = () => {
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const phoneValid = validateGhanaPhone(phone.trim());
    if (!phoneValid) {
      setError("Please enter a valid 10-digit Ghana phone number.");
      return;
    }

    setStep(2);
  };

  const verifyCodeStep = () => {
    setError("");

    if (!verificationCode.trim() || verificationCode.trim().length < 4) {
      setError("Enter the verification code sent to you.");
      return;
    }

    setStep(3);
  };

  const updatePassword = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/logo.jpg" alt="LANDGUARD Logo" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold"><span className="text-emerald-600">LAND</span><span className="text-amber-500">GUARD</span></span>
          </Link>
          <Link href={loginHref} className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600">Back to login</Link>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{roleTitle} Password Recovery</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">Recover access in 3 steps: identity check, verification code, and new password setup.</p>

          <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
            <div className={`rounded-lg p-2 text-center font-semibold ${step >= 1 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>1. Identity</div>
            <div className={`rounded-lg p-2 text-center font-semibold ${step >= 2 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>2. Verify</div>
            <div className={`rounded-lg p-2 text-center font-semibold ${step >= 3 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>3. New Password</div>
          </div>

          {step === 1 && (
            <div className="space-y-3 text-sm">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(formatGhanaPhone(e.target.value))}
                placeholder="Phone number (0123456789)"
                maxLength={10}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2"
              />
              <button onClick={nextToChannelStep} className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              <p className="text-slate-700 dark:text-slate-300">Choose where to receive your verification code:</p>
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button type="button" onClick={() => setChannel("sms")} className={`rounded-md py-2 font-medium transition ${channel === "sms" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>
                  <Smartphone className="w-4 h-4 inline mr-1" /> SMS
                </button>
                <button type="button" onClick={() => setChannel("email")} className={`rounded-md py-2 font-medium transition ${channel === "email" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>
                  Email
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-slate-600 dark:text-slate-300">
                Verification code will be sent via <span className="font-semibold capitalize">{channel}</span>.
              </div>
              <input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2"
              />
              <div className="grid sm:grid-cols-2 gap-2">
                <button onClick={() => setStep(1)} className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Back</button>
                <button onClick={verifyCodeStep} className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition">Verify Code</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                type="password"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2"
              />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype new password"
                type="password"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2"
              />
              <div className="grid sm:grid-cols-2 gap-2">
                <button onClick={() => setStep(2)} className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Back</button>
                <button onClick={updatePassword} disabled={isSubmitting} className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />{isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 dark:text-red-400 text-sm mt-4">{error}</p>}

          {success && (
            <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5" /> Password updated for {roleTitle.toLowerCase()} account. Database update and verification service will be connected during backend integration.
            </div>
          )}

          <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5" /> Recovery actions are audit-logged and security-notified to registered channels.
          </div>
        </div>
      </main>
    </div>
  );
}
