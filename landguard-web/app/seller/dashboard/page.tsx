import Link from "next/link";
import { AlertTriangle, BarChart3, Clock3, FileCheck2, Plus, Wallet } from "lucide-react";
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

export default function SellerDashboardPage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Seller Dashboard"
      subtitle="Monitor listing performance, revenue trends, and document readiness from one control center."
      navItems={navItems}
      stats={[
        { label: "Active Listings", value: "18", icon: FileCheck2 },
        { label: "Monthly Revenue", value: "GHS 98k", icon: Wallet },
        { label: "Inquiries", value: "73", icon: BarChart3 },
        { label: "Expiring Docs", value: "3", icon: AlertTriangle },
      ]}
      featureCards={[
        { title: "Revenue Chart", description: "Weekly and monthly trend snapshots for your listed properties.", icon: Wallet },
        { title: "Expiry Alerts", description: "Track title, permit, and compliance document deadlines.", icon: Clock3 },
        { title: "Quick Publishing", description: "Launch new listings with stepwise review and verification.", icon: Plus },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Quick Actions" subtitle="High impact tasks">
          <div className="grid gap-2 text-sm">
            <Link href="/seller/list-property" className="rounded-lg bg-blue-600 text-white py-2 text-center hover:bg-blue-700 transition">Create new listing</Link>
            <Link href="/seller/listings" className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition">Manage listings</Link>
            <Link href="/seller/documents" className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition">Update documents</Link>
          </div>
        </Panel>

        <Panel title="Performance Highlights" subtitle="Top listing momentum">
          <ItemList items={["Airport Hills Plot: 1,204 views, 22 inquiries", "East Legon Land: CTR +14% this week", "Tema Parcel: 3 active offers"]} />
        </Panel>

        <Panel title="Compliance Status" subtitle="Verification and readiness">
          <ItemList items={["15 listings fully verified", "2 listings pending survey upload", "1 listing awaiting permit renewal"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}