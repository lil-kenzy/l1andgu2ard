"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  formatGhanaCard,
  formatGhanaPhone,
  toBackendGhanaPhone,
  validateGhanaCard,
  validateGhanaPhone,
} from "@/lib/auth/formatting";

type Step = 1 | 2 | 3;

const regions = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Northern",
  "Volta",
  "Bono",
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "buyer";

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingCard, setIsValidatingCard] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    ghanaCard: "",
    password: "",
    confirmPassword: "",
    region: "",
    district: "",
    referralCode: "",
    termsAccepted: false,
  });

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.ghanaCard.trim()) {
      return "Please complete all required fields.";
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Enter a valid email address.";
    }
     if (!validateGhanaPhone(formData.phone.trim())) {
      return "Enter a valid Ghana phone number.";
    }
     if (!validateGhanaCard(formData.ghanaCard.trim())) {
      return "Ghana Card must match format GHA-123456789-1.";
    }
    return "";
  };

  const validateStep2 = () => {
    if (formData.password.length < 8) return "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    if (!formData.termsAccepted) return "You must accept the terms to continue.";
    return "";
  };

  const validateStep3 = () => {
    if (!formData.region) return "Please select your region.";
    if (!formData.district.trim()) return "Please provide your district.";
    return "";
  };

  const handleNext = async () => {
    setError("");

    if (step === 1) {
      const stepError = validateStep1();
      if (stepError) {
        setError(stepError);
        return;
      }

      setIsValidatingCard(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsValidatingCard(false);
      setStep(2);
      return;
    }

    if (step === 2) {
      const stepError = validateStep2();
      if (stepError) {
        setError(stepError);
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const stepError = validateStep3();
    if (stepError) {
      setError(stepError);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    router.push(
      `/auth/otp?role=${role}&channel=email&contact=${encodeURIComponent(
        formData.email
      )}&emailContact=${encodeURIComponent(formData.email)}&smsContact=${encodeURIComponent(formData.phone)}&phoneForBackend=${encodeURIComponent(
        toBackendGhanaPhone(formData.phone)
      )}`
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
            <Link href="/auth/sign-in" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
              Already registered?
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="max-w-2xl w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 sm:p-7"
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <ShieldCheck className="w-4 h-4" /> Multi-step Registration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white capitalize">Create {role} account</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Complete your profile to start secure property transactions.</p>
            <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Step {step} of 3</p>
          </div>

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="0123456789"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", formatGhanaPhone(e.target.value))}
                  maxLength={10}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter a 10-digit local number. The backend will store it as +233 without showing that change here.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ghana Card Number</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="px-3 py-2.5 text-slate-500 dark:text-slate-300 border-r border-slate-300 dark:border-slate-600 font-medium">GHA-</span>
                  <input
                    type="text"
                    placeholder="123456789-1"
                    value={formData.ghanaCard}
                    onChange={(e) => updateField("ghanaCard", formatGhanaCard(e.target.value, false))}
                    className="w-full bg-transparent px-3 py-2.5 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Type only the numbers. The dashes are added automatically and the GHA prefix stays in place.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Create Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => updateField("termsAccepted", e.target.checked)}
                  className="mt-1"
                />
                I agree to LANDGUARD terms, privacy policy, and identity verification checks.
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => updateField("referralCode", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Ghana Card validation completed. Continue to OTP verification.
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 1 ? router.push("/auth/role-selection") : setStep((prev) => (prev - 1) as Step))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isValidatingCard}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
              >
                {isValidatingCard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Validating Card...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Verify via OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.form>
      </main>
    </div>
  );
}
