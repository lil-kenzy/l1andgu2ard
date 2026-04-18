"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Fingerprint, IdCard, Phone, Shield, Eye, EyeOff, Menu, X, Mail } from "lucide-react";
import {
  formatGhanaCard,
  formatGhanaPhone,
  getVerificationContactPreview,
  toBackendGhanaPhone,
  validateGhanaCard,
  validateGhanaPhone,
} from "@/lib/auth/formatting";

type LoginMode = "ghana-card" | "phone" | "email";
type VerificationChannel = "sms" | "email";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") || "buyer";
  const redirectTarget = searchParams.get("redirect");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<LoginMode>("ghana-card");
  const [identifiers, setIdentifiers] = useState<Record<LoginMode, string>>({
    "ghana-card": "",
    phone: "",
    email: "",
  });
  const [password, setPassword] = useState("");
  const [useBiometric, setUseBiometric] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationChannel, setVerificationChannel] = useState<VerificationChannel>("email");
  const [showDeliveryPrompt, setShowDeliveryPrompt] = useState(false);
  const [error, setError] = useState("");

  const identifier = identifiers[mode];

  const placeholder = useMemo(() => {
    if (mode === "ghana-card") return "xxxxxxxxx-x";
    if (mode === "phone") return "024 0000 000";
    return "name@example.com";
  }, [mode]);

  const validateIdentifier = () => {
    if (mode === "ghana-card") {
      return validateGhanaCard(identifier.trim());
    }

    if (mode === "phone") {
      return validateGhanaPhone(identifier.trim());
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  };

  const updateIdentifier = (value: string) => {
    setError("");

    const formattedValue =
      mode === "ghana-card"
        ? formatGhanaCard(value, false)
        : mode === "phone"
        ? formatGhanaPhone(value)
        : value;

    setIdentifiers((prev) => ({ ...prev, [mode]: formattedValue }));
  };

  const resolveVerificationContacts = () => ({
    email: mode === "email" ? identifier.trim() : "",
    phone: mode === "phone" ? identifier.trim() : "",
  });

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateIdentifier()) {
      setError(
        mode === "ghana-card"
          ? "Enter a valid Ghana Card number."
          : mode === "phone"
          ? "Enter a valid Ghana phone number."
          : "Enter a valid email address."
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setVerificationChannel(mode === "phone" ? "sms" : "email");
    setShowDeliveryPrompt(true);
  };

  const handleSendCode = async () => {
    setError("");

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const contacts = resolveVerificationContacts();
    const emailContact = getVerificationContactPreview("email", contacts);
    const smsContact = getVerificationContactPreview("sms", contacts);
    const identifierValue =
      mode === "ghana-card"
        ? formatGhanaCard(identifier.trim())
        : mode === "phone"
        ? toBackendGhanaPhone(identifier.trim()) || identifier.trim()
        : identifier.trim();
    const redirectQuery = redirectTarget && redirectTarget.startsWith("/") ? `&redirect=${encodeURIComponent(redirectTarget)}` : "";
    router.push(
      `/auth/otp?role=${role}&channel=${verificationChannel}&contact=${encodeURIComponent(
        verificationChannel === "email" ? emailContact : smsContact
      )}&emailContact=${encodeURIComponent(emailContact)}&smsContact=${encodeURIComponent(
        smsContact
      )}&identifierType=${mode}&identifier=${encodeURIComponent(identifierValue)}${redirectQuery}`
    );
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

            <div className="hidden lg:flex desktop-nav items-center gap-8">
              <Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Buy/Rent</Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sell</Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Verify</Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Pricing</Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Resources</Link>
              <Link href="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Contact</Link>
              <Link href="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">How It Works</Link>
              <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">About</Link>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/sign-in" className="px-4 py-2 text-blue-600 dark:text-blue-400 transition cursor-pointer font-medium">Sign In</Link>
              <Link href="/auth/role-selection" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium">Get Started</Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden mobile-nav p-2 cursor-pointer text-slate-600 dark:text-slate-300" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden mobile-nav bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <div className="px-4 py-4 space-y-3">
                <Link href="/search" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Buy/Rent</Link>
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Sell</Link>
                <Link href="/verify" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Verify</Link>
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Pricing</Link>
                <Link href="/resources" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Resources</Link>
                <Link href="/contact" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Contact</Link>
                <Link href="/how-it-works" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">How It Works</Link>
                <Link href="/about" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">About</Link>
                <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
                  <Link href="/auth/sign-in" className="block py-2 text-blue-600 dark:text-blue-400 cursor-pointer font-medium">Sign In</Link>
                  <Link href="/auth/role-selection" className="block py-2 bg-blue-600 text-white text-center rounded-lg cursor-pointer font-medium">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl p-7"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Shield className="w-4 h-4" /> Secure Sign In
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 capitalize">Role: {role}</p>
          </div>

          <div className="grid grid-cols-3 rounded-lg bg-slate-100 dark:bg-slate-700 p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode("ghana-card")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                mode === "ghana-card" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <IdCard className="w-4 h-4" /> Ghana Card
            </button>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                mode === "phone" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Phone className="w-4 h-4" /> Phone
            </button>
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                mode === "email" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>

          {!showDeliveryPrompt ? (
            <form className="space-y-4" onSubmit={handleCredentialSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {mode === "ghana-card" ? "Ghana Card Number" : mode === "phone" ? "Phone Number" : "Email Address"}
                </label>
                {mode === "ghana-card" ? (
                  <div className="flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                    <span className="px-3 py-2.5 text-slate-500 dark:text-slate-300 border-r border-slate-300 dark:border-slate-600 font-medium">GHA-</span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => updateIdentifier(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent px-3 py-2.5 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                ) : (
                  <input
                    type={mode === "email" ? "email" : "text"}
                    value={identifier}
                    onChange={(e) => updateIdentifier(e.target.value)}
                    placeholder={placeholder}
                    maxLength={mode === "phone" ? 10 : undefined}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                )}
                {mode === "phone" && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter your 10-digit phone number.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Fingerprint className="w-4 h-4 text-blue-600" />
                  Enable biometric sign in
                </div>
                <button
                  type="button"
                  onClick={() => setUseBiometric((prev) => !prev)}
                  className={`w-11 h-6 rounded-full p-1 transition ${useBiometric ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      useBiometric ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
              >
                Continue to verification
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 p-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Choose how to receive your verification code</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pick SMS or email to receive your code</p>
              </div>

              <div className="grid grid-cols-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                <button
                  type="button"
                  onClick={() => setVerificationChannel("email")}
                  className={`px-3 py-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                    verificationChannel === "email" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationChannel("sms")}
                  className={`px-3 py-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                    verificationChannel === "sms" ? "bg-white dark:bg-slate-900 text-blue-600" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Phone className="w-4 h-4" /> SMS
                </button>
              </div>

              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-slate-700 dark:text-slate-200">
                Your code will be sent to <span className="font-semibold">{getVerificationContactPreview(verificationChannel, resolveVerificationContacts())}</span>.
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeliveryPrompt(false);
                    setIsLoading(false);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
                >
                  {isLoading ? "Sending code..." : "Send code"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href={role === "seller" ? "/auth/register?role=seller" : "/auth/register?role=buyer"} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
              New user? Register
            </Link>
            <Link href={role === "seller" ? "/account-recovery/seller" : "/account-recovery/buyer"} className="text-slate-600 dark:text-slate-300 hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
