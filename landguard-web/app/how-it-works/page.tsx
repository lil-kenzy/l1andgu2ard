"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, Search, FileCheck, MessageCircle, CheckCircle, 
  MapPin, Upload, Clock, Play, ChevronDown, Search as SearchIcon,
  Menu, X, Mail, Phone, MapPin as MapPinIcon, ArrowRight,
  UserCheck, CreditCard, LayoutDashboard, Share2, Globe, Send
} from "lucide-react";

const BUYER_STEPS = [
  { step: 1, icon: Shield, title: "Register & Verify Identity", desc: "Sign up with your Ghana Card. Complete SMS OTP & biometric setup in under 2 minutes." },
  { step: 2, icon: MapPin, title: "Browse & Explore Map", desc: "Search verified lands by region, GPS address, or price. Use interactive filters to find exactly what you need." },
  { step: 3, icon: Search, title: "Verify Ownership Status", desc: "View government-verified titles, boundary maps, and document previews. Zero guesswork, zero fraud." },
  { step: 4, icon: MessageCircle, title: "Contact & Transact Securely", desc: "Message verified sellers, schedule site visits, and complete transactions with our secure tracking system." },
];

const SELLER_STEPS = [
  { step: 1, icon: Upload, title: "Register & Upload Documents", desc: "Submit your Land Title, Site Plan, Ghana Card, and Consent Letters. All files are encrypted and stored securely." },
  { step: 2, icon: Clock, title: "Admin Verification (72h SLA)", desc: "Lands Commission officers review your documents. You'll get a real-time status update: Pending, Approved, or Rejected." },
  { step: 3, icon: LayoutDashboard, title: "List & Draw Boundaries", desc: "Once verified, list your property. Draw exact boundaries on the map or auto-fill using your GhanaPostGPS address." },
  { step: 4, icon: CreditCard, title: "Manage Offers & Close Sale", desc: "Receive inquiries, negotiate securely, and mark as 'Sold' only after successful transaction & fee verification." },
];

const VIDEOS = [
  { title: "How to Buy Your First Property", duration: "5:15", tag: "Buyer Guide", videoId: "dQw4w9WgXcQ", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { title: "Seller Onboarding & Document Upload", duration: "2:58", tag: "Seller Guide", videoId: "eY52Zsg-KVI", url: "https://www.youtube.com/watch?v=eY52Zsg-KVI" },
  { title: "Using the Interactive Map Explorer", duration: "2:58", tag: "Platform Tutorial", videoId: "9bZkp7q19f0", url: "https://www.youtube.com/watch?v=9bZkp7q19f0" },
];

const FAQS = [
  { q: "How long does seller verification take?", a: "The Lands Commission verification process takes a maximum of 72 hours. You'll receive real-time SMS and in-app notifications for status updates." },
  { q: "Is LANDGUARD free to browse?", a: "Yes! Browsing, searching, and contacting sellers is completely free. We only charge a transparent 2% success fee when a transaction is successfully completed." },
  { q: "How do I know a property isn't a scam?", a: "Every listing on LANDGUARD undergoes strict document verification. Green 'Verified' badges mean the owner's identity and land title have been cross-checked with official government databases." },
  { q: "Can I rent or lease land through the platform?", a: "Absolutely. Use the 'Rent' toggle in the search bar to filter for lease-ready properties. Sellers can list with monthly rates, security deposits, and minimum lease terms." },
  { q: "Is my personal data secure?", a: "Yes. We use AES-256 encryption, comply with Ghana's Data Protection Act (Act 843), and never share your Ghana Card or financial details with unauthorized third parties." },
  { q: "What happens if I dispute a property?", a: "You can report any listing directly through the app. Our legal & compliance team reviews disputes, freezes disputed parcels, and coordinates with the Lands Commission for resolution." },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I'm the LANDGUARD AI Assistant. How can I help you today?" }
  ]);
  const [selectedVideo, setSelectedVideo] = useState(VIDEOS[0]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "Thank you for your question. I'm here to help you with LANDGUARD. This is a demo response - integrate with your AI backend."
      }] );
    }, 1000);

    setChatMessage("");
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

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
            <div className="hidden lg:flex desktop-nav items-center gap-8">
              <Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Buy/Rent</Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sell</Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Verify</Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Pricing</Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Resources</Link>
              <Link href="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Contact</Link>
              <Link href="/how-it-works" className="text-blue-600 font-medium cursor-pointer">How It Works</Link>
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
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Sell</Link>
                <Link href="/verify" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Verify</Link>
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Pricing</Link>
                <Link href="/resources" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Resources</Link>
                <Link href="/contact" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Contact</Link>
                <Link href="/how-it-works" className="block py-2 text-blue-600 font-medium cursor-pointer">How It Works</Link>
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
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/img/plotback.jpg" alt="Ghana Land Background" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Simple, Transparent & <span className="text-emerald-400">Secure</span>
              </h1>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
                Whether you're buying your first plot or listing a commercial property, LANDGUARD makes the process fast, verifiable, and legally binding.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Role-Based Interactive Steps */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="flex justify-center mb-12">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl inline-flex">
                <button onClick={() => setActiveTab("buyer")} className={`px-6 py-2.5 rounded-lg font-medium transition cursor-pointer ${activeTab === "buyer" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                  I'm a Buyer
                </button>
                <button onClick={() => setActiveTab("seller")} className={`px-6 py-2.5 rounded-lg font-medium transition cursor-pointer ${activeTab === "seller" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                  I'm a Seller
                </button>
              </div>
            </div>

            {/* Steps Grid */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(activeTab === "buyer" ? BUYER_STEPS : SELLER_STEPS).map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 relative">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold mb-4">
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Video Walkthroughs */}
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Video Tutorials</h2>
              <p className="text-slate-600 dark:text-slate-400">Watch quick, step-by-step guides to get started instantly.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {VIDEOS.map((vid, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 group"
                >
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-700">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.videoId}?rel=0&modestbranding=1`}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-t-2xl"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{vid.tag}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white mt-2">{vid.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{vid.duration}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Searchable FAQ */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              <div className="relative max-w-md mx-auto">
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search questions..." 
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
                <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left cursor-pointer">
                    <span className="font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )) : (
                <p className="text-center text-slate-500 py-8">No matching questions found. <Link href="/contact" className="text-blue-600 hover:underline cursor-pointer">Contact Support</Link></p>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 dark:bg-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of Ghanaians who trust LANDGUARD for secure, verified property transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/role-selection" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition cursor-pointer shadow-lg">Create Free Account</Link>
              <Link href="/contact" className="bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-400 transition cursor-pointer">Talk to an Agent</Link>
            </div>
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
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Share2 className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Globe className="w-5 h-5" /></a>
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
                <li className="flex items-start gap-2"><MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" /> Lands Commission HQ, Accra, Ghana</li>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
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
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none shadow"}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600 cursor-text"
                  />
                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

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