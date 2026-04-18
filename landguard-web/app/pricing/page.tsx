"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Check, X, Star, Zap, Shield, Users, Globe, Award,
  Menu, X as XIcon, ArrowRight, Phone, Mail, MapPin,
  MessageCircle, Send, ChevronDown, ChevronRight
} from "lucide-react";

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I can help you understand our pricing and how LANDGUARD works. What would you like to know?" }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "Our pricing is simple: we only charge 2% when your land transaction is successful. No listing fees, no browsing fees, no hidden costs."
      }]);
    }, 1000);
    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">

      {/* ========== NAVBAR ========== */}
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
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Buy/Rent</Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sell</Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Verify</Link>
              <Link href="/pricing" className="text-blue-600 font-medium cursor-pointer">Pricing</Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Resources</Link>
              <Link href="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Contact</Link>
              <Link href="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">How It Works</Link>
              <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">About</Link>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/sign-in" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sign In</Link>
              <Link href="/auth/role-selection" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium">Get Started</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 cursor-pointer text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <div className="px-4 py-4 space-y-3">
                <Link href="/search" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Buy/Rent</Link>
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Sell</Link>
                <Link href="/verify" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Verify</Link>
                <Link href="/pricing" className="block py-2 text-blue-600 font-medium cursor-pointer">Pricing</Link>
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

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" /> Transparent Pricing
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                Only Pay When You
                <span className="text-emerald-600 dark:text-emerald-400"> Succeed</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                No listing fees. No browsing fees. No hidden costs. We only earn when your land transaction is successful.
              </p>
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">2%</div>
                <div className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Success Fee</div>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Charged only when you complete a verified land transaction
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How Our Pricing Works</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Simple, fair, and aligned with your success. We only profit when you do.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Find a Property</h3>
                <p className="text-slate-600 dark:text-slate-300">Browse verified listings, verify ownership, and agree on price with the seller.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Complete Transaction</h3>
                <p className="text-slate-600 dark:text-slate-300">Transfer ownership through our secure platform with government verification.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pay Success Fee</h3>
                <p className="text-slate-600 dark:text-slate-300">Only then do we charge our 2% service fee for facilitating the secure transaction.</p>
              </motion.div>
            </div>

            {/* Example Calculator */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Example Calculation</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">₵10,000</div>
                  <div className="text-slate-600 dark:text-slate-300">Property Price</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">₵200</div>
                  <div className="text-slate-600 dark:text-slate-300">LANDGUARD Fee (2%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">₵9,800</div>
                  <div className="text-slate-600 dark:text-slate-300">You Keep</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What the Fee Covers */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">What Your 2% Fee Covers</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Comprehensive protection and services that eliminate land fraud in Ghana
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ownership Verification</h3>
                <p className="text-slate-600 dark:text-slate-300">Government-backed verification of land ownership and title documents.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Fraud Detection</h3>
                <p className="text-slate-600 dark:text-slate-300">AI-powered systems to detect duplicate listings and suspicious activity.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Users className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secure Transactions</h3>
                <p className="text-slate-600 dark:text-slate-300">Escrow services and secure payment processing for land transfers.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Award className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Legal Documentation</h3>
                <p className="text-slate-600 dark:text-slate-300">Automated generation of legally binding transfer documents.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Star className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Platform Maintenance</h3>
                <p className="text-slate-600 dark:text-slate-300">Continuous updates, security patches, and customer support.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <Zap className="w-10 h-10 text-red-600 dark:text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Real-time Monitoring</h3>
                <p className="text-slate-600 dark:text-slate-300">24/7 monitoring of transactions and instant fraud alerts.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Transparency Statement */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12 border border-emerald-200 dark:border-slate-700">
              <Shield className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Transparency Statement</h2>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">What We Charge</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />2% success fee on completed transactions</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />No listing fees for sellers</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />No browsing fees for buyers</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />No hidden costs or surprises</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">What We Don't Charge</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" />Monthly subscription fees</li>
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" />Premium listing upgrades</li>
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" />Document verification fees</li>
                    <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" />Failed transaction fees</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-emerald-200 dark:border-slate-600">
                <p className="text-lg text-slate-700 dark:text-slate-300">
                  <strong>Our Promise:</strong> If you don't successfully complete a verified land transaction through LANDGUARD, you pay us nothing. Zero. Zilch. Nada.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Buy or Sell Land Safely?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of Ghanaians who trust LANDGUARD for secure, verified land transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/role-selection" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition cursor-pointer">
                  Get Started Free <ArrowRight className="w-5 h-5 inline ml-2" />
                </Link>
                <Link href="/verify" className="px-8 py-4 bg-blue-500/20 text-white border border-white/30 rounded-xl font-bold hover:bg-blue-500/30 transition cursor-pointer">
                  Verify a Property First
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Image src="/img/logo.jpg" alt="LANDGUARD Logo" width={32} height={32} className="object-contain" />
                <span className="text-xl font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">LAND</span>
                  <span className="text-amber-500 dark:text-amber-400">GUARD</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Ghana's official national land registry platform. Eliminating fraud through verified ownership and transparent transactions.</p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Globe className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Globe className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/search" className="hover:text-blue-600 cursor-pointer">Buy Property</Link></li>
                <li><Link href="/search?type=rent" className="hover:text-blue-600 cursor-pointer">Rent Property</Link></li>
                <li><Link href="/verify" className="hover:text-blue-600 cursor-pointer">Verify Land</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600 cursor-pointer">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-blue-600 cursor-pointer">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-blue-600 cursor-pointer">How It Works</Link></li>
                <li><Link href="/resources" className="hover:text-blue-600 cursor-pointer">Resources</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 cursor-pointer">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /> support@landguard.gov.gh</li>
                <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" /> +233 30 200 0000</li>
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Lands Commission HQ, Accra, Ghana</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">© {new Date().getFullYear()} LANDGUARD. Government of Ghana. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/legal/privacy" className="hover:text-blue-600 cursor-pointer">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-blue-600 cursor-pointer">Terms of Service</Link>
              <Link href="/legal/compliance" className="hover:text-blue-600 cursor-pointer">Compliance</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="mb-4 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                  <div><h3 className="font-semibold">LANDGUARD Assistant</h3><p className="text-xs text-blue-100">Online</p></div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"><XIcon className="w-5 h-5" /></button>
              </div>
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none shadow"}`}>{msg.message}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Ask about pricing..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600" />
                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"><Send className="w-5 h-5" /></button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition cursor-pointer hover:scale-110">
          {chatOpen ? <XIcon className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}