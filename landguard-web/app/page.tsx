"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/lib/auth/session";
import { 
  Search, Shield, MapPin, CheckCircle,
  Smartphone, Home, FileCheck, Users,
  Star, ChevronRight, MessageCircle, X,
  Send, Menu, ChevronDown, Key, Share2, Mail, Phone,
  SlidersHorizontal, Globe
} from "lucide-react";

// Mock featured properties (Updated with both Sale & Rent)
const FEATURED_PROPERTIES = [
  {
    id: 1,
    location: "East Legon, Accra",
    gpsAddress: "GA-123-4567",
    type: "sale", // Changed from status
    price: "GHS 450,000",
    size: "0.25 acres",
    category: "Residential",
    verified: true,
  },
  {
    id: 2,
    location: "Airport Residential, Accra",
    gpsAddress: "GA-890-1234",
    type: "rent",
    price: "GHS 15,000 / month",
    size: "0.4 acres",
    category: "Commercial",
    verified: true,
  },
  {
    id: 3,
    location: "Sakumono, Tema",
    gpsAddress: "MA-345-6789",
    type: "sale",
    price: "GHS 320,000",
    size: "0.18 acres",
    category: "Residential",
    verified: true,
  },
];

const STATS = [
  { label: "Verified Properties", value: "142,000+", icon: CheckCircle },
  { label: "Fraud Cases Prevented", value: "8,500+", icon: Shield },
  { label: "Active Buyers & Tenants", value: "500,000+", icon: Users },
  { label: "Regions Covered", value: "16/16", icon: MapPin },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Government Verified",
    description: "Every property cross-checked with Lands Commission databases"
  },
  {
    icon: MapPin,
    title: "GhanaPostGPS Integrated",
    description: "Precise digital addresses and boundary mapping"
  },
  {
    icon: FileCheck,
    title: "Document Authentication",
    description: "AI-powered verification of land titles and deeds"
  }
];

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [transactionType, setTransactionType] = useState<'buy' | 'rent'>('buy');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I'm the LANDGUARD AI Assistant. How can I help you today?" }
  ]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const searchParams = new URLSearchParams();
      searchParams.append("q", searchQuery);
      searchParams.append("type", transactionType);
      if (selectedRegion) searchParams.append("region", selectedRegion);
      if (propertyType) searchParams.append("propertyType", propertyType);
      router.push(`/search?${searchParams.toString()}`);
    }
  };

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

  const handlePropertyOpen = (propertyId: string | number) => {
    const { token, role } = getClientSession();

    if (token && role === "buyer") {
      router.push(`/buyer/property/${propertyId}`);
      return;
    }

    router.push("/auth/login?role=buyer");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with ALWAYS VISIBLE Text */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image 
                src="/img/logo.jpg" 
                alt="LANDGUARD Logo" 
                width={40} 
                height={40} 
                className="object-contain"
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
              <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">
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
                <Link href="/about" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">
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

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="/img/background.jpg" 
            alt="Ghana Land Landscape"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Updated Headline for Buy or Rent */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Buy or Rent Land Safely in Ghana<br />
              <span className="text-emerald-400">Without Disputes</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              Ghana&apos;s official land registry platform. Search verified properties for purchase or lease, confirm ownership instantly, 
              and transact with government-backed security.
            </p>
          </motion.div>

          {/* Search Bar with Advanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-white/20">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center px-4 py-3 bg-white/5 rounded-xl">
                  <Search className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by location or GhanaPostGPS address..."
                    className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 cursor-text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition cursor-pointer border border-white/20">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                <Link 
                  href="/search"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer"
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:inline">Search All</span>
                </Link>
                <Link 
                  href={`/search?q=${encodeURIComponent(searchQuery)}&type=${transactionType}${selectedRegion ? `&region=${encodeURIComponent(selectedRegion)}` : ''}${propertyType ? `&propertyType=${propertyType}` : ''}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
              </div>

              {/* Expandable Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-3 pt-3 border-t border-white/20">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Transaction Type</label>
                        <div className="relative">
                          <select value={transactionType} onChange={(e) => setTransactionType(e.target.value as 'buy' | 'rent')} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
                            <option value="buy" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">For Sale</option>
                            <option value="rent" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">For Rent</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-300 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Region</label>
                        <div className="relative">
                          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
                            <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Regions</option>
                            {REGIONS.map(region => <option key={region} value={region} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{region}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-300 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Property Type</label>
                        <div className="relative">
                          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
                            <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Types</option>
                            <option value="residential" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Residential</option>
                            <option value="commercial" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Commercial</option>
                            <option value="vacant" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Vacant Land</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={() => setTransactionType('buy')} className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${transactionType === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <Home className="w-4 h-4 inline mr-1" /> For Sale
              </button>
              <button onClick={() => setTransactionType('rent')} className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${transactionType === 'rent' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <Key className="w-4 h-4 inline mr-1" /> For Rent
              </button>
            </div>

            {/* Popular Search Tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
              <span className="text-gray-400">Popular:</span>
              {['Accra', 'Tema', 'Kumasi', 'East Legon', 'Cantonments'].map(loc => (
                <Link 
                  key={loc} 
                  href={`/search?q=${encodeURIComponent(loc)}&type=${transactionType}`}
                  className="text-white hover:text-emerald-400 transition cursor-pointer hover:underline"
                >
                  {loc}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-300"
          >
            {[
              { icon: CheckCircle, text: "Government Verified" },
              { icon: Shield, text: "Zero Fraud Guarantee" },
              { icon: Star, text: "Free to Browse" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties - Updated for Buy/Rent */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Featured Properties
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Hand-picked, government-verified lands ready for purchase or lease
              </p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:underline cursor-pointer">
              View All Properties <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_PROPERTIES.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => handlePropertyOpen(property.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePropertyOpen(property.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer group"
              >
                <div className="relative h-64 bg-linear-to-br from-blue-100 to-emerald-100 dark:from-slate-700 dark:to-slate-600">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Home className="w-16 h-16" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  {/* Dynamic Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      property.type === 'rent' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {property.price}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mb-3">
                    {property.location}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {property.gpsAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {property.size} • {property.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePropertyOpen(property.id);
                      }}
                      className="text-blue-600 font-semibold hover:underline text-sm cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/search" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline cursor-pointer">
              View All Properties <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose LANDGUARD?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Built on trust, powered by technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Buy or Rent Land Safely?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of Ghanaians who trust LANDGUARD for secure, verified property transactions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register?role=buyer"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition cursor-pointer shadow-lg"
            >
              Start Browsing Properties
            </Link>
            <Link 
              href="/auth/register?role=seller"
              className="bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-400 transition cursor-pointer"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile App Download */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Download the LANDGUARD App
              </h3>
              <p className="text-slate-300 mb-6 max-w-md">
                Get instant notifications, save searches, and access verified properties on the go
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" 
                   className="bg-white text-slate-900 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-100 transition cursor-pointer">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.05-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.39 2.83zM13 3.5c.73-.83 1.21-1.98 1.08-3.12-1.06.05-2.35.71-3.11 1.57-.68.78-1.28 2.02-1.12 3.15 1.2.09 2.41-.77 3.15-1.6z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold leading-tight">App Store</div>
                  </div>
                </a>
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" 
                   className="bg-white text-slate-900 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-100 transition cursor-pointer">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5V3.5c0-.83.48-1.59 1.23-1.94l10.5 6.94-10.5 6.94C4.48 18.09 4 17.33 4 20.5zm12.73-5.23L5.27 22l10.46-6.73zm0-3.54L5.27 2l10.46 6.73zM6.77 11.23L16.5 17.5 20.23 12 16.5 6.5 6.77 11.23z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            <Smartphone className="w-48 h-48 text-blue-400 opacity-50 hidden md:block" />
          </div>
        </div>
      </section>

      {/* Footer */}
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
                Ghana&apos;s official national land registry platform. Eliminating fraud through verified ownership and transparent transactions.
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
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>support@landguard.gov.gh</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>+233 30 200 0000</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
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