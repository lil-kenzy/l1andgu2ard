"use client";

import { Bell, Clock, Compass, Heart, Search, Sparkles, TrendingUp, Wallet, CheckCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

const QUICK_FILTERS = [
  { key: "available", label: "🟢 Available Now", param: "status=active" },
  { key: "building",  label: "🏠 With Building",  param: "hasBuilding=true" },
  { key: "verified",  label: "✅ Verified Sellers", param: "verified=true" },
];

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [landType, setLandType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (region) params.set("region", region);
    if (landType) params.set("category", landType);
    if (maxPrice) params.set("priceMax", maxPrice);
    router.push(`/buyer/map?${params.toString()}`);
  };

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Buyer Dashboard"
      subtitle="Welcome back. Track your property journey, review AI recommendations, and stay ahead with real-time activity updates."
      navItems={navItems}
      stats={[
        { label: "Saved Properties", value: "27", icon: Heart },
        { label: "New Matches", value: "14", icon: Sparkles },
        { label: "Unread Messages", value: "8", icon: Bell },
        { label: "Escrow in Progress", value: "2", icon: Wallet },
      ]}
      featureCards={[
        { title: "AI Recommendations", description: "Personalized picks based on your budget, location, and property type behavior.", icon: Compass },
        { title: "Market Signals", description: "Price movement and demand trends for areas in your watchlist.", icon: TrendingUp },
        { title: "Activity Feed", description: "See listing updates, owner responses, and verification status changes.", icon: Clock },
      ]}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">🔍 Search Properties</p>
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keywords or location…"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region (e.g. Accra)"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          <select
            value={landType}
            onChange={(e) => setLandType(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
          >
            <option value="">All Land Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="agricultural">Agricultural</option>
            <option value="industrial">Industrial</option>
          </select>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price (GHS)"
            type="number"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-blue-600 text-white px-6 py-2 text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_FILTERS.map(({ key, label, param }) => (
          <Link
            key={key}
            href={`/buyer/map?${param}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Quick Actions" subtitle="Jump into high-priority buyer workflows">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/buyer/map" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Explore map</Link>
            <Link href="/buyer/favorites" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Open favorites</Link>
            <Link href="/buyer/alerts" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Manage alerts</Link>
            <Link href="/buyer/messages" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Message center</Link>
          </div>
        </Panel>

        <Panel title="Recommended For You" subtitle="Generated from your saved searches and interactions">
          <ItemList
            items={[
              "East Legon: verified residential parcels under GHS 500k",
              "Airport Hills: high-demand plots with title certainty > 95%",
              "Tema Community 25: increasing inventory and better pricing",
            ]}
          />
        </Panel>

        <Panel title="Recent Activity" subtitle="Live feed from your account">
          <ItemList
            items={[
              "Viewed Cantonments parcel #GA-2301 18 minutes ago",
              "Seller replied to your inquiry on Labone listing",
              "Site visit scheduled for Saturday 10:30 AM",
            ]}
          />
        </Panel>
      </div>

      {/* Featured listings (glassmorphic) */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">⭐ Featured Listings</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: "1", title: "East Legon Residential", price: "GHS 450,000", loc: "Greater Accra", type: "Residential", verified: true },
            { id: "2", title: "Airport Commercial Lot", price: "GHS 820,000", loc: "Airport Hills", type: "Commercial", verified: true },
            { id: "4", title: "Kumasi Development Plot", price: "GHS 240,000", loc: "Ashanti Region", type: "Residential", verified: true },
            { id: "6", title: "Spintex Road Parcel", price: "GHS 275,000", loc: "Spintex, Accra", type: "Residential", verified: false },
          ].map((item) => (
            <Link
              key={item.id}
              href={`/buyer/property/${item.id}`}
              className="rounded-xl border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm p-4 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-sm"
            >
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">{item.type}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{item.title}</p>
              <p className="text-base font-extrabold text-blue-700 dark:text-blue-300">{item.price}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📍 {item.loc}</p>
              {item.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
