"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Phone, MapPin, MessageCircle, Send, Clock, Users,
  AlertTriangle, CheckCircle, Menu, X as XIcon, MessageSquare,
  HeadphonesIcon, FileText, HelpCircle, ExternalLink
} from "lucide-react";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    subject: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I'm here to help with any questions about LANDGUARD. How can I assist you today?" }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "I can help you with account issues, technical support, or general inquiries. For urgent matters, please call our hotline."
      }]);
    }, 1000);
    setChatMessage("");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    }, 1000);
  };

  const officeLocations = [
    {
      city: "Accra",
      address: "Lands Commission Headquarters, Ministries, Accra, Ghana",
      phone: "+233 30 200 0000",
      email: "accra@landguard.gov.gh",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM",
      coordinates: [5.6037, -0.1869]
    },
    {
      city: "Kumasi",
      address: "Ashanti Regional Lands Commission Office, Kumasi, Ghana",
      phone: "+233 32 200 0000",
      email: "kumasi@landguard.gov.gh",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM",
      coordinates: [6.7470, -1.6731]
    },
    {
      city: "Takoradi",
      address: "Western Regional Lands Commission Office, Takoradi, Ghana",
      phone: "+233 31 200 0000",
      email: "takoradi@landguard.gov.gh",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM",
      coordinates: [4.9123, -1.7739]
    }
  ];

  const supportCategories = [
    {
      icon: HelpCircle,
      title: "General Inquiry",
      description: "Questions about LANDGUARD platform and services",
      response: "Within 24 hours"
    },
    {
      icon: Users,
      title: "Account Support",
      description: "Login issues, profile updates, verification help",
      response: "Within 4 hours"
    },
    {
      icon: AlertTriangle,
      title: "Fraud Report",
      description: "Report suspicious land listings or transactions",
      response: "Immediate attention"
    },
    {
      icon: FileText,
      title: "Legal Support",
      description: "Document verification and legal questions",
      response: "Within 48 hours"
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      description: "App crashes, bugs, feature requests",
      response: "Within 12 hours"
    }
  ];

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
            <div className="hidden md:flex items-center gap-8">
              <Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Buy/Rent</Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sell</Link>
              <Link href="/verify" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Verify</Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Pricing</Link>
              <Link href="/resources" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Resources</Link>
              <Link href="/contact" className="text-blue-600 font-medium cursor-pointer">Contact</Link>
              <Link href="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">How It Works</Link>
              <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">About</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/sign-in" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sign In</Link>
              <Link href="/auth/role-selection" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium">Get Started</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 cursor-pointer text-slate-600 dark:text-slate-300">
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
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Pricing</Link>
                <Link href="/resources" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Resources</Link>
                <Link href="/contact" className="block py-2 text-blue-600 font-medium cursor-pointer">Contact</Link>
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
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <MessageSquare className="w-4 h-4" /> Get In Touch
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                We're Here to
                <span className="text-blue-600 dark:text-blue-400"> Help</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                Have questions about land ownership, need technical support, or want to report fraud? Our team is ready to assist you.
              </p>

              {/* Emergency Hotline */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 font-bold">Emergency Fraud Hotline</span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">+233 30 200 0000</div>
                <p className="text-red-600 dark:text-red-300 text-sm">24/7 Emergency Support for Fraud Reports</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How Can We Help?</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Choose the type of support you need and we'll connect you with the right team.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                    <category.icon className={`w-6 h-6 ${index === 2 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} group-hover:text-white transition`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{category.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{category.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Response: {category.response}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Office Locations */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Contact Form */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactForm.category}
                        onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="account">Account Support</option>
                        <option value="technical">Technical Support</option>
                        <option value="fraud">Report Fraud</option>
                        <option value="legal">Legal Support</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message *</label>
                    <textarea
                      rows={5}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Please describe your question or issue in detail..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    {formSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Message Sent Successfully!
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Office Locations & Contact Info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Visit Our Offices</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8">
                  Meet our team in person or call us directly for immediate assistance.
                </p>

                <div className="space-y-6">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{office.city} Office</h3>
                          <p className="text-slate-600 dark:text-slate-300 mb-3">{office.address}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">{office.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">{office.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">{office.hours}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Contact Methods */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Other Ways to Reach Us</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Live Chat</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Available 24/7 for instant support</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Help Center</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Browse FAQs and tutorials</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Emergency Hotline</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">For urgent fraud reports</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><MessageSquare className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><MessageSquare className="w-5 h-5" /></a>
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
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/contact" className="hover:text-blue-600 cursor-pointer">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-blue-600 cursor-pointer">Help Center</Link></li>
                <li><Link href="/resources" className="hover:text-blue-600 cursor-pointer">Resources</Link></li>
                <li><Link href="/status" className="hover:text-blue-600 cursor-pointer">System Status</Link></li>
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
                  <div><h3 className="font-semibold">LANDGUARD Support</h3><p className="text-xs text-blue-100">Online</p></div>
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
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="How can we help you?" className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600" />
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