"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, Scale, FileText, Globe, Users, 
  ArrowRight, Gavel, BookOpen, CheckCircle2, 
  MapPin, Lock, Activity, Menu, X, Mail, Phone,
  Share2, MessageCircle, Send
} from "lucide-react";

const LEGAL_FRAMEWORK = [
  {
    title: "The 1992 Constitution (Art. 267)",
    desc: "Vests all stool lands in the President on behalf of the people of Ghana, ensuring public trust.",
    icon: Scale
  },
  {
    title: "Lands Act, 2020 (Act 1036)",
    desc: "Mandates the digitization of land records and establishes the Land Use and Spatial Planning Authority.",
    icon: BookOpen
  },
  {
    title: "Data Protection Act, 2012 (Act 843)",
    desc: "Guarantees the privacy and security of all user data, identity documents, and transaction records.",
    icon: Lock
  },
  {
    title: "Ghana Digitalization Agenda",
    desc: "Aligns with the national goal of bringing government services to the digital space for efficiency.",
    icon: Globe
  }
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I'm the LANDGUARD AI Assistant. How can I help you today?" }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        message: "Thank you for your question. I'm here to help you with LANDGUARD. This is a demo response - integrate with your AI backend." 
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
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image 
                src="/img/logo.jpg" 
                alt="LANDGUARD Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-emerald-600 dark:text-emerald-400">LAND</span>
                <span className="text-amber-500 dark:text-amber-400">GUARD</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex desktop-nav items-center gap-8">
              <Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Buy/Rent
              </Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Sell
              </Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Verify
              </Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Pricing
              </Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Resources
              </Link>
              <Link href="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Contact
              </Link>
              <Link href="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                How It Works
              </Link>
              <Link href="/about" className="text-blue-600 font-medium cursor-pointer">
                About
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/sign-in" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
                Sign In
              </Link>
              <Link 
                href="/auth/role-selection" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden mobile-nav p-2 cursor-pointer text-slate-600 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mobile-nav bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="/search" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Buy/Rent
                </Link>
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Sell
                </Link>
                <Link href="/verify" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Verify
                </Link>
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Pricing
                </Link>
                <Link href="/resources" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Resources
                </Link>
                <Link href="/contact" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  Contact
                </Link>
                <Link href="/how-it-works" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
                  How It Works
                </Link>
                <Link href="/about" className="block py-2 text-blue-600 font-medium cursor-pointer">
                  About
                </Link>
                <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
                  <Link href="/auth/sign-in" className="block py-2 text-slate-600 dark:text-slate-300 cursor-pointer font-medium">
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/role-selection" 
                    className="block py-2 bg-blue-600 text-white text-center rounded-lg cursor-pointer font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-grow">
        {/* 1. Cinematic Hero */}
        <section className="relative h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/img/background.jpg" 
              alt="Ghana Landscape" 
              fill 
              priority 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />
          </div>

          <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Government Backed • Legally Enforceable</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                Restoring Trust in<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
                  Ghana's Land Ownership
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                LANDGUARD is the national digital registry built to eliminate fraud, protect property rights, and digitize Ghana's land administration under the strict oversight of the Lands Commission.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. The Problem & Solution */}
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Why LANDGUARD Exists
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">The Challenge</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        For decades, Ghanaians have faced multiple sale of the same land, boundary disputes, and the menace of "land guards." The lack of a unified digital system created opportunities for fraud and legal chaos.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Our Solution</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        A centralized, blockchain-ready platform that uses geospatial mapping (GPS) and government-verified documentation to ensure every parcel is unique, authenticated, and safe to transact.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }}
                className="relative h-96 rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image src="/img/land.jpg" alt="Land Survey" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Verification Standard</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Cross-checked with Lands Commission Database</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Legal Backbone */}
        <section className="py-24 bg-slate-50 dark:bg-slate-800 border-y border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Gavel className="w-4 h-4" /> Legal Compliance
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Built on the Laws of Ghana
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Every transaction and verification on LANDGUARD is backed by the supreme legal framework of the Republic of Ghana.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {LEGAL_FRAMEWORK.map((law, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-emerald-500/30 transition duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center mb-4">
                    <law.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">{law.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{law.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Visual Story / Gallery */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Justice, Technology & Land
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                  Bridging the gap between traditional land ownership and modern digital security. Our platform ensures that every deed, title, and transaction stands up to legal scrutiny.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-start md:justify-end">
                <Link href="/how-it-works" className="group flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition">
                  See How It Works
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gallery Item 1 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
              >
                <Image src="/img/court.jpg" alt="Court" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-bold text-lg">Dispute Resolution</p>
                  <p className="text-sm text-gray-300">Transparent legal trails for every parcel</p>
                </div>
              </motion.div>

              {/* Gallery Item 2 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
              >
                <Image src="/img/lawyers.jpg" alt="Lawyers" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-bold text-lg">Legal Verification</p>
                  <p className="text-sm text-gray-300">Lands Commission officers verify every upload</p>
                </div>
              </motion.div>

               {/* Gallery Item 3 */}
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group md:col-span-2 lg:col-span-1"
              >
                <Image src="/img/background.jpg" alt="Land" fill className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-bold text-lg">Geospatial Mapping</p>
                  <p className="text-sm text-gray-300">Precise boundaries prevent encroachment</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. CTA */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Secure Your Property Rights?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join the national movement towards transparent, secure, and digitally verified land ownership in Ghana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/role-selection"
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Create Verified Account
              </Link>
              <Link 
                href="/verify"
                className="bg-transparent border-2 border-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-white hover:bg-white/10 transition cursor-pointer"
              >
                Verify Existing Land
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Image 
                  src="/img/logo.jpg" 
                  alt="LANDGUARD Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span className="text-xl font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">LAND</span>
                  <span className="text-amber-500 dark:text-amber-400">GUARD</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Ghana's official national land registry platform. Eliminating fraud through verified ownership and transparent transactions.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer">
                  <Users className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/search" className="hover:text-blue-600 cursor-pointer">Buy Property</Link></li>
                <li><Link href="/search?type=rent" className="hover:text-blue-600 cursor-pointer">Rent Property</Link></li>
                <li><Link href="/verify" className="hover:text-blue-600 cursor-pointer">Verify Land</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600 cursor-pointer">Pricing</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-blue-600 cursor-pointer">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-blue-600 cursor-pointer">How It Works</Link></li>
                <li><Link href="/resources" className="hover:text-blue-600 cursor-pointer">Resources</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 cursor-pointer">Contact</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>support@landguard.gov.gh</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>+233 30 200 0000</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Lands Commission HQ, Accra, Ghana</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
              © {new Date().getFullYear()} LANDGUARD. Government of Ghana. All rights reserved.
            </p>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">LANDGUARD Assistant</h3>
                    <p className="text-xs text-blue-100">Online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none shadow"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600 cursor-text"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition cursor-pointer hover:scale-110"
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}