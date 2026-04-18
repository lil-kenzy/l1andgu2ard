import { Bell, Clock, Compass, Heart, Search, Sparkles, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
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

export default function BuyerDashboardPage() {
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

      <div className="mt-4">
        <Panel title="Smart Search Starter" subtitle="Use quick search tokens to narrow down opportunities">
          <div className="flex flex-wrap gap-2 text-sm">
            {["verified only", "freehold", "title deed", "near schools", "mortgage eligible"].map((token) => (
              <button key={token} className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:opacity-90">
                {token}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Search className="w-4 h-4" />
            Saved search automation will notify you when matching properties are published.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
