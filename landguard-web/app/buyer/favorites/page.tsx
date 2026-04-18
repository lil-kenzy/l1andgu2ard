import Link from "next/link";
import { Download, Heart, Scale, Bell, Grid3X3, FileText } from "lucide-react";
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

export default function BuyerFavoritesPage() {
  return (
    <PortalShell
      portal="Buyer Portal"
      title="Saved Properties & Favorites"
      subtitle="Organize saved lands, compare options side-by-side, and export shortlist reports."
      navItems={navItems}
      stats={[
        { label: "Saved Parcels", value: "27", icon: Heart },
        { label: "Active Price Alerts", value: "11", icon: Bell },
        { label: "Comparison Sets", value: "4", icon: Scale },
        { label: "Exported Reports", value: "6", icon: FileText },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Saved Lands Grid" subtitle="Favorites grouped by location and intent">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {["East Legon - Residential plot", "Airport Hills - Mixed-use parcel", "Tema Comm. 25 - Title ready", "Kasoa Junction - High-growth zone"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between gap-2">
                  <span>{item}</span>
                  <Link href="/buyer/property/1" className="text-blue-600 dark:text-blue-400">Open</Link>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Tools" subtitle="Compare, alert, and export">
          <ItemList items={["Comparison tool with up to 5 parcels", "Automatic price-drop monitoring", "Watermarked PDF export for offline review"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"><Scale className="w-4 h-4" />Compare selected</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Export PDF</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Grid3X3 className="w-4 h-4" />Create board</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
