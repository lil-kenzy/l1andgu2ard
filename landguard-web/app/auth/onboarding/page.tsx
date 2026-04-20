"use client";

import {Suspense,  useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPinned, Shield, Sparkles, UserRoundCheck } from "lucide-react";
import { getRoleHome, normalizeRole } from "@/lib/auth/session";

const tutorialSteps = [
  {
    id: 1,
    title: "Map verification demo",
    description: "Visualize land boundaries and confirm verified ownership markers before any payment.",
    icon: MapPinned,
  },
  {
    id: 2,
    title: "Feature walkthrough",
    description: "Use fraud alerts, document checks, and ownership timeline tools to reduce risk.",
    icon: Shield,
  },
  {
    id: 3,
    title: "Ready to start",
    description: "Finish onboarding and continue to your dashboard experience tailored to your role.",
    icon: UserRoundCheck,
  },
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "buyer";
  const next = searchParams.get("next");
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const progress = useMemo(() => ((currentStep + 1) / tutorialSteps.length) * 100, [currentStep]);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, tutorialSteps.length - 1));
  const previous = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const dashboardHref = next && next.startsWith("/") ? next : getRoleHome(normalizeRole(role));

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
            <Link href={dashboardHref} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
              Skip tutorial
            </Link>
          </div>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" /> Interactive Onboarding
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome to LANDGUARD</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 capitalize mb-4">Account role: {role}</p>

            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-between">
              <button
                type="button"
                onClick={previous}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {currentStep < tutorialSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
                >
                  Finish <CheckCircle2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Map Demo</h3>
            <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-linear-to-br from-emerald-100 via-blue-100 to-slate-100 dark:from-emerald-950/40 dark:via-blue-950/30 dark:to-slate-900">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

              <div className="absolute top-14 left-16 bg-emerald-600 text-white text-xs px-2 py-1 rounded-md shadow">Verified Parcel</div>
              <div className="absolute bottom-16 right-10 bg-amber-500 text-white text-xs px-2 py-1 rounded-md shadow">Pending Review</div>

              <div className="absolute left-24 top-24 w-32 h-24 border-2 border-emerald-600 rounded-md bg-emerald-500/20" />
              <div className="absolute right-20 bottom-20 w-28 h-20 border-2 border-amber-500 rounded-md bg-amber-400/20" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Green markers show verified government records
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Orange markers indicate listings awaiting full checks
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
