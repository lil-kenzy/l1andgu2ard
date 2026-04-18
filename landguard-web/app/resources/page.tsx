"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Video, FileText, Download, Search, Filter,
  Calendar, User, Play, ExternalLink, ChevronDown, ChevronRight,
  Menu, X as XIcon, Mail, Phone, MapPin, MessageCircle, Send,
  Shield, Award, Globe, Star
} from "lucide-react";

export default function ResourcesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I can help you find resources about land ownership, legal frameworks, and LANDGUARD features. What are you looking for?" }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "I can help you find guides on land verification, legal documents, or video tutorials. Try searching above or browse our categories!"
      }]);
    }, 1000);
    setChatMessage("");
  };

  const guides = [
    {
      id: 1,
      title: "How to Verify Land Ownership in Ghana",
      description: "Complete guide to checking land titles, deeds, and ownership records through official channels.",
      category: "verification",
      type: "guide",
      downloadUrl: "#",
      fileSize: "2.4 MB",
      pages: 24
    },
    {
      id: 2,
      title: "Understanding GhanaPost GPS Addresses",
      description: "Learn how digital addressing works and how to use GhanaPost GPS for accurate land location.",
      category: "technical",
      type: "guide",
      downloadUrl: "#",
      fileSize: "1.8 MB",
      pages: 16
    },
    {
      id: 3,
      title: "Land Transaction Safety Checklist",
      description: "Essential steps to protect yourself from land fraud during buying or selling.",
      category: "safety",
      type: "checklist",
      downloadUrl: "#",
      fileSize: "890 KB",
      pages: 8
    },
    {
      id: 4,
      title: "Seller Verification Requirements",
      description: "Complete list of documents needed for seller verification on LANDGUARD.",
      category: "verification",
      type: "guide",
      downloadUrl: "#",
      fileSize: "1.2 MB",
      pages: 12
    }
  ];

  const legalFrameworks = [
    {
      title: "Lands Act, 2020 (Act 1036)",
      description: "The comprehensive land law governing land administration in Ghana.",
      summary: "This Act provides for the administration of stool, skin, family, and individual lands in Ghana.",
      keyPoints: [
        "Establishes the Lands Commission",
        "Provides for land registration and titling",
        "Regulates land transactions and transfers",
        "Addresses customary land rights"
      ]
    },
    {
      title: "Data Protection Act, 2012 (Act 843)",
      description: "Ghana's data protection and privacy law affecting land data handling.",
      summary: "Regulates the processing of personal data and protects individual privacy rights.",
      keyPoints: [
        "Right to privacy and data protection",
        "Consent requirements for data processing",
        "Data security obligations",
        "Individual rights regarding personal data"
      ]
    },
    {
      title: "Ghana Investment Promotion Centre Act",
      description: "Framework for investment in land and property development.",
      summary: "Provides incentives and regulations for land-based investments in Ghana.",
      keyPoints: [
        "Investment incentives for land development",
        "Foreign ownership regulations",
        "Environmental impact requirements",
        "Development permit procedures"
      ]
    }
  ];

  const videos = [
    {
      id: 1,
      title: "LANDGUARD Platform Overview",
      description: "Complete walkthrough of how to use LANDGUARD for buying and selling land safely.",
      duration: "8:32",
      thumbnail: "/img/video-thumb-1.jpg",
      category: "tutorial"
    },
    {
      id: 2,
      title: "How to Verify Property Documents",
      description: "Step-by-step guide to checking land titles and ownership documents.",
      duration: "12:15",
      thumbnail: "/img/video-thumb-2.jpg",
      category: "verification"
    },
    {
      id: 3,
      title: "Seller Verification Process",
      description: "What documents you need and how to get verified as a seller on LANDGUARD.",
      duration: "6:48",
      thumbnail: "/img/video-thumb-3.jpg",
      category: "tutorial"
    }
  ];

  const newsArticles = [
    {
      id: 1,
      title: "LANDGUARD Successfully Prevents 500 Land Fraud Cases",
      excerpt: "The national land registry platform has helped prevent fraudulent land transactions worth over ₵50 million.",
      date: "2024-01-15",
      category: "success",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "New Digital Addressing System Launched Nationwide",
      excerpt: "GhanaPost GPS addresses now mandatory for all land transactions across the country.",
      date: "2024-01-10",
      category: "policy",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Lands Commission Partners with LANDGUARD for Fraud Prevention",
      excerpt: "Official partnership announced to integrate government land records with the platform.",
      date: "2024-01-05",
      category: "partnership",
      readTime: "2 min read"
    }
  ];

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Pricing</Link>
              <Link href="/resources" className="text-blue-600 font-medium cursor-pointer">Resources</Link>
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
                <Link href="/pricing" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Pricing</Link>
                <Link href="/resources" className="block py-2 text-blue-600 font-medium cursor-pointer">Resources</Link>
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
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" /> Knowledge Center
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                Learn About Land
                <span className="text-blue-600 dark:text-blue-400"> Ownership</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                Comprehensive guides, legal frameworks, video tutorials, and the latest news about land ownership and transactions in Ghana.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search guides, videos, legal frameworks..."
                    className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 py-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Downloadable Guides */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Downloadable Guides</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Free comprehensive guides to help you navigate land ownership and transactions safely.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { id: "all", label: "All Guides", icon: BookOpen },
                { id: "verification", label: "Verification", icon: Shield },
                { id: "technical", label: "Technical", icon: Globe },
                { id: "safety", label: "Safety", icon: Award }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Guides Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredGuides.map((guide) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      guide.category === 'verification' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                      guide.category === 'technical' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      {guide.type === 'guide' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{guide.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">{guide.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{guide.pages} pages</span>
                    <span>{guide.fileSize}</span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Download PDF
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal Frameworks */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Legal Frameworks</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Understanding the laws that govern land ownership and transactions in Ghana.
              </p>
            </div>

            <div className="space-y-8">
              {legalFrameworks.map((framework, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{framework.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">{framework.description}</p>
                      <p className="text-slate-700 dark:text-slate-200 font-medium mb-4">{framework.summary}</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {framework.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Video Tutorials</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Step-by-step video guides to help you navigate LANDGUARD and understand land transactions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer"
                >
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{video.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{video.category}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* News & Updates */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Latest News & Updates</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Stay informed about land policy changes, platform updates, and success stories.
              </p>
            </div>

            <div className="space-y-6">
              {newsArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.category === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          article.category === 'policy' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                          {article.category}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{article.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(article.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          LANDGUARD Team
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition flex-shrink-0" />
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
                View All News <ChevronRight className="w-4 h-4" />
              </Link>
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
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/resources" className="hover:text-blue-600 cursor-pointer">All Resources</Link></li>
                <li><Link href="/resources/guides" className="hover:text-blue-600 cursor-pointer">Guides</Link></li>
                <li><Link href="/resources/videos" className="hover:text-blue-600 cursor-pointer">Videos</Link></li>
                <li><Link href="/resources/legal" className="hover:text-blue-600 cursor-pointer">Legal Framework</Link></li>
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
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Ask about resources..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600" />
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