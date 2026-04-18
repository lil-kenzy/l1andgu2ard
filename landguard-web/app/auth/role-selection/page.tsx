"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, ShieldCheck, UserRound } from "lucide-react";

const roleOptions: {
  role: "buyer" | "seller";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets: string[];
  signUpHref: string;
  signInHref: string;
}[] = [
  {
    role: "buyer",
    title: "Buyer",
    description: "Search and buy verified land or property with confidence.",
    icon: UserRound,
    bullets: ["Verified property listings", "Ownership checks", "Safe transaction flow"],
    signUpHref: "/auth/register?role=buyer",
    signInHref: "/auth/login?role=buyer",
  },
  {
    role: "seller",
    title: "Seller",
    description: "List property, verify documents, and close deals transparently.",
    icon: Briefcase,
    bullets: ["Fast listing process", "Document validation", "Qualified buyer access"],
    signUpHref: "/auth/register?role=seller",
    signInHref: "/auth/login?role=seller",
  },
];

export default function RoleSelectionPage() {
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
              Already have an account?
            </Link>
          </div>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" /> Secure Account Setup
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Choose Account Type</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Continue with one click. Choose Buyer or Seller to create an account or sign in directly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {roleOptions.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="text-left rounded-2xl p-6 border transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={item.signUpHref}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                    >
                      Create {item.title} Account <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={item.signInHref}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      Sign In as {item.title}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
