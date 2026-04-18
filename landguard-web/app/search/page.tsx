"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getClientSession } from "@/lib/auth/session";
import {
  Search, MapPin, Filter, Home, Key, CheckCircle,
  Menu, X, Mail, Phone, Share2, Globe, MessageCircle,
  Send, ChevronDown, SlidersHorizontal, Grid, List,
  Heart, Eye, ArrowRight, Shield, DollarSign, Maximize2
} from "lucide-react";

// Mock properties data - TEMPORARY for development
// This will be removed once backend is implemented
const MOCK_PROPERTIES = [
  {
    id: 1,
    location: "East Legon, Accra",
    gpsAddress: "GA-123-4567",
    type: "sale",
    price: "GHS 450,000",
    size: "0.25 acres",
    category: "Residential",
    verified: true,
    image: "/img/land.jpg",
    views: 234,
    saved: 12
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
    image: "/img/land.jpg",
    views: 189,
    saved: 8
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
    image: "/img/land.jpg",
    views: 156,
    saved: 15
  },
  {
    id: 4,
    location: "Cantonments, Accra",
    gpsAddress: "GA-456-7890",
    type: "sale",
    price: "GHS 850,000",
    size: "0.5 acres",
    category: "Commercial",
    verified: true,
    image: "/img/land.jpg",
    views: 312,
    saved: 24
  },
  {
    id: 5,
    location: "Labone, Accra",
    gpsAddress: "GA-234-5678",
    type: "rent",
    price: "GHS 8,500 / month",
    size: "0.3 acres",
    category: "Residential",
    verified: false,
    image: "/img/land.jpg",
    views: 98,
    saved: 6
  },
  {
    id: 6,
    location: "Spintex Road, Accra",
    gpsAddress: "GA-567-8901",
    type: "sale",
    price: "GHS 275,000",
    size: "0.15 acres",
    category: "Residential",
    verified: true,
    image: "/img/land.jpg",
    views: 145,
    saved: 9
  },
];

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", message: "Hello! I'm the LANDGUARD AI Assistant. How can I help you find the perfect property today?" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "sale" | "rent">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // API State
  const [properties, setProperties] = useState<typeof MOCK_PROPERTIES>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize search from URL parameters
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const region = searchParams.get('region');
    const propType = searchParams.get('propertyType');
    
    if (query) {
      setSearchQuery(query);
    }
    
    if (type && (type === 'buy' || type === 'rent')) {
      setTransactionType(type === 'buy' ? 'sale' : 'rent');
    }

    if (region) {
      setSelectedRegion(region);
    }

    if (propType) {
      setPropertyType(propType);
    }
  }, [searchParams]);

  /**
   * Fetch properties from the backend API
   * URL: /api/properties
   * Query Parameters:
   *   - q: search query (location, gpsAddress)
   *   - type: transaction type (all, sale, rent)
   *   - region: selected region
   *   - propertyType: property type filter
   *   - limit: number of properties to fetch (default: 50)
   *   - page: pagination page (default: 1)
   * 
   * Expected Backend Response:
   * {
   *   success: boolean,
   *   data: Array<{
   *     id: string,
   *     location: string,
   *     gpsAddress: string,
   *     type: "sale" | "rent",
   *     price: string,
   *     size: string,
   *     category: string,
   *     verified: boolean,
   *     image: string,
   *     views: number,
   *     saved: number,
   *     // other fields...
   *   }>,
   *   total: number,
   *   message?: string
   * }
   */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (transactionType !== 'all') params.append('type', transactionType);
      if (selectedRegion) params.append('region', selectedRegion);
      if (propertyType) params.append('propertyType', propertyType);
      params.append('limit', '50');
      params.append('page', '1');

      // Call your backend API
      const response = await fetch(`/api/properties?${params.toString()}`);

      if (!response.ok) {
        // If API returns 404 or other error, use mock data instead of throwing
        console.info('Backend API not available, using mock data');
        setProperties(MOCK_PROPERTIES);
        return;
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setProperties(data.data);
      } else {
        // Fallback to mock data if API response format is unexpected
        console.info('API response format unexpected, using mock data');
        setProperties(MOCK_PROPERTIES);
      }
    } catch (err) {
      // Handle network errors gracefully during development
      console.info('Using mock data (API not available during development)');
      setProperties(MOCK_PROPERTIES);
      setError(null); // Don't show error to user
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties when search/filter parameters change
  useEffect(() => {
    fetchProperties();
  }, [searchQuery, transactionType, selectedRegion, propertyType]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        message: "I can help you search for properties! Use the filters above to narrow down your search by location, price, and property type."
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

  const filteredProperties = properties.filter((property) => {
    if (transactionType === "all") return true;
    return property.type === transactionType;
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
            <div className="hidden lg:flex desktop-nav items-center gap-8">
              <Link href="/search" className="text-blue-600 font-medium cursor-pointer">Buy/Rent</Link>
              <Link href="/sell" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer font-medium">Sell</Link>
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
                <Link href="/search" className="block py-2 text-blue-600 font-medium cursor-pointer">Buy/Rent</Link>
                <Link href="/sell" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer font-medium">Sell</Link>
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

      {/* ========== MAIN CONTENT ========== */}
      <main className="grow">
        {/* Hero Search Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden bg-linear-to-br from-blue-600 to-emerald-600">
          <div className="absolute inset-0 opacity-20">
            <Image src="/img/background.jpg" alt="Background" fill className="object-cover" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Perfect Property</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">Browse verified lands and properties across Ghana. Search by location, GhanaPostGPS address, or region.</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by location or GhanaPostGPS address..."
                      className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-gray-500 text-sm md:text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-500 transition cursor-pointer font-medium text-sm md:text-base">
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                  <button 
                    onClick={() => {
                      const resultsSection = document.getElementById('results-section');
                      if (resultsSection) {
                        resultsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }} 
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer font-medium text-sm md:text-base"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setTransactionType("all");
                      setSelectedRegion("");
                      setPropertyType("");
                    }} 
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer font-medium text-sm md:text-base"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="hidden sm:inline">All</span>
                  </button>
                </div>

                {/* Expandable Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transaction Type</label>
                          <select 
                            value={transactionType} 
                            onChange={(e) => setTransactionType(e.target.value as any)} 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-slate-900 dark:text-white appearance-none cursor-pointer font-medium transition"
                          >
                            <option value="all" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">All Properties</option>
                            <option value="sale" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">For Sale</option>
                            <option value="rent" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">For Rent</option>
                          </select>
                          <style jsx>{`
                            select {
                              background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                              background-repeat: no-repeat;
                              background-position: right 0.75rem center;
                              background-size: 1.25rem;
                              padding-right: 2.5rem;
                            }
                          `}</style>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Region</label>
                          <select 
                            value={selectedRegion} 
                            onChange={(e) => setSelectedRegion(e.target.value)} 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-slate-900 dark:text-white appearance-none cursor-pointer font-medium transition"
                          >
                            <option value="" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">All Regions</option>
                            {REGIONS.map(region => <option key={region} value={region} className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{region}</option>)}
                          </select>
                          <style jsx>{`
                            select {
                              background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                              background-repeat: no-repeat;
                              background-position: right 0.75rem center;
                              background-size: 1.25rem;
                              padding-right: 2.5rem;
                            }
                          `}</style>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Type</label>
                          <select 
                            value={propertyType} 
                            onChange={(e) => setPropertyType(e.target.value)} 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-slate-900 dark:text-white appearance-none cursor-pointer font-medium transition"
                          >
                            <option value="" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">All Types</option>
                            <option value="residential" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">Residential</option>
                            <option value="commercial" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">Commercial</option>
                            <option value="vacant" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">Vacant Land</option>
                          </select>
                          <style jsx>{`
                            select {
                              background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                              background-repeat: no-repeat;
                              background-position: right 0.75rem center;
                              background-size: 1.25rem;
                              padding-right: 2.5rem;
                            }
                          `}</style>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Filters */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
                <button onClick={() => setTransactionType("sale")} className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${transactionType === "sale" ? "bg-emerald-500 text-white shadow-md" : "bg-white/20 text-white hover:bg-white/30"}`}>
                  <Home className="w-4 h-4 inline mr-2" /> For Sale
                </button>
                <button onClick={() => setTransactionType("rent")} className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${transactionType === "rent" ? "bg-amber-500 text-white shadow-md" : "bg-white/20 text-white hover:bg-white/30"}`}>
                  <Key className="w-4 h-4 inline mr-2" /> For Rent
                </button>
                <button onClick={() => setTransactionType("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${transactionType === "all" ? "bg-blue-500 text-white shadow-md" : "bg-white/20 text-white hover:bg-white/30"}`}>
                  View All
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results-section" className="py-12 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {filteredProperties.length} Properties Found
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  Showing {transactionType === "all" ? "all" : transactionType} properties{selectedRegion && ` in ${selectedRegion}`}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">View:</span>
                <div className="inline-flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
                  <button 
                    onClick={() => setViewMode("grid")} 
                    className={`p-2 rounded-md transition cursor-pointer font-medium ${viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    title="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")} 
                    className={`p-2 rounded-md transition cursor-pointer font-medium ${viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                    <div className="h-64 bg-slate-200 dark:bg-slate-700" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePropertyOpen(property.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePropertyOpen(property.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer group ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""}`}
                >
                  {/* Image */}
                  <div className={`relative ${viewMode === "list" ? "w-full sm:w-64 shrink-0 h-48 sm:h-auto" : "h-64"} bg-linear-to-br from-blue-100 to-emerald-100 dark:from-slate-700 dark:to-slate-600`}>
                    <Image src={property.image} alt={property.location} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.type === "rent" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>
                        {property.type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    </div>
                    {property.verified && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-white transition cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-white transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{property.price}</div>
                      <div className="text-slate-600 dark:text-slate-400 font-medium mb-3">{property.location}</div>
                      <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 shrink-0" /> {property.gpsAddress}</span>
                        <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4 shrink-0" /> {property.size} • {property.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700 gap-3">
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {property.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {property.saved}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyOpen(property.id);
                        }}
                        className="text-blue-600 font-semibold hover:underline text-sm cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
                <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredProperties.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No properties found</h3>
                <p className="text-slate-600 dark:text-slate-400">Try adjusting your search filters or browse all properties.</p>
                <button onClick={() => { setSearchQuery(""); setSelectedRegion(""); setTransactionType("all"); setPropertyType(""); }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {!loading && filteredProperties.length > 0 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer">
                  Load More Properties
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 dark:bg-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Want Full Access to Property Details?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Create a free account to view complete property information, contact verified sellers, and save your favorite listings.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/role-selection" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition cursor-pointer shadow-lg">Create Free Account</Link>
              <Link href="/verify" className="bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-400 transition cursor-pointer">Verify a Property</Link>
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
                <li><Link href="/search" className="hover:text-blue-600 cursor-pointer">Buy/Rent Property</Link></li>
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
                <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /> support@landguard.gov.gh</li>
                <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" /> +233 30 200 0000</li>
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> Lands Commission HQ, Accra, Ghana</li>
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
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">LANDGUARD Assistant</h3>
                    <p className="text-xs text-blue-100">Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
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
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type your question..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-600" />
                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer">
                    <Send className="w-5 h-5" />
                  </button>
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