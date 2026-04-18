"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield, Search, CheckCircle, XCircle, AlertTriangle,
  QrCode, FileText, MapPin, Calendar, User, Menu, X,
  Mail, Phone, Share2, MessageCircle, Send, ArrowRight,
  Lock, ShieldCheck, ChevronDown, ChevronRight
} from "lucide-react";

// Mock Verified Data
const MOCK_VERIFIED_PROPERTY = {
  id: "PROP-8821-X",
  gpsAddress: "GA-123-4567",
  status: "VERIFIED",
  owner: "Verified Seller (Name Protected)",
  dateRegistered: "12 Jan 2023",
  region: "Greater Accra",
  size: "0.25 Acres",
  lastInspection: "04 Aug 2024",
  documents: ["Title Deed", "Site Plan", "Tax Clearance"]
};

export default function VerifyPropertyPage() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<"idle" | "verified" | "unverified" | "error">("idle");
  const [showReportModal, setShowReportModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I can help you verify a property status instantly. What's the GPS address?" }
  ]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setResult("idle");

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Simple mock logic: if input contains "GA" it's verified, else error
      if (searchInput.toLowerCase().includes("ga") || searchInput.toLowerCase().includes("ma")) {
        setResult("verified");
      } else {
        setResult("error");
      }
    }, 1500);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "I can help you check land status or report a dispute. Please use the verification form above for official checks."
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
              <Link href="/verify" className="text-blue-600 font-medium cursor-pointer">Verify</Link>
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
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 cursor-pointer text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <div className="px-4 py-4 space-y-3">
                <Link href="/search" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Buy/Rent</Link>
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Sell</Link>
                <Link href="/verify" className="block py-2 text-blue-600 font-medium cursor-pointer">Verify</Link>
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

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-grow">
        {/* Hero Search */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <ShieldCheck className="w-4 h-4" /> Government-Backed Verification
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                Is That Land Real?
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Protect yourself from fraud. Enter the property ID or GhanaPostGPS address to instantly verify ownership status and authenticity.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2">
              <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Enter Property ID (e.g. PROP-8821-X) or GPS Address (e.g. GA-123-4567)"
                    className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Verify Now <Search className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-700/50 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer">
                <QrCode className="w-4 h-4" /> Scan QR Code from Deed
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-700/50 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer">
                <FileText className="w-4 h-4" /> Verify Document Serial No.
              </button>
            </div>
          </div>
        </section>

        {/* Verification Results Area */}
        <section className="py-16 bg-white dark:bg-slate-950 min-h-[400px]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              
              {/* Success State */}
              {result === "verified" && (
                <motion.div 
                  key="verified"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xl overflow-hidden"
                >
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 border-b border-emerald-100 dark:border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Property Verified</h2>
                        <p className="text-emerald-600 dark:text-emerald-300 text-sm">This property matches government records.</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">SAFE TO TRANSACT</span>
                  </div>

                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Property Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Property ID:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.id}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">GPS Address:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.gpsAddress}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Size:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.size}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Region:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.region}</span></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Verification Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-emerald-600 font-bold">ACTIVE</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Registered:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.dateRegistered}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Last Inspection:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.lastInspection}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Owner:</span> <span className="font-medium text-slate-900 dark:text-white">{MOCK_VERIFIED_PROPERTY.owner}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Documents on File</h3>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="flex gap-2">
                      {MOCK_VERIFIED_PROPERTY.documents.map((doc, i) => (
                        <span key={i} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {result === "error" && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-xl p-8 text-center"
                >
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Records Found</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    The property ID or GPS address entered does not match any records in the National Land Registry. It may be an invalid code or unregistered land.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left mb-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-bold">Warning: Potential Fraud Risk</p>
                        <p className="mt-1">If a seller provided this ID, exercise extreme caution. They may be misrepresenting the property.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition cursor-pointer"
                  >
                    Report Suspicious Activity
                  </button>
                </motion.div>
              )}

              {/* Initial State */}
              {result === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="max-w-2xl mx-auto">
                    <Shield className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Enter a valid GPS Address or Property ID above</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Verify land before you pay. Ensure the seller has the right to sell and the land is free from disputes.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Confirm Ownership</h4>
                        <p className="text-xs text-slate-500 mt-1">Ensure the seller is the registered owner.</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <MapPin className="w-6 h-6 text-blue-500 mb-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Check Location</h4>
                        <p className="text-xs text-slate-500 mt-1">Verify the GPS coordinates match the physical site.</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Shield className="w-6 h-6 text-amber-500 mb-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">Avoid Litigation</h4>
                        <p className="text-xs text-slate-500 mt-1">Check if the land is flagged for disputes.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Report Discrepancy Modal */}
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Report Fraud / Discrepancy</h3>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition cursor-pointer">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use this form to report suspicious listings or inaccurate property information. Reports are reviewed by the Lands Commission.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Property ID / GPS Address</label>
                    <input type="text" value={searchInput} readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Report</label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                      <option>Seller Identity Mismatch</option>
                      <option>Property Does Not Exist</option>
                      <option>Multiple Sellers for Same Land</option>
                      <option>Encroachment / Boundary Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Evidence</label>
                    <textarea rows={3} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" placeholder="Describe the issue..." />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="anon" className="w-4 h-4 text-blue-600 rounded" />
                    <label htmlFor="anon" className="text-sm text-slate-600 dark:text-slate-400">Submit Anonymously</label>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex gap-3 justify-end">
                  <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">Cancel</button>
                  <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition cursor-pointer">Submit Report</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Share2 className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Share2 className="w-5 h-5" /></a>
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
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"><X className="w-5 h-5" /></button>
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
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type your question..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600" />
                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"><Send className="w-5 h-5" /></button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition cursor-pointer hover:scale-110">
          {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}