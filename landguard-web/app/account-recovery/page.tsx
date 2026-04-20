"use client";

import {Suspense,  useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, ShieldCheck, Smartphone, Undo2 } from "lucide-react";

type AccountRole = "buyer" | "seller";
type RecoveryMode = "forgot" | "update";

function AccountRecoveryContent() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") || "buyer").toLowerCase() as AccountRole;
  const [accountRole, setAccountRole] = useState<AccountRole>(initialRole === "seller" ? "seller" : "buyer");
  const [mode, setMode] = useState<RecoveryMode>("forgot");

  const [identifier, setIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidateSessions, setInvalidateSessions] = useState(true);
  const [reset2FA, setReset2FA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const backToLoginHref = useMemo(() => `/auth/login?role=${accountRole}`, [accountRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your email, phone, or Ghana Card number.");
      return;
    }

    if (mode === "forgot" && !recoveryCode.trim()) {
      setError("Please enter the recovery OTP/code sent to your contact.");
      return;
    }

    if (mode === "update" && !currentPassword.trim()) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/logo.jpg" alt="LANDGUARD Logo" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold"><span className="text-emerald-600">LAND</span><span className="text-amber-500">GUARD</span></span>
          </Link>
          <Link href={backToLoginHref} className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600">Back to login</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Recovery & Update</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">For buyers and sellers: recover forgotten access or update your existing password securely.</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Account Type</p>
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 text-sm">
                <button type="button" onClick={() => setAccountRole("buyer")} className={`rounded-md py-2 font-medium transition ${accountRole === "buyer" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>Buyer</button>
                <button type="button" onClick={() => setAccountRole("seller")} className={`rounded-md py-2 font-medium transition ${accountRole === "seller" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>Seller</button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Action</p>
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 text-sm">
                <button type="button" onClick={() => setMode("forgot")} className={`rounded-md py-2 font-medium transition ${mode === "forgot" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>Forgot/Lost</button>
                <button type="button" onClick={() => setMode("update")} className={`rounded-md py-2 font-medium transition ${mode === "update" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"}`}>Update Old</button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm mb-5">
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email, phone, or Ghana Card" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />

            {mode === "forgot" && (
              <input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} placeholder="Recovery OTP / code" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            )}

            {mode === "update" && (
              <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" type="password" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            )}

            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" type="password" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />

            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between">Invalidate all active sessions <input type="checkbox" checked={invalidateSessions} onChange={() => setInvalidateSessions((v) => !v)} /></label>
              <label className="flex items-center justify-between">Reset 2FA setup <input type="checkbox" checked={reset2FA} onChange={() => setReset2FA((v) => !v)} /></label>
            </div>

            {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

            {success ? (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5" /> Password action submitted successfully for {accountRole}. Backend verification and persistence will be wired in the next phase.
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-2 text-sm pt-1">
              <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70"><KeyRound className="w-4 h-4" />{isSubmitting ? "Processing..." : "Create New Password"}</button>
              <button type="button" className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Smartphone className="w-4 h-4" />Re-setup 2FA</button>
            </div>
          </form>

          <div className="mt-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5" /> Recovery actions are logged and security-notified to registered channels.
          </div>

          <Link href={backToLoginHref} className="mt-4 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
            <Undo2 className="w-4 h-4" />Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AccountRecoveryPage() {
  return (
    <Suspense>
      <AccountRecoveryContent />
    </Suspense>
  );
}
