"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { getClientSession } from "@/lib/auth/session";

export default function SellEntryPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { token: authToken, role } = getClientSession();

    if (!authToken) {
      router.replace("/auth/login?role=seller");
      return;
    }

    if (role === "seller") {
      router.replace("/seller/dashboard");
      return;
    }

    router.replace("/auth/login?role=seller");
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
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
              <Link href="/sell" className="text-blue-600 font-medium cursor-pointer">Sell</Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Verify</Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Pricing</Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Resources</Link>
              <Link href="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Contact</Link>
              <Link href="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">How It Works</Link>
              <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">About</Link>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/sign-in" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sign In</Link>
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
                <Link href="/sell" className="block py-2 text-blue-600 font-medium cursor-pointer">Sell</Link>
                <Link href="/verify" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Verify</Link>
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Pricing</Link>
                <Link href="/resources" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Resources</Link>
                <Link href="/contact" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Contact</Link>
                <Link href="/how-it-works" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">How It Works</Link>
                <Link href="/about" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">About</Link>
                <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
                  <Link href="/auth/sign-in" className="block py-2 text-slate-600 dark:text-slate-300 cursor-pointer font-medium">Sign In</Link>
                  <Link href="/auth/role-selection" className="block py-2 bg-blue-600 text-white text-center rounded-lg cursor-pointer font-medium">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="grow flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Preparing seller workspace...</h1>
          <p className="text-slate-600 dark:text-slate-300">We are checking your account and redirecting you to the right seller page.</p>
        </div>
      </main>
    </div>
  );
}