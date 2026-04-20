"use client";
import { ArrowUpRight, ChartNoAxesCombined, Funnel, MousePointerClick, Sparkles } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Profile", href: "/seller/profile" },
];

export default async function SellerAnalyticsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;

  return (
    <PortalShell
      portal="Seller Portal"
      title={`Listing Analytics #${propertyId}`}
      subtitle="Monitor views over time, traffic channels, conversion funnel, and price intelligence for this listing."
      navItems={navItems}
      stats={[
        { label: "Total Views", value: "1,204", icon: ChartNoAxesCombined },
        { label: "CTR", value: "8.2%", icon: MousePointerClick },
        { label: "Qualified Leads", value: "31", icon: Funnel },
        { label: "Price Score", value: "A-", icon: Sparkles },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Views Over Time" subtitle="Daily trend chart placeholder">
            <div className="h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30" />
          </Panel>
          <Panel title="Traffic Sources" subtitle="Origin of listing visits">
            <ItemList items={["Map explorer: 44%", "Search results: 31%", "Direct share links: 17%", "External referrals: 8%"]} />
          </Panel>
        </div>

        <Panel title="Conversion Funnel" subtitle="From views to offers">
          <ItemList items={["Views: 1,204", "Saved: 176", "Inquiries: 49", "Offers: 7"]} />
          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <ArrowUpRight className="w-4 h-4 mt-0.5" />
            AI Price Insight: Increase visibility with a 4% promotional pricing adjustment.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
